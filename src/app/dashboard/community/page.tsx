"use client";
import { useState, useEffect, useCallback } from "react";
import { 
  ChevronLeft, 
  Search, 
  Plus, 
  Filter,
  Users, 
  MessageSquare,
  Heart,
  Bookmark,
  TrendingUp,
  Calendar,
  ArrowUpDown,
  Pin,
  Lock,
  CheckCircle,
  Flame,
  Eye,
  HelpCircle,
  X,
  MessageCircle,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";

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
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [selectedTrendingTopic, setSelectedTrendingTopic] = useState<string | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { collapsed } = useSidebar();
  const { user } = useUser();
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general",
    tags: [] as string[],
    currentTag: ""
  });
  
  const [categories, setCategories] = useState<ForumCategory[]>([
    { 
      id: "all", 
      name: "All Topics", 
      description: "View all forum posts", 
      icon: <MessageSquare className="h-5 w-5" />, 
      color: "bg-blue-100 text-blue-800",
      count: 0
    },
    { 
      id: "general", 
      name: "General", 
      description: "General talk about SerenAI", 
      icon: <MessageSquare className="h-5 w-5" />, 
      color: "bg-gray-100 text-gray-800",
      count: 0
    },
    { 
      id: "features", 
      name: "Features", 
      description: "Discuss new features and updates", 
      icon: <TrendingUp className="h-5 w-5" />, 
      color: "bg-green-100 text-green-800",
      count: 0
    },
    { 
      id: "support", 
      name: "Support", 
      description: "Get help from the community", 
      icon: <HelpCircle className="h-5 w-5" />, 
      color: "bg-purple-100 text-purple-800",
      count: 0
    },
    { 
      id: "feedback", 
      name: "Feedback", 
      description: "Share your feedback and ideas", 
      icon: <Heart className="h-5 w-5" />, 
      color: "bg-pink-100 text-pink-800",
      count: 0
    },
  ]);

  const trendingTopics = [
    "#MoodTracking", "#JournalingTips", "#Mindfulness", "#AnxietySupport", "#SelfCare",
    "#Meditation", "#Therapy", "#WellnessJourney", "#MentalHealth", "#SelfImprovement"
  ];

  // Fetch posts - using useCallback to prevent unnecessary re-renders
  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []); // Ensure we always have an array
        
        // Update category counts
        const categoryCounts = (data.posts || []).reduce((acc: Record<string, number>, post: ForumPost) => {
          acc[post.category] = (acc[post.category] || 0) + 1;
          acc.all = (acc.all || 0) + 1;
          return acc;
        }, {});
        
        setCategories(prevCategories => 
          prevCategories.map(cat => ({
            ...cat,
            count: categoryCounts[cat.id] || 0
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Refresh posts every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPosts();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    const matchesTrendingTopic = !selectedTrendingTopic || 
                                  post.title.toLowerCase().includes(selectedTrendingTopic.replace('#', '').toLowerCase()) ||
                                  post.content.toLowerCase().includes(selectedTrendingTopic.replace('#', '').toLowerCase()) ||
                                  post.tags.some(tag => tag.toLowerCase().includes(selectedTrendingTopic.replace('#', '').toLowerCase()));
    
    return matchesSearch && matchesCategory && matchesTrendingTopic;
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

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          tags: newPost.tags,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Add the new post to the list
        const newPostObj: ForumPost = {
          ...data.post,
          likes: 0,
          replies: 0,
          views: 0,
          isPinned: false,
          isLocked: false,
          isSolved: false,
          trending: false,
          isSaved: false,
          isLiked: false,
        };
        
        setPosts([newPostObj, ...posts]);
        setNewPost({
          title: "",
          content: "",
          category: "general",
          tags: [],
          currentTag: ""
        });
        setIsNewPostModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPosts();
    setIsRefreshing(false);
  };

  const handleAddTag = () => {
    if (newPost.currentTag.trim() && !newPost.tags.includes(newPost.currentTag.trim())) {
      setNewPost({
        ...newPost,
        tags: [...newPost.tags, newPost.currentTag.trim()],
        currentTag: ""
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewPost({
      ...newPost,
      tags: newPost.tags.filter(t => t !== tag)
    });
  };

  const handleTrendingTopicClick = (topic: string) => {
    setSelectedTrendingTopic(selectedTrendingTopic === topic ? null : topic);
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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isNewPostModalOpen} onOpenChange={setIsNewPostModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create a New Post</DialogTitle>
                  <DialogDescription>
                    Share your thoughts, questions, or experiences with the community.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter a title for your post"
                      value={newPost.title}
                      onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newPost.category} onValueChange={(value) => setNewPost({...newPost, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c.id !== "all").map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="What would you like to share?"
                      rows={5}
                      value={newPost.content}
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add a tag"
                        value={newPost.currentTag}
                        onChange={(e) => setNewPost({...newPost, currentTag: e.target.value})}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddTag}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newPost.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsNewPostModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePost}>
                      Post
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
                    <Link href="/dashboard/community">
                      <Button className="bg-white text-blue-600 hover:bg-gray-100 shadow-md">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Browse Discussions
                      </Button>
                    </Link>
                    <Link href="/dashboard/community/saved">
                      <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                        <Bookmark className="h-4 w-4 mr-2" />
                        Saved Posts
                      </Button>
                    </Link>
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
                  <div className="text-2xl font-bold">{categories.find(c => c.id === "all")?.count || 0}</div>
                  <div className="text-sm text-gray-600">Total Posts</div>
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
                  <div className="text-2xl font-bold">
                    {posts.reduce((sum, post) => sum + post.replies, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Replies</div>
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
                  <div className="text-2xl font-bold">
                    {posts.reduce((sum, post) => sum + post.likes, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Likes</div>
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
                  <div className="text-2xl font-bold">
                    {posts.length > 0 ? Math.round((posts.filter(p => p.isSolved).length / posts.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Solved</div>
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
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white p-1 rounded-lg shadow-sm mb-6 overflow-x-auto">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 whitespace-nowrap"
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
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : sortedPosts.length > 0 ? (
                  sortedPosts.map((post) => (
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
                        setSelectedTrendingTopic(null);
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
                  {trendingTopics.map((topic, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors ${selectedTrendingTopic === topic ? 'bg-blue-50' : ''}`}
                      onClick={() => handleTrendingTopicClick(topic)}
                    >
                      <span className={`text-blue-600 ${selectedTrendingTopic === topic ? 'font-medium' : ''}`}>{topic}</span>
                      <Badge variant="outline">
                        {posts.filter(post => 
                          post.title.toLowerCase().includes(topic.replace('#', '').toLowerCase()) ||
                          post.content.toLowerCase().includes(topic.replace('#', '').toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(topic.replace('#', '').toLowerCase()))
                        ).length} posts
                      </Badge>
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
                <Link href="/dashboard/community/guidelines">
                  <Button variant="outline" className="w-full">
                    Read Guidelines
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}