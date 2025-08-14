import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { generateJournalPrompt } from "@/lib/openai";

export async function GET() {
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

    // Get user's latest mood record
    const latestMood = await prisma.moodRecord.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Generate AI prompt
    const prompt = await generateJournalPrompt(latestMood?.mood);

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("Error generating journal prompt:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}