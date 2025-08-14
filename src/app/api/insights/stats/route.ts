import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

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

    // Get date range for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Get mood records for the week
    const moodRecords = await prisma.moodRecord.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: "asc" },
    });

    // Calculate average mood
    const avgMood = moodRecords.length > 0
      ? moodRecords.reduce((sum, record) => sum + record.mood, 0) / moodRecords.length
      : 0;

    // Calculate mood trend
    let moodTrend: "up" | "down" | "stable" = "stable";
    if (moodRecords.length >= 2) {
      const firstHalf = moodRecords.slice(0, Math.floor(moodRecords.length / 2));
      const secondHalf = moodRecords.slice(Math.floor(moodRecords.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, record) => sum + record.mood, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, record) => sum + record.mood, 0) / secondHalf.length;
      
      if (secondHalfAvg > firstHalfAvg + 0.5) {
        moodTrend = "up";
      } else if (secondHalfAvg < firstHalfAvg - 0.5) {
        moodTrend = "down";
      }
    }

    // Get journal entries count
    const journalEntries = await prisma.journalEntry.count({
      where: {
        userId: user.id,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // Get chat sessions count
    const chatSessions = await prisma.conversation.count({
      where: {
        userId: user.id,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // Get mood records count
    const moodRecordsCount = moodRecords.length;

    // Get most common emotion (simplified - would use sentiment analysis in real app)
    const emotions = ["happy", "sad", "anxious", "calm", "excited"];
    const mostCommonEmotion = emotions[Math.floor(Math.random() * emotions.length)];

    // Get most active day
    const dayCounts: { [key: string]: number } = {};
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    // Initialize all days with 0
    days.forEach(day => {
      dayCounts[day] = 0;
    });
    
    // Count activities by day
    const allActivities = [
      ...moodRecords.map(r => ({ createdAt: r.createdAt })),
      ...(await prisma.journalEntry.findMany({
        where: { userId: user.id, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true }
      })),
      ...(await prisma.conversation.findMany({
        where: { userId: user.id, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true }
      }))
    ];
    
    allActivities.forEach(activity => {
      const day = new Date(activity.createdAt).toLocaleDateString("en-US", { weekday: "long" });
      if (dayCounts[day] !== undefined) {
        dayCounts[day]++;
      }
    });
    
    const mostActiveDay = Object.entries(dayCounts).reduce((a, b) => 
      dayCounts[a[0]] > dayCounts[b[0]] ? a : b
    )[0];

    return NextResponse.json({
      stats: {
        avgMood,
        journalEntries,
        chatSessions,
        moodRecords: moodRecordsCount,
        moodTrend,
        mostCommonEmotion,
        mostActiveDay,
      }
    });
  } catch (error) {
    console.error("Error fetching insights stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}