import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { generateChatResponse, moderateContent } from "@/lib/openai";

export async function POST(request: Request) {
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

    const { message, conversationId } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    // Moderate content
    const moderation = await moderateContent(message);
    
    if (moderation.flagged) {
      // Log the flagged content
      console.warn(`Content flagged for user ${userId}:`, moderation.categories);
      
      // If severe categories are flagged, provide crisis resources
      const severeCategories = [
        "sexual/violent", "self-harm", "sexual/minors", 
        "hate/threatening", "violence/graphic"
      ];
      
      const hasSevereContent = Object.entries(moderation.categories).some(
        ([category, flagged]) => flagged && severeCategories.includes(category)
      );
      
      if (hasSevereContent) {
        const crisisResponse = "I notice you might be going through a difficult time. " +
          "If you're in crisis, please reach out to a crisis hotline. " +
          "In the US, you can call or text 988 to reach the Suicide & Crisis Lifeline. " +
          "You can also text HOME to 741741 to connect with the Crisis Text Line. " +
          "These services are free, confidential, and available 24/7.";
        
        return NextResponse.json({
          response: crisisResponse,
          conversationId,
        });
      }
    }

    // Get or create conversation
    let conversation;
    
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, userId: user.id },
      });
    }
    
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: message.substring(0, 30) + (message.length > 30 ? "..." : ""),
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    // Get conversation history for context
    const previousMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 10, // Limit context to last 10 messages
    });

    // Format messages for OpenAI
    const formattedMessages = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Generate AI response
    const aiResponse = await generateChatResponse(formattedMessages);

    // Save assistant message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: aiResponse,
      },
    });

    // Log session
    await prisma.session.create({
      data: {
        userId: user.id,
        type: "chat",
        duration: 60, // Default duration, in a real app you'd calculate this
      },
    });

    return NextResponse.json({
      response: aiResponse,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}