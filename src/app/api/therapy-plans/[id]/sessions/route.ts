// src/app/api/therapy-plans/[id]/sessions/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Await params before destructuring
    const { id } = await params;

    // Check if plan exists and belongs to user
    const existingPlan = await prisma.therapyPlan.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const { title, notes, mood, scheduledFor } = await request.json();

    // Create therapy session
    const session = await prisma.therapySession.create({
      data: {
        planId: id,
        title: title || "Therapy Session",
        notes,
        mood,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
      },
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error creating therapy session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}