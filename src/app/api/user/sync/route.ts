// src/app/api/user/sync/route.ts
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { User as PrismaUser } from "@prisma/client";

/**
 * Minimal shape of the Clerk user fields we read.
 */
type ClerkEmail = { emailAddress: string; primary?: boolean };
type ClerkUserLike = {
  emailAddresses?: ClerkEmail[];
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  profileImageUrl?: string | null;
  imageUrl?: string | null;
};

function toSafeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const authRes = await auth();
    const userId = authRes.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch full user data from Clerk (supporting clerkClient being a factory or instance)
    const clientInstance =
      typeof clerkClient === "function"
        ? await (clerkClient as unknown as () => Promise<unknown>)()
        : (clerkClient as unknown);

    const client = clientInstance as {
      users: { getUser: (id: string) => Promise<ClerkUserLike> };
    };

    const clerkUser = await client.users.getUser(userId);

    const email =
      clerkUser.emailAddresses?.find((e) => e.primary === true)?.emailAddress ??
      clerkUser.emailAddresses?.[0]?.emailAddress ??
      "";

    const nameFromParts = `${toSafeString(clerkUser.firstName)} ${toSafeString(
      clerkUser.lastName
    )}`.trim();
    const name = nameFromParts || toSafeString(clerkUser.fullName);

    const avatar =
      toSafeString(clerkUser.profileImageUrl) || toSafeString(clerkUser.imageUrl) || "";

    // Check if user exists in database
    let user: PrismaUser | null = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // Create user in database (all string fields guaranteed)
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name,
          avatar,
        },
      });
    } else {
      // Update user data if changed (fall back to existing DB values when Clerk provides empty)
      const updated = await prisma.user.update({
        where: { clerkId: userId },
        data: {
          email: email || user.email,
          name: name || user.name,
          avatar: avatar || user.avatar,
        },
      });
      user = updated;
    }

    return NextResponse.json({ success: true, user });
  } catch (err: unknown) {
    console.error("Error syncing user:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}