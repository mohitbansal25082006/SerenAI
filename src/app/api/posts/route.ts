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

    // Get all posts with user info and like/save status
    const posts = await prisma.post.findMany({
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
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Get saved posts and liked posts for the current user
    const [savedPosts, likedPosts] = await Promise.all([
      prisma.savedPost.findMany({
        where: { userId: user.id },
        select: { postId: true },
      }),
      prisma.postLike.findMany({
        where: { userId: user.id },
        select: { postId: true },
      }),
    ]);

    const savedPostIds = new Set(savedPosts.map(sp => sp.postId));
    const likedPostIds = new Set(likedPosts.map(lp => lp.postId));

    // Format posts with additional info
    const formattedPosts = posts.map(post => ({
      ...post,
      likes: post._count.postLikes,
      replies: post._count.replies,
      isSaved: savedPostIds.has(post.id),
      isLiked: likedPostIds.has(post.id),
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error("Error fetching posts:", error);
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

    const { title, content, category, tags } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create new post
    const newPost = await prisma.post.create({
      data: {
        userId: user.id,
        title,
        content,
        category,
        tags: tags || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}