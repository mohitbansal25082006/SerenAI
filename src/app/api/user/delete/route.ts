import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function DELETE() {
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

    // Delete all user data
    await prisma.$transaction([
      prisma.message.deleteMany({
        where: {
          conversation: {
            userId: user.id,
          },
        },
      }),
      prisma.conversation.deleteMany({
        where: { userId: user.id },
      }),
      prisma.journalEntry.deleteMany({
        where: { userId: user.id },
      }),
      prisma.moodRecord.deleteMany({
        where: { userId: user.id },
      }),
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
      prisma.insight.deleteMany({
        where: { userId: user.id },
      }),
      prisma.user.delete({
        where: { id: user.id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}