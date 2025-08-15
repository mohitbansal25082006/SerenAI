import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { generateChatResponse } from "@/lib/openai";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user data for personalization
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [moodRecords, journalEntries, conversations] = await Promise.all([
      prisma.moodRecord.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.journalEntry.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.conversation.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: thirtyDaysAgo },
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Calculate average mood
    const avgMood = moodRecords.length > 0
      ? moodRecords.reduce((sum, record) => sum + record.mood, 0) / moodRecords.length
      : 5;

    // Prepare data for AI analysis
    const moodData = moodRecords.map(record => ({
      date: record.createdAt.toISOString().split('T')[0],
      mood: record.mood,
      note: record.note,
    }));

    const journalData = journalEntries.map(entry => ({
      date: entry.createdAt.toISOString().split('T')[0],
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags,
    }));

    const chatData = conversations.map(conv => ({
      date: conv.createdAt.toISOString().split('T')[0],
      messages: conv.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    }));

    // Generate therapy plan using AI
    const prompt = `Based on the following user data from the last 30 days, create a personalized mental wellness therapy plan. 
    The user's average mood is ${avgMood.toFixed(1)} out of 10.
    
    Mood Data: ${JSON.stringify(moodData.slice(0, 10))}
    
    Journal Data: ${JSON.stringify(journalData.slice(0, 5))}
    
    Chat Data: ${JSON.stringify(chatData.slice(0, 3))}
    
    Create a comprehensive therapy plan that includes:
    1. A title for the therapy plan
    2. A brief description of the plan
    3. 3-5 specific goals for the user to work on
    4. 5-7 recommended activities or exercises
    5. 3-5 helpful resources (books, articles, videos, etc.)
    6. A recommended duration in days (between 14 and 90 days)
    
    Return your response as a JSON object with the following structure:
    {
      "title": "Title of the therapy plan",
      "description": "Brief description of the plan",
      "goals": ["Goal 1", "Goal 2", "Goal 3"],
      "activities": ["Activity 1", "Activity 2", "Activity 3"],
      "resources": ["Resource 1", "Resource 2", "Resource 3"],
      "duration": 30
    }`;

    const aiResponse = await generateChatResponse([
      { role: "user", content: prompt }
    ], "You are a mental health professional creating personalized therapy plans. Return your response in valid JSON format only.");

    // Extract JSON from AI response (in case it includes markdown formatting)
    let jsonStr = aiResponse;
    
    // Check if response contains markdown code block
    const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonStr = jsonMatch[1];
    }
    
    // Try to clean up the JSON string
    jsonStr = jsonStr.trim();
    
    // Parse AI response
    let planData;
    try {
      planData = JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error parsing AI therapy plan:", error);
      console.error("AI Response:", aiResponse);
      console.error("Extracted JSON string:", jsonStr);
      
      // Try to fix common JSON issues
      try {
        // Remove any trailing commas before closing braces/brackets
        jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
        planData = JSON.parse(jsonStr);
      } catch (secondError) {
        console.error("Failed to fix JSON:", secondError);
        return NextResponse.json({ 
          error: "Failed to generate therapy plan", 
          details: "The AI returned an invalid format"
        }, { status: 500 });
      }
    }

    // Validate the parsed data
    if (!planData.title || !planData.description || !planData.goals || !planData.activities || !planData.resources || !planData.duration) {
      console.error("Invalid therapy plan data:", planData);
      return NextResponse.json({ 
        error: "Invalid therapy plan generated",
        details: "Missing required fields"
      }, { status: 500 });
    }

    // Create therapy plan in database
    const plan = await prisma.therapyPlan.create({
      data: {
        userId: user.id,
        title: planData.title,
        description: planData.description,
        goals: planData.goals,
        activities: planData.activities,
        resources: planData.resources,
        duration: planData.duration,
      },
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Error generating therapy plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}