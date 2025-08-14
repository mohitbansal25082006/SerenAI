import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

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

    const { messages, title } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages data" }, { status: 400 });
    }

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: title || "New Conversation",
      },
    });

    // Save messages
    for (const message of messages) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: message.role,
          content: message.content,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      conversationId: conversation.id 
    });
  } catch (error) {
    console.error("Error saving conversation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}