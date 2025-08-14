"use client";

import { useState } from "react";
import { 
  ChevronLeft, 
  Search, 
  Plus, 
  Minus, 
  HelpCircle, 
  MessageSquare, 
  Shield, 
  User, 
  BookOpen,
  Settings,
  Heart,
  Brain,
  BarChart3,
  Activity,
  FileText,
  Database,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
  popular: boolean;
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { collapsed } = useSidebar();

  const categories = [
    { id: "all", name: "All Questions", icon: <HelpCircle className="h-4 w-4" /> },
    { id: "getting-started", name: "Getting Started", icon: <User className="h-4 w-4" /> },
    { id: "features", name: "Features", icon: <Settings className="h-4 w-4" /> },
    { id: "account", name: "Account & Billing", icon: <Shield className="h-4 w-4" /> },
    { id: "privacy", name: "Privacy & Security", icon: <Shield className="h-4 w-4" /> },
  ];

  const faqItems: FAQItem[] = [
    {
      id: "what-is-serenai",
      question: "What is SerenAI and how does it work?",
      answer: "SerenAI is an AI-powered mental wellness companion designed to provide emotional support through conversations, journaling, and mood tracking. It uses advanced natural language processing to understand your emotions and provide empathetic responses. The AI learns from your interactions to offer more personalized support over time.",
      category: "getting-started",
      icon: <Brain className="h-6 w-6 text-purple-500" />,
      popular: true
    },
    {
      id: "is-serenai-free",
      question: "Is SerenAI free to use?",
      answer: "SerenAI offers a free tier with basic features including AI conversations, journaling, and mood tracking. We also offer a premium subscription with advanced features like personalized insights, voice interactions, and unlimited journal entries.",
      category: "getting-started",
      icon: <MessageSquare className="h-6 w-6 text-blue-500" />,
      popular: true
    },
    {
      id: "data-privacy",
      question: "How does SerenAI protect my data and privacy?",
      answer: "We take your privacy very seriously. All conversations are encrypted end-to-end, and we never share your personal information with third parties. You have full control over your data and can export or delete it at any time. Our platform is GDPR and HIPAA compliant.",
      category: "privacy",
      icon: <Shield className="h-6 w-6 text-green-500" />,
      popular: true
    },
    {
      id: "replace-therapy",
      question: "Can SerenAI replace professional therapy?",
      answer: "No, SerenAI is not a replacement for professional therapy. It&apos;s designed to complement traditional mental health support by providing immediate access to emotional support and self-help tools. If you&apos;re experiencing severe distress, we strongly recommend contacting a mental health professional.",
      category: "features",
      icon: <Heart className="h-6 w-6 text-red-500" />,
      popular: false
    },
    {
      id: "ai-accuracy",
      question: "How accurate is SerenAI&apos;s understanding of emotions?",
      answer: "SerenAI uses state-of-the-art natural language processing and sentiment analysis to understand emotions with high accuracy. However, it&apos;s not perfect and may sometimes misinterpret complex emotions. We continuously improve our algorithms based on user feedback and research.",
      category: "features",
      icon: <Brain className="h-6 w-6 text-purple-500" />,
      popular: false
    },
    {
      id: "mood-tracking",
      question: "How does mood tracking work?",
      answer: "SerenAI&apos;s mood tracking feature allows you to log your daily emotional state on a scale of 1-10. Over time, it identifies patterns and trends in your mood, helping you understand triggers and improve your emotional well-being. You can also add notes to provide context for your mood changes.",
      category: "features",
      icon: <BarChart3 className="h-6 w-6 text-yellow-500" />,
      popular: true
    },
    {
      id: "journaling-benefits",
      question: "What are the benefits of journaling with SerenAI?",
      answer: "Journaling with SerenAI helps you process emotions, identify patterns in your thoughts, and track your mental health journey. The AI can provide prompts when you&apos;re unsure what to write about and can analyze your entries to offer insights about your emotional well-being.",
      category: "features",
      icon: <FileText className="h-6 w-6 text-blue-500" />,
      popular: false
    },
    {
      id: "activities",
      question: "What kind of wellness activities does SerenAI offer?",
      answer: "SerenAI offers a variety of guided wellness activities including breathing exercises, meditation sessions, mindfulness practices, and cognitive behavioral techniques. Each activity is designed to help you manage stress, improve focus, and enhance your overall mental well-being.",
      category: "features",
      icon: <Activity className="h-6 w-6 text-green-500" />,
      popular: false
    },
    {
      id: "account-management",
      question: "How do I manage my account settings?",
      answer: "You can manage your account settings by navigating to the Profile page in your dashboard. From there, you can update your personal information, change your password, adjust notification preferences, and manage your subscription if you&apos;re a premium user.",
      category: "account",
      icon: <User className="h-6 w-6 text-indigo-500" />,
      popular: false
    },
    {
      id: "data-export",
      question: "Can I export my data from SerenAI?",
      answer: "Yes, you can export all your data from SerenAI at any time. Go to your Profile page, navigate to the Privacy & Security section, and click on &apos;Export Data&apos;. You&apos;ll receive a downloadable file containing all your conversations, journal entries, mood records, and other data.",
      category: "privacy",
      icon: <Database className="h-6 w-6 text-gray-500" />,
      popular: false
    },
    {
      id: "crisis-support",
      question: "What happens if I express thoughts of self-harm or suicide?",
      answer: "SerenAI is designed to detect signs of crisis and will respond with supportive messages and resources. If you express thoughts of self-harm or suicide, SerenAI will provide you with crisis hotline numbers and strongly encourage you to contact a mental health professional or crisis service immediately.",
      category: "features",
      icon: <Heart className="h-6 w-6 text-red-500" />,
      popular: true
    },
    {
      id: "delete-account",
      question: "How do I delete my SerenAI account?",
      answer: "To delete your account, go to your Profile page, navigate to the Privacy & Security section, and click on &apos;Delete Account&apos;. Please note that this action is irreversible and all your data will be permanently removed from our systems.",
      category: "account",
      icon: <Shield className="h-6 w-6 text-green-500" />,
      popular: false
    }
  ];

  const filteredItems = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const popularItems = faqItems.filter(item => item.popular);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        </div>

        {/* Hero Section */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">How can we help you?</h2>
                  <p className="mb-6 text-blue-100">
                    Find answers to common questions about SerenAI, or get in touch with our support team for personalized assistance.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Documentation
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="w-48 h-48 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <HelpCircle className="h-20 w-20 text-white/80" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </div>

        {/* Popular Questions */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-6">Popular Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularItems.map((item) => (
              <Card key={item.id} className="border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-2">{item.question}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleItem(item.id)}
                        className="p-0 h-auto text-blue-600 hover:text-blue-800"
                      >
                        {expandedItems[item.id] ? "Hide Answer" : "View Answer"}
                      </Button>
                    </div>
                  </div>
                  {expandedItems[item.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-700">{item.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories and All Questions */}
        <div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  <div className="flex items-center gap-1">
                    {category.icon}
                    <span>{category.name}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="mt-8 space-y-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <Card key={item.id} className="border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-2">{item.question}</h3>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleItem(item.id)}
                      >
                        {expandedItems[item.id] ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                    {expandedItems[item.id] && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-gray-700">{item.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No questions found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or browse our popular questions above.
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
          </div>
        </div>

        {/* Still Need Help Section */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                  <p className="text-gray-600 mb-6 max-w-2xl">
                    Our support team is here to help you with any questions or issues you may have. 
                    Don&apos;t hesitate to reach out to us for personalized assistance.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Community Forum
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center">
                    <MessageSquare className="h-16 w-16 text-blue-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}