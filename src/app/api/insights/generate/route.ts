import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { generateChatResponse } from "@/lib/openai";

interface Insight {
  title: string;
  description: string;
  type: "pattern" | "suggestion" | "warning";
}

export async function POST() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user data from the last 30 days
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

    // Generate insights using AI
    const prompt = `Based on the following user data from the last 30 days, generate 3-5 personalized insights about their mental wellness journey. 
    Focus on patterns, suggestions for improvement, and any concerning trends that should be addressed.
    
    Mood Data: ${JSON.stringify(moodData.slice(0, 10))}
    
    Journal Data: ${JSON.stringify(journalData.slice(0, 5))}
    
    Chat Data: ${JSON.stringify(chatData.slice(0, 3))}
    
    Return your response as a JSON array of objects with the following structure:
    [
      {
        "title": "Brief title for the insight",
        "description": "Detailed description of the insight",
        "type": "pattern" | "suggestion" | "warning"
      }
    ]
    
    IMPORTANT: Return ONLY the JSON array, without any additional text or markdown formatting.`;

    const aiResponse = await generateChatResponse([
      { role: "user", content: prompt }
    ], "You are a mental health AI assistant. Analyze user data and provide insights in valid JSON format only.");

    // Clean and parse AI response
    let insights: Insight[] = [];
    try {
      // Remove any markdown formatting or backticks
      const cleanResponse = aiResponse.replace(/```json|```/g, '').trim();
      insights = JSON.parse(cleanResponse) as Insight[];
      
      // Validate the structure
      if (!Array.isArray(insights)) {
        throw new Error("AI response is not an array");
      }
    } catch (error) {
      console.error("Error parsing AI insights:", error);
      insights = [];
    }

    // Save insights to database using Prisma's type-safe methods
    if (insights.length > 0) {
      await prisma.$transaction(
        insights.map(insight => 
          prisma.insight.create({
            data: {
              userId: user.id,
              title: insight.title,
              description: insight.description,
              type: insight.type,
            }
          })
        )
      );
    }

    // Return the generated insights
    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}