// E:\serenai\src\app\api\chat\conversation\[id]\route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

interface MessageResponse {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ConversationResponse {
  messages: MessageResponse[];
  title: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to resolve the Promise
    const { id } = await params;
    
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: id,
        userId: user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const formattedMessages: MessageResponse[] = conversation.messages.map(message => ({
      id: message.id,
      role: message.role as "user" | "assistant",
      content: message.content,
      timestamp: message.createdAt.toISOString(),
    }));

    const title = conversation.title || "Untitled Conversation";

    return NextResponse.json({ 
      messages: formattedMessages,
      title: title,
    });
  } catch (error) {
    console.error("Error loading conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to resolve the Promise
    const { id } = await params;
    
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.message.deleteMany({
        where: {
          conversationId: id,
          conversation: {
            userId: user.id,
          },
        },
      }),
      prisma.conversation.delete({
        where: {
          id: id,
          userId: user.id,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}