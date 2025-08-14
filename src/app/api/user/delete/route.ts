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

    // Delete user-related data
    await prisma.$transaction([
      // Delete messages
      prisma.message.deleteMany({
        where: {
          conversation: {
            userId: user.id,
          },
        },
      }),
      
      // Delete conversations
      prisma.conversation.deleteMany({
        where: {
          userId: user.id,
        },
      }),
      
      // Delete journal entries
      prisma.journalEntry.deleteMany({
        where: {
          userId: user.id,
        },
      }),
      
      // Delete mood records
      prisma.moodRecord.deleteMany({
        where: {
          userId: user.id,
        },
      }),
      
      // Delete sessions
      prisma.session.deleteMany({
        where: {
          userId: user.id,
        },
      }),
      
      // Delete insights
      prisma.$executeRaw`DELETE FROM insights WHERE user_id = ${userId}`,
      
      // Finally, delete the user
      prisma.user.delete({
        where: {
          id: user.id,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}