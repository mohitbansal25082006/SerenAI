import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
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
    const { id, sessionId } = await params;

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

    // Check if session exists and belongs to the plan
    const existingSession = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        planId: id, // Changed from therapyPlanId to planId
      },
    });
    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Delete therapy session
    await prisma.therapySession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting therapy session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}