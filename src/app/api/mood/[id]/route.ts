// E:\serenai\src\app\api\mood\[id]\route.ts
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * DELETE /api/mood/[id]
 * Deletes a moodRecord by id for the authenticated user.
 */
export async function DELETE(request: NextRequest) {
  try {
    // Extract `id` from the request URL to avoid typing issues with the second arg
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    // Clerk auth (await the result so `userId` exists on the resolved value)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the app user by Clerk id
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }, // only select what we need
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure the mood record exists and belongs to this user
    const existingRecord = await prisma.moodRecord.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existingRecord || existingRecord.userId !== user.id) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Delete the mood record
    await prisma.moodRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting mood record:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
