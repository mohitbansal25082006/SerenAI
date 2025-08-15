import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./db";
import type { User } from "@prisma/client";

/**
 * Minimal shape of the Clerk user object fields we read.
 * We keep this minimal to avoid using `any` and to satisfy TS.
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

/**
 * Safely coerce an unknown value to a string or return empty string.
 */
function toSafeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Ensures the authenticated Clerk user exists in the local Prisma DB.
 * Preserves your original behavior while avoiding `any`.
 */
export async function syncUserWithDatabase(): Promise<User | null> {
  try {
    const authRes = await auth();
    const userId = authRes.userId;

    if (!userId) return null;

    // Check if user exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (existingUser) return existingUser;

    // clerkClient may be either an instance or an async factory that returns an instance.
    // We avoid `any` by using `unknown` then narrowing/casting to a well-typed shape.
    const clientInstance =
      typeof clerkClient === "function"
        ? await (clerkClient as unknown as () => Promise<unknown>)()
        : (clerkClient as unknown);

    // Cast to a safe, minimal interface we can call
    const client = clientInstance as {
      users: { getUser: (id: string) => Promise<ClerkUserLike> };
    };

    const clerkUser = await client.users.getUser(userId);

    // Extract email safely
    const email =
      clerkUser.emailAddresses?.find((e) => e.primary === true)?.emailAddress ??
      clerkUser.emailAddresses?.[0]?.emailAddress ??
      "";

    // Build name from first + last or fallback to fullName
    const firstName = toSafeString(clerkUser.firstName);
    const lastName = toSafeString(clerkUser.lastName);
    const derivedName = `${firstName} ${lastName}`.trim();
    const name = derivedName || toSafeString(clerkUser.fullName);

    // Avatar fallback logic (profileImageUrl preferred)
    const avatar =
      toSafeString(clerkUser.profileImageUrl) || toSafeString(clerkUser.imageUrl) || "";

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name,
        avatar,
      },
    });

    return newUser;
  } catch (err: unknown) {
    // Keep error typed as unknown and log
    // eslint-disable-next-line no-console
    console.error("syncUserWithDatabase error:", err);
    return null;
  }
}