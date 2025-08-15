import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    // Await params before accessing its properties
    const { id } = await params;
    
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
    
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
    });
    
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    // Check if user already liked the post
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: id,
        },
      },
    });
    
    if (existingLike) {
      // Unlike the post
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });
      
      // Decrement like count
      await prisma.post.update({
        where: { id },
        data: { likes: { decrement: 1 } },
      });
      
      return NextResponse.json({ liked: false, likes: post.likes - 1 });
    } else {
      // Like the post
      await prisma.postLike.create({
        data: {
          userId: user.id,
          postId: id,
        },
      });
      
      // Increment like count
      await prisma.post.update({
        where: { id },
        data: { likes: { increment: 1 } },
      });
      
      return NextResponse.json({ liked: true, likes: post.likes + 1 });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}