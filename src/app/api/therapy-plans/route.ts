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

    // Get therapy plans with sessions
    const plans = await prisma.therapyPlan.findMany({
      where: { userId: user.id },
      include: {
        sessions: {
          orderBy: { scheduledFor: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Error fetching therapy plans:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}