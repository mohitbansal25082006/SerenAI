// E:\serenai\src\app\api\chat\conversation\[id]\route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
        id: params.id,
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

    const formattedMessages = conversation.messages.map(message => ({
      id: message.id,
      role: message.role as "user" | "assistant",
      content: message.content,
      timestamp: message.createdAt.toISOString(),
    }));

    return NextResponse.json({ 
      messages: formattedMessages,
      title: conversation.title,
    });
  } catch (error) {
    console.error("Error loading conversation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}