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
    
    // Check if post is already saved
    const existingSavedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: id,
        },
      },
    });
    
    if (existingSavedPost) {
      // Unsave the post
      await prisma.savedPost.delete({
        where: { id: existingSavedPost.id },
      });
      
      return NextResponse.json({ saved: false });
    } else {
      // Save the post
      await prisma.savedPost.create({
        data: {
          userId: user.id,
          postId: id,
        },
      });
      
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error("Error toggling save:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}