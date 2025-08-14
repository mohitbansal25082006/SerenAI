import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type UpdateJournalPayload = {
  title?: string | null;
  content?: string | null;
  mood?: number | null;
  tags?: string[] | null;
};

function extractIdFromContext(context: unknown): string | undefined {
  // Defensive, eslint-friendly narrowing without using `any`.
  if (typeof context !== "object" || context === null) return undefined;

  const ctx = context as Record<string, unknown>;
  const params = ctx["params"];
  if (typeof params !== "object" || params === null) return undefined;

  const p = params as Record<string, unknown>;
  const id = p["id"];
  if (typeof id === "string") return id;

  return undefined;
}

export async function PUT(request: Request, context: unknown) {
  try {
    // auth() returns a promise that resolves to session/auth data
    const authData = await auth();
    const userId = authData?.userId ?? null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the app user by their Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse and validate payload
    const body = (await request.json()) as Partial<UpdateJournalPayload>;

    // Convert null to undefined so Prisma accepts the types (omit fields not provided)
    const title = typeof body.title === "string" ? body.title : undefined;
    const content = typeof body.content === "string" ? body.content : undefined;
    const mood = typeof body.mood === "number" ? body.mood : undefined;
    const tags = Array.isArray(body.tags) ? body.tags.filter((t) => typeof t === "string") : undefined;

    // Extract id from context.params in a defensive way
    const id = extractIdFromContext(context);
    if (!id) {
      return NextResponse.json({ error: "Missing entry id" }, { status: 400 });
    }

    // Ensure entry exists and belongs to this user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Build the update data object, only including provided fields
    const data: Prisma.JournalEntryUpdateInput = {} as Prisma.JournalEntryUpdateInput;
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (mood !== undefined) data.mood = mood;
    if (tags !== undefined) data.tags = tags;

    // If nothing to update, return the existing entry
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ entry: existingEntry }, { status: 200 });
    }

    // Update the entry
    const entry = await prisma.journalEntry.update({
      where: { id },
      data,
    });

    return NextResponse.json({ entry }, { status: 200 });
  } catch (error) {
    console.error("Error updating journal entry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: unknown) {
  try {
    const authData = await auth();
    const userId = authData?.userId ?? null;

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

    const id = extractIdFromContext(context);
    if (!id) {
      return NextResponse.json({ error: "Missing entry id" }, { status: 400 });
    }

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Delete journal entry
    await prisma.journalEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
