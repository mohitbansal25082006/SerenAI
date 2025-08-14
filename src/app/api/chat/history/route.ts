// E:\serenai\src\app\api\chat\history\route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
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

    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { messages: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      title: conv.title || conv.messages[0]?.content?.substring(0, 30) || "Conversation",
      createdAt: conv.createdAt.toISOString(),
      messageCount: conv._count.messages,
    }));

    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}