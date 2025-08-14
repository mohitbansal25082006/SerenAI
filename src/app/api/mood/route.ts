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

    // Get mood records
    const records = await prisma.moodRecord.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error fetching mood records:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    const { mood, note } = await request.json();

    if (!mood || mood < 1 || mood > 10) {
      return NextResponse.json({ error: "Valid mood is required" }, { status: 400 });
    }

    // Create mood record
    const record = await prisma.moodRecord.create({
      data: {
        userId: user.id,
        mood,
        note,
      },
    });

    // Log session
    await prisma.session.create({
      data: {
        userId: user.id,
        type: "mood",
        duration: 60, // Default 1 minute
      },
    });

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error creating mood record:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}