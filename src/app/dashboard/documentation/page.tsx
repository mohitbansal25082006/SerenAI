"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Search, 
  ChevronLeft, 
  FileText, 
  Video, 
  Download,
  CheckCircle,
  Clock,
  Users,
  Shield,
  MessageSquare,
  BarChart3,
  Settings,
  Activity,
  Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";

interface DocumentationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  difficulty: "beginner" | "intermediate" | "advanced";
  readTime: string;
  lastUpdated: string;
}

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { collapsed } = useSidebar();

  const categories = [
    { id: "all", name: "All Topics", icon: <BookOpen className="h-4 w-4" /> },
    { id: "getting-started", name: "Getting Started", icon: <CheckCircle className="h-4 w-4" /> },
    { id: "features", name: "Features", icon: <Settings className="h-4 w-4" /> },
    { id: "chat", name: "AI Chat", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "journal", name: "Journaling", icon: <FileText className="h-4 w-4" /> },
    { id: "mood", name: "Mood Tracking", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "activities", name: "Activities", icon: <Activity className="h-4 w-4" /> },
    { id: "insights", name: "Insights", icon: <Brain className="h-4 w-4" /> },
    { id: "privacy", name: "Privacy & Security", icon: <Shield className="h-4 w-4" /> },
  ];

  const documentationItems: DocumentationItem[] = [
    {
      id: "intro",
      title: "Introduction to SerenAI",
      description: "Learn about SerenAI and how it can support your mental wellness journey.",
      category: "getting-started",
      icon: <BookOpen className="h-6 w-6 text-blue-500" />,
      difficulty: "beginner",
      readTime: "5 min",
      lastUpdated: "2 days ago"
    },
    {
      id: "first-steps",
      title: "First Steps with SerenAI",
      description: "A quick guide to get you started with your first conversation and journal entry.",
      category: "getting-started",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      difficulty: "beginner",
      readTime: "8 min",
      lastUpdated: "1 week ago"
    },
    {
      id: "ai-chat",
      title: "Using the AI Chat Feature",
      description: "Learn how to have meaningful conversations with SerenAI and get the most out of your sessions.",
      category: "chat",
      icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
      difficulty: "beginner",
      readTime: "10 min",
      lastUpdated: "3 days ago"
    },
    {
      id: "journaling",
      title: "Journaling for Mental Wellness",
      description: "Discover how journaling can help you process emotions and track your mental health journey.",
      category: "journal",
      icon: <FileText className="h-6 w-6 text-yellow-500" />,
      difficulty: "intermediate",
      readTime: "12 min",
      lastUpdated: "5 days ago"
    },
    {
      id: "mood-tracking",
      title: "Understanding Mood Patterns",
      description: "Learn how to track your mood and identify patterns that affect your mental well-being.",
      category: "mood",
      icon: <BarChart3 className="h-6 w-6 text-red-500" />,
      difficulty: "intermediate",
      readTime: "15 min",
      lastUpdated: "1 week ago"
    },
    {
      id: "activities",
      title: "Wellness Activities Guide",
      description: "Explore different activities designed to improve your mental wellness and reduce stress.",
      category: "activities",
      icon: <Activity className="h-6 w-6 text-green-500" />,
      difficulty: "beginner",
      readTime: "7 min",
      lastUpdated: "4 days ago"
    },
    {
      id: "insights",
      title: "Understanding Your Insights",
      description: "Learn how to interpret the AI-generated insights and use them to improve your mental health.",
      category: "insights",
      icon: <Brain className="h-6 w-6 text-indigo-500" />,
      difficulty: "advanced",
      readTime: "18 min",
      lastUpdated: "2 weeks ago"
    },
    {
      id: "privacy",
      title: "Privacy and Data Security",
      description: "Understand how we protect your data and ensure your privacy while using SerenAI.",
      category: "privacy",
      icon: <Shield className="h-6 w-6 text-gray-500" />,
      difficulty: "intermediate",
      readTime: "10 min",
      lastUpdated: "3 weeks ago"
    },
  ];

  const filteredItems = documentationItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Documentation</h1>
        </div>

        {/* Hero Section */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Everything you need to know about SerenAI</h2>
                  <p className="mb-6 text-blue-100 max-w-2xl">
                    Explore our comprehensive documentation to learn how to make the most of SerenAI&apos;s features 
                    and support your mental wellness journey.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Getting Started
                    </Button>
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                      <Video className="h-4 w-4 mr-2" />
                      Video Tutorials
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="w-64 h-64 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <BookOpen className="h-24 w-24 text-white/80" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Categories */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-9">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <div className="flex items-center gap-1">
                    {category.icon}
                    <span className="hidden sm:inline">{category.name}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Documentation Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {item.icon}
                    </div>
                    <Badge className={getDifficultyColor(item.difficulty)}>
                      {item.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.readTime} read
                    </div>
                    <div>Updated {item.lastUpdated}</div>
                  </div>
                  <Button className="w-full">
                    Read Article
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No documentation found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filter to find what you&apos;re looking for.
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

        {/* Additional Resources */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold mb-2">Video Tutorials</h3>
                <p className="text-gray-600 mb-4">Watch our video guides to learn how to use SerenAI effectively.</p>
                <Button variant="outline" className="w-full">
                  Watch Videos
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold mb-2">Community Forum</h3>
                <p className="text-gray-600 mb-4">Connect with other users and share your experiences with SerenAI.</p>
                <Button variant="outline" className="w-full">
                  Join Community
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold mb-2">Webinars & Workshops</h3>
                <p className="text-gray-600 mb-4">Join our live sessions to learn more about mental wellness.</p>
                <Button variant="outline" className="w-full">
                  View Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}