// E:\serenai\src\app\api\chat\route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { generateChatResponse, moderateContent } from "@/lib/openai";

/**
 * POST /api/chat
 * Accepts { message: string, conversationId?: string } and returns AI response
 */
export async function POST(request: Request) {
  try {
    // Authenticate via Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get app user from DB
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse body
    const body = (await request.json()) as {
      message?: unknown;
      conversationId?: string | undefined;
    };

    const message = typeof body.message === "string" ? body.message.trim() : "";
    const conversationId = typeof body.conversationId === "string" && body.conversationId ? body.conversationId : undefined;

    if (!message) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    // Moderate content
    const moderation = await moderateContent(message);

    if (moderation.flagged) {
      console.warn(`Content flagged for user ${userId}:`, moderation.categories);

      const severeCategories = [
        "sexual/violent",
        "self-harm",
        "sexual/minors",
        "hate/threatening",
        "violence/graphic",
      ];

      const hasSevereContent = Object.entries(moderation.categories).some(
        ([category, flagged]) => flagged && severeCategories.includes(category)
      );

      if (hasSevereContent) {
        const crisisResponse =
          "I notice you might be going through a difficult time. If you're in crisis, please reach out to a crisis hotline. " +
          "In the US, you can call or text 988 to reach the Suicide & Crisis Lifeline. You can also text HOME to 741741 to connect with the Crisis Text Line. " +
          "These services are free, confidential, and available 24/7.";

        return NextResponse.json({
          response: crisisResponse,
          conversationId,
        });
      }
    }

    // Get or create conversation: use findUnique by id, then check ownership
    let conversation = undefined;

    if (conversationId) {
      const found = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { id: true, userId: true, title: true },
      });

      if (found && found.userId === user.id) {
        conversation = found as { id: string; userId: string; title?: string | null };
      } else {
        // ignore provided conversationId if it doesn't belong to the user
        conversation = undefined;
      }
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

    // Get conversation history for context (last 10 messages)
    const previousMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 10,
      select: { role: true, content: true },
    });

    // Ensure the `role` is the exact union type the chat generator expects.
    type Role = "user" | "assistant" | "system";
    const formattedMessages = previousMessages.map((msg) => ({
      role: msg.role as Role,
      content: msg.content,
    })) as { role: Role; content: string }[];

    // Generate AI response (expects ChatMessage[]-like input)
    const aiResponse = await generateChatResponse(formattedMessages);

    // If generateChatResponse returns an object or non-string, coerce to string
    const aiText = typeof aiResponse === "string" ? aiResponse : String(aiResponse);

    // Save assistant message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: aiText,
      },
    });

    // Log session (example)
    await prisma.session.create({
      data: {
        userId: user.id,
        type: "chat",
        duration: 60,
      },
    });

    return NextResponse.json({
      response: aiText,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
