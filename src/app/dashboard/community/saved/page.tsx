"use client";

import { useState, useEffect, useCallback } from "react";
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
  Flame,
  Heart,
  RefreshCw
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
    id: string;
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
  isSaved?: boolean;
  isLiked?: boolean;
}

export default function SavedPostsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { collapsed } = useSidebar();

  const categories = [
    { id: "general", name: "General", color: "bg-gray-100 text-gray-800" },
    { id: "features", name: "Features", color: "bg-green-100 text-green-800" },
    { id: "support", name: "Support", color: "bg-purple-100 text-purple-800" },
    { id: "feedback", name: "Feedback", color: "bg-pink-100 text-pink-800" },
  ];

  // Fetch saved posts - using useCallback to prevent unnecessary re-renders
  const fetchSavedPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/posts/saved");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []); // Ensure we always have an array
      } else {
        setPosts([]); // Set empty array on error
      }
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      setPosts([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  // Refresh posts every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSavedPosts();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchSavedPosts]);

  const filteredPosts = posts.filter(post => {
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

  const handleLikePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the post in the list
        setPosts(posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes: data.likes,
                isLiked: data.liked
              } 
            : post
        ));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleSavePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/save`, {
        method: "POST",
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the post in the list
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, isSaved: data.saved } 
            : post
        ));
      }
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSavedPosts();
    setIsRefreshing(false);
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
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : sortedPosts.length > 0 ? (
          <div className="space-y-4">
            {sortedPosts.map((post) => (
              <Card key={post.id} className="border-gray-200 hover:shadow-md transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 h-auto"
                        onClick={() => handleLikePost(post.id)}
                      >
                        <Heart className={`h-5 w-5 ${post.isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
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
                              <AvatarImage src={post.author?.avatar} />
                              <AvatarFallback>
                                {post.author?.name ? post.author.name.split(' ').map(n => n[0]).join('') : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span>{post.author?.name || 'Unknown User'}</span>
                            {post.author?.role && (
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-auto"
                            onClick={() => handleSavePost(post.id)}
                          >
                            <Bookmark className={`h-4 w-4 ${post.isSaved ? 'text-blue-500 fill-current' : 'text-gray-400'}`} />
                          </Button>
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