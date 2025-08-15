"use client";
import { useState } from "react";
import { 
  ChevronLeft, 
  Bookmark, 
  Search, 
  Filter,
  ArrowUpDown,
  Calendar,
  MessageCircle,
  Eye,
  Pin,
  Lock,
  CheckCircle,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  category: string;
  tags: string[];
  likes: number;
  replies: number;
  views: number;
  createdAt: string;
  isPinned: boolean;
  isLocked: boolean;
  isSolved: boolean;
  trending: boolean;
}

export default function SavedPostsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const { collapsed } = useSidebar();

  const categories = [
    { id: "general", name: "General", color: "bg-gray-100 text-gray-800" },
    { id: "features", name: "Features", color: "bg-green-100 text-green-800" },
    { id: "support", name: "Support", color: "bg-purple-100 text-purple-800" },
    { id: "feedback", name: "Feedback", color: "bg-pink-100 text-pink-800" },
  ];

  // Mock saved posts data
  const savedPosts: ForumPost[] = [
    {
      id: "1",
      title: "How has SerenAI helped you in your mental wellness journey?",
      content: "I wanted to start a discussion about how SerenAI has positively impacted people's mental health. For me, it's been a game-changer in helping me track my mood patterns and understand my emotions better.",
      author: {
        name: "Sarah Johnson",
        avatar: "",
        role: "Community Leader"
      },
      category: "general",
      tags: ["personal-experience", "mental-health"],
      likes: 42,
      replies: 18,
      views: 256,
      createdAt: "2023-06-15",
      isPinned: true,
      isLocked: false,
      isSolved: false,
      trending: true
    },
    {
      id: "3",
      title: "Tips for new users getting started with SerenAI",
      content: "I thought I'd share some tips that helped me when I first started using SerenAI. These might be helpful for others who are just beginning their mental wellness journey with the app.",
      author: {
        name: "Michael Torres",
        avatar: "",
        role: "Community Guide"
      },
      category: "support",
      tags: ["tips", "getting-started", "beginners"],
      likes: 56,
      replies: 24,
      views: 312,
      createdAt: "2023-06-13",
      isPinned: true,
      isLocked: false,
      isSolved: false,
      trending: true
    },
    {
      id: "6",
      title: "Weekly Challenge: Gratitude Journaling",
      content: "I'm starting a weekly challenge for anyone interested. For the next 7 days, let's all try to write at least 3 gratitude journal entries per day. At the end of the week, we can share how it impacted our mood and outlook!",
      author: {
        name: "Jordan Patel",
        avatar: "",
        role: "Community Leader"
      },
      category: "general",
      tags: ["challenge", "gratitude", "journaling"],
      likes: 37,
      replies: 15,
      views: 189,
      createdAt: "2023-06-10",
      isPinned: false,
      isLocked: false,
      isSolved: false,
      trending: true
    }
  ];

  const filteredPosts = savedPosts.filter(post => {
    return post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "popular":
        return b.likes - a.likes;
      case "replies":
        return b.replies - a.replies;
      case "views":
        return b.views - a.views;
      default:
        return 0;
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/community">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Saved Posts</h1>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search saved posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200 shadow-sm focus:shadow-md transition-shadow"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-md shadow-sm focus:shadow-md transition-shadow appearance-none"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
                <option value="replies">Most Replies</option>
                <option value="views">Most Viewed</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Saved Posts */}
        {sortedPosts.length > 0 ? (
          <div className="space-y-4">
            {sortedPosts.map((post) => (
              <Card key={post.id} className="border-gray-200 hover:shadow-md transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <Button variant="ghost" size="sm" className="p-1 h-auto">
                        <Bookmark className="h-5 w-5 text-blue-500 fill-current" />
                      </Button>
                      <span className="text-xs text-gray-500">{post.likes}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {post.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                          {post.isLocked && <Lock className="h-4 w-4 text-gray-500" />}
                          {post.isSolved && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {post.trending && <Flame className="h-4 w-4 text-orange-500" />}
                          <h3 className="font-medium hover:text-blue-600 cursor-pointer">
                            {post.title}
                          </h3>
                        </div>
                        <Badge className={categories.find(c => c.id === post.category)?.color}>
                          {categories.find(c => c.id === post.category)?.name}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {post.content}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>
                                {post.author.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{post.author.name}</span>
                            {post.author.role && (
                              <Badge variant="outline" className="text-xs">
                                {post.author.role}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{post.replies}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{post.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No saved posts</h3>
              <p className="text-gray-600 mb-4">
                You haven&apos;t saved any posts yet. Click the bookmark icon on posts you want to save for later.
              </p>
              <Link href="/dashboard/community">
                <Button>Browse Community</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}