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

    // Get saved posts with user info and like/save status
    const savedPosts = await prisma.savedPost.findMany({
      where: { userId: user.id },
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                replies: true,
                postLikes: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get liked posts for the current user
    const likedPosts = await prisma.postLike.findMany({
      where: { userId: user.id },
      select: { postId: true },
    });

    const likedPostIds = new Set(likedPosts.map(lp => lp.postId));

    // Format saved posts
    const formattedPosts = savedPosts.map(sp => ({
      ...sp.post,
      likes: sp.post._count.postLikes,
      replies: sp.post._count.replies,
      isSaved: true,
      isLiked: likedPostIds.has(sp.post.id),
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}