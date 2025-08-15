"use client";

import { useState } from "react";
import { 
  ChevronLeft, 
  Search, 
  Plus, 
  Filter,
  Users, 
  MessageSquare,
  Heart,
  Bookmark,
  Share,
  Clock,
  TrendingUp,
  Circle,
  Calendar,
  ArrowUpDown,
  Pin,
  Lock,
  CheckCircle,
  Flame,
  Eye,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  count: number;
}

export default function CommunityForumPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const { collapsed } = useSidebar();

  const categories: ForumCategory[] = [
    { 
      id: "all", 
      name: "All Topics", 
      description: "View all forum posts", 
      icon: <MessageSquare className="h-5 w-5" />, 
      color: "bg-blue-100 text-blue-800",
      count: 128
    },
    { 
      id: "general", 
      name: "General Discussion", 
      description: "General talk about SerenAI", 
      icon: <MessageSquare className="h-5 w-5" />, 
      color: "bg-gray-100 text-gray-800",
      count: 42
    },
    { 
      id: "features", 
      name: "Features & Updates", 
      description: "Discuss new features and updates", 
      icon: <TrendingUp className="h-5 w-5" />, 
      color: "bg-green-100 text-green-800",
      count: 36
    },
    { 
      id: "support", 
      name: "Help & Support", 
      description: "Get help from the community", 
      icon: <HelpCircle className="h-5 w-5" />, 
      color: "bg-purple-100 text-purple-800",
      count: 28
    },
    { 
      id: "feedback", 
      name: "Feedback & Ideas", 
      description: "Share your feedback and ideas", 
      icon: <Heart className="h-5 w-5" />, 
      color: "bg-pink-100 text-pink-800",
      count: 22
    },
  ];

  const forumPosts: ForumPost[] = [
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
      id: "2",
      title: "Feature Request: Dark Mode for Journal Entries",
      content: "I would love to see a dark mode option for the journal entries. The bright white background can be harsh on the eyes, especially when writing at night. Has anyone else found this to be an issue?",
      author: {
        name: "Alex Chen",
        avatar: "",
        role: "Premium User"
      },
      category: "features",
      tags: ["feature-request", "ui", "dark-mode"],
      likes: 28,
      replies: 12,
      views: 142,
      createdAt: "2023-06-14",
      isPinned: false,
      isLocked: false,
      isSolved: true,
      trending: false
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
      id: "4",
      title: "Integration with Apple Health - any updates?",
      content: "I remember reading about planned integration with Apple Health a few months ago. Has there been any update on when this feature might be available? Really looking forward to seeing my wellness data in one place.",
      author: {
        name: "Jamie Wilson",
        avatar: "",
        role: "Premium User"
      },
      category: "features",
      tags: ["integration", "apple-health", "feature-request"],
      likes: 15,
      replies: 7,
      views: 98,
      createdAt: "2023-06-12",
      isPinned: false,
      isLocked: false,
      isSolved: false,
      trending: false
    },
    {
      id: "5",
      title: "Mood tracking accuracy - how does it work?",
      content: "I'm curious about how the mood tracking feature works. Does it use AI to analyze my journal entries, or is it purely based on my manual inputs? Sometimes the insights seem surprisingly accurate!",
      author: {
        name: "Taylor Kim",
        avatar: "",
        role: "Free User"
      },
      category: "support",
      tags: ["mood-tracking", "ai", "how-it-works"],
      likes: 22,
      replies: 9,
      views: 134,
      createdAt: "2023-06-11",
      isPinned: false,
      isLocked: false,
      isSolved: true,
      trending: false
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

  const filteredPosts = forumPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Community Forum</h1>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>

        {/* Hero Section */}
        <div className="mb-10">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-6 w-6 text-yellow-300" />
                    <Badge className="bg-yellow-500 text-white border-0">Community</Badge>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Join the SerenAI Community</h2>
                  <p className="mb-6 text-blue-100">
                    Connect with other users, share your experiences, and get support on your mental wellness journey. Our community is here to help you grow and learn together.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-white text-blue-600 hover:bg-gray-100 shadow-md">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Browse Discussions
                    </Button>
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Saved Posts
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="w-48 h-48 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="h-20 w-20 text-white/80" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <Flame className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">2,847</div>
                  <div className="text-sm text-gray-600">Community Members</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">1,256</div>
                  <div className="text-sm text-gray-600">Discussions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">8,942</div>
                  <div className="text-sm text-gray-600">Helpful Votes</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">94%</div>
                  <div className="text-sm text-gray-600">Questions Solved</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search discussions..."
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
                <Button variant="outline" className="shadow-sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white p-1 rounded-lg shadow-sm mb-6">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                  >
                    <div className="flex items-center gap-1">
                      {category.icon}
                      <span className="hidden md:inline">{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategory} className="space-y-4">
                {sortedPosts.length > 0 ? (
                  sortedPosts.map((post) => (
                    <Card key={post.id} className="border-gray-200 hover:shadow-md transition-all duration-300">
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <Button variant="ghost" size="sm" className="p-1 h-auto">
                              <Heart className={`h-5 w-5 ${post.likes > 0 ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
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
                                  <MessageSquare className="h-3 w-3" />
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
                  ))
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No discussions found</h3>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your search or browse other categories.
                      </p>
                      <Button onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                      }}>
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            {/* About Community */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">About the Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  The SerenAI Community is a safe space for users to share experiences, ask questions, and support each other on their mental wellness journey.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Be respectful and kind</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Share your experiences</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Support others on their journey</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["#MoodTracking", "#JournalingTips", "#Mindfulness", "#AnxietySupport", "#SelfCare"].map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-blue-600 hover:text-blue-800 cursor-pointer">{topic}</span>
                      <Badge variant="outline">{Math.floor(Math.random() * 50) + 10} posts</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Leaders */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Community Leaders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Sarah Johnson", role: "Community Leader", avatar: "" },
                    { name: "Michael Torres", role: "Community Guide", avatar: "" },
                    { name: "Jordan Patel", role: "Community Leader", avatar: "" }
                  ].map((leader, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={leader.avatar} />
                        <AvatarFallback>
                          {leader.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{leader.name}</div>
                        <div className="text-sm text-gray-500">{leader.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">
                  Please read and follow our community guidelines to maintain a positive and supportive environment.
                </p>
                <Button variant="outline" className="w-full">
                  Read Guidelines
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}