import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

type MoodDataPoint = {
  day: string;
  mood: number;
};

export async function GET(): Promise<NextResponse> {
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

    // Get average mood (last 7 records)
    const moodRecords = await prisma.moodRecord.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 7,
    });

    const avgMood =
      moodRecords.length > 0
        ? moodRecords.reduce((sum, record) => sum + record.mood, 0) / moodRecords.length
        : 0;

    // Get sessions for streak calculation
    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    let streak = 0;
    if (sessions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if there was activity today or yesterday
      const hasActivityToday = sessions.some((session) => {
        const sessionDate = new Date(session.createdAt);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime();
      });

      const hasActivityYesterday = sessions.some((session) => {
        const sessionDate = new Date(session.createdAt);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === yesterday.getTime();
      });

      if (hasActivityToday || hasActivityYesterday) {
        streak = 1;
        // Check for consecutive days
        const checkDate = hasActivityToday ? yesterday : new Date(yesterday);
        checkDate.setDate(checkDate.getDate() - 1);

        while (true) {
          const hasActivity = sessions.some((session) => {
            const sessionDate = new Date(session.createdAt);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === checkDate.getTime();
          });

          if (hasActivity) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // Get completed activities (count of journal entries in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const journalEntries = await prisma.journalEntry.count({
      where: {
        userId: user.id,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // Build mood data for the last 7 days
    const moodData: MoodDataPoint[] = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayName = days[date.getDay()];

      const dayMoodRecords = moodRecords.filter((record) => {
        const recordDate = new Date(record.createdAt);
        recordDate.setHours(0, 0, 0, 0);
        return (
          recordDate.getDate() === date.getDate() &&
          recordDate.getMonth() === date.getMonth() &&
          recordDate.getFullYear() === date.getFullYear()
        );
      });

      const dayMood =
        dayMoodRecords.length > 0
          ? dayMoodRecords.reduce((sum, record) => sum + record.mood, 0) / dayMoodRecords.length
          : 0;

      moodData.push({
        day: dayName,
        mood: dayMood,
      });
    }

    return NextResponse.json({
      avgMood,
      streak,
      completedActivities: Math.min(journalEntries, 4),
      moodData,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}