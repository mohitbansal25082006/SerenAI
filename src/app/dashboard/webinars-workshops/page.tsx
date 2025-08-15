"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Users, 
  ChevronLeft,
  Video,
  MessageSquare,
  BookOpen,
  Search,
  Filter,
  Star,
  Share,
  Bell,
  ExternalLink,
  CheckCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";

interface Webinar {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  presenter: string;
  registered: number;
  maxParticipants: number;
  thumbnail: string;
  upcoming: boolean;
  featured: boolean;
}

export default function WebinarsWorkshopsPage() {
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [registeredWebinars, setRegisteredWebinars] = useState<Set<string>>(new Set());
  const { collapsed } = useSidebar();

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "mental-health", name: "Mental Health" },
    { id: "mindfulness", name: "Mindfulness" },
    { id: "stress-management", name: "Stress Management" },
    { id: "relationships", name: "Relationships" },
    { id: "productivity", name: "Productivity" },
    { id: "sleep", name: "Sleep" },
  ];

  const webinars: Webinar[] = [
    {
      id: "1",
      title: "Introduction to Mindfulness Meditation",
      description: "Learn the basics of mindfulness meditation and how to incorporate it into your daily routine.",
      date: "2023-06-15",
      time: "18:00",
      duration: "60 min",
      category: "mindfulness",
      difficulty: "beginner",
      presenter: "Dr. Sarah Johnson",
      registered: 245,
      maxParticipants: 500,
      thumbnail: "/thumbnails/mindfulness.jpg",
      upcoming: false,
      featured: true,
    },
    {
      id: "2",
      title: "Managing Anxiety in Daily Life",
      description: "Practical strategies for managing anxiety and improving your quality of life.",
      date: "2023-06-22",
      time: "19:00",
      duration: "75 min",
      category: "mental-health",
      difficulty: "intermediate",
      presenter: "Dr. Michael Chen",
      registered: 189,
      maxParticipants: 300,
      thumbnail: "/thumbnails/anxiety.jpg",
      upcoming: false,
      featured: true,
    },
    {
      id: "3",
      title: "Building Healthy Relationships",
      description: "Learn how to build and maintain healthy relationships in your personal and professional life.",
      date: "2023-06-29",
      time: "18:30",
      duration: "90 min",
      category: "relationships",
      difficulty: "intermediate",
      presenter: "Dr. Emily Rodriguez",
      registered: 156,
      maxParticipants: 400,
      thumbnail: "/thumbnails/relationships.jpg",
      upcoming: false,
      featured: false,
    },
    {
      id: "4",
      title: "Improving Sleep Quality",
      description: "Discover techniques to improve your sleep quality and wake up feeling refreshed.",
      date: "2023-07-06",
      time: "19:00",
      duration: "60 min",
      category: "sleep",
      difficulty: "beginner",
      presenter: "Dr. James Wilson",
      registered: 278,
      maxParticipants: 350,
      thumbnail: "/thumbnails/sleep.jpg",
      upcoming: false,
      featured: false,
    },
    {
      id: "5",
      title: "Stress Reduction Techniques",
      description: "Effective techniques to reduce stress and improve your overall well-being.",
      date: "2023-07-13",
      time: "18:00",
      duration: "75 min",
      category: "stress-management",
      difficulty: "beginner",
      presenter: "Dr. Lisa Thompson",
      registered: 312,
      maxParticipants: 500,
      thumbnail: "/thumbnails/stress.jpg",
      upcoming: false,
      featured: false,
    },
    {
      id: "6",
      title: "Advanced Mindfulness Practices",
      description: "Deepen your mindfulness practice with advanced techniques and approaches.",
      date: "2023-07-20",
      time: "19:30",
      duration: "90 min",
      category: "mindfulness",
      difficulty: "advanced",
      presenter: "Dr. Robert Davis",
      registered: 134,
      maxParticipants: 200,
      thumbnail: "/thumbnails/advanced-mindfulness.jpg",
      upcoming: false,
      featured: false,
    },
    {
      id: "7",
      title: "Productivity and Mental Wellness",
      description: "How to maintain productivity while prioritizing your mental wellness.",
      date: "2023-07-27",
      time: "18:00",
      duration: "60 min",
      category: "productivity",
      difficulty: "intermediate",
      presenter: "Dr. Jennifer Martinez",
      registered: 198,
      maxParticipants: 300,
      thumbnail: "/thumbnails/productivity.jpg",
      upcoming: false,
      featured: false,
    },
    {
      id: "8",
      title: "Understanding Depression",
      description: "A comprehensive overview of depression, its symptoms, and treatment options.",
      date: "2023-08-03",
      time: "19:00",
      duration: "90 min",
      category: "mental-health",
      difficulty: "intermediate",
      presenter: "Dr. David Brown",
      registered: 267,
      maxParticipants: 400,
      thumbnail: "/thumbnails/depression.jpg",
      upcoming: false,
      featured: false,
    },
  ];

  const filteredWebinars = webinars.filter(webinar => {
    const matchesSearch = webinar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         webinar.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         webinar.presenter.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || webinar.category === selectedCategory;
    const matchesUpcoming = !showUpcoming || webinar.upcoming;
    return matchesSearch && matchesCategory && matchesUpcoming;
  });

  const featuredWebinars = webinars.filter(webinar => webinar.featured);
  const upcomingWebinars = webinars.filter(webinar => webinar.upcoming);
  const pastWebinars = webinars.filter(webinar => !webinar.upcoming);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleRegister = (webinarId: string) => {
    if (registeredWebinars.has(webinarId)) {
      setRegisteredWebinars(prev => {
        const newSet = new Set(prev);
        newSet.delete(webinarId);
        return newSet;
      });
    } else {
      setRegisteredWebinars(prev => new Set(prev).add(webinarId));
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Webinars & Workshops</h1>
        </div>
        
        {/* Hero Section */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Learn from the Experts</h2>
                  <p className="mb-6 text-blue-100 max-w-2xl">
                    Join our live webinars and workshops to learn from mental health experts and connect with others on a similar journey.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/dashboard/video-tutorials">
                      <Button 
                        variant="secondary" 
                        className="bg-white text-blue-600 hover:bg-gray-100"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Video Tutorials
                      </Button>
                    </Link>
                    <Link href="/dashboard/documentation">
                      <Button 
                        className="bg-white/20 backdrop-blur-sm text-white border-white hover:bg-white hover:text-blue-600 shadow-md"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Documentation
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="w-64 h-64 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Calendar className="h-24 w-24 text-white/80" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Star className="h-8 w-8 text-white" />
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
        
        {/* Featured Webinars */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Webinars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredWebinars.map((webinar) => (
              <motion.div
                key={webinar.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedWebinar(webinar)}
                >
                  <div className="relative">
                    <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                        <Video className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                      Featured
                    </Badge>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {webinar.duration}
                    </div>
                  </div>
                  <CardContent className="pt-4 flex-grow">
                    <h3 className="font-bold mb-2">{webinar.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{webinar.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(webinar.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {webinar.time}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge className={getDifficultyColor(webinar.difficulty)}>
                        {webinar.difficulty}
                      </Badge>
                      <span className="text-xs text-gray-500">By {webinar.presenter}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Upcoming Webinars */}
        {upcomingWebinars.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Upcoming Webinars</h2>
              <Button 
                variant={showUpcoming ? "default" : "outline"}
                onClick={() => setShowUpcoming(!showUpcoming)}
              >
                {showUpcoming ? "Hide" : "Show"} Upcoming
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingWebinars.map((webinar) => (
                <motion.div
                  key={webinar.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full flex flex-col border-gray-200 hover:shadow-md transition-shadow">
                    <div className="relative">
                      <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                        <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                          <Video className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                        Upcoming
                      </Badge>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {webinar.duration}
                      </div>
                    </div>
                    <CardContent className="pt-4 flex-grow">
                      <h3 className="font-bold mb-2">{webinar.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{webinar.description}</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(webinar.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {webinar.time}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {webinar.registered}/{webinar.maxParticipants} registered
                          </div>
                          <span className="text-xs text-gray-500">By {webinar.presenter}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge className={getDifficultyColor(webinar.difficulty)}>
                          {webinar.difficulty}
                        </Badge>
                        <Button 
                          variant={registeredWebinars.has(webinar.id) ? "outline" : "default"}
                          onClick={() => handleRegister(webinar.id)}
                          className="gap-2"
                        >
                          {registeredWebinars.has(webinar.id) ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Registered
                            </>
                          ) : (
                            <>
                              <Bell className="h-4 w-4" />
                              Register
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search webinars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-md"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </div>
        
        {/* Past Webinars */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Past Webinars</h2>
            <Button 
              variant={showUpcoming ? "outline" : "default"}
              onClick={() => setShowUpcoming(!showUpcoming)}
            >
              {showUpcoming ? "Show All" : "Show Upcoming"}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWebinars.map((webinar) => (
              <motion.div
                key={webinar.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedWebinar(webinar)}
                >
                  <div className="relative">
                    <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                        <Video className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    {webinar.featured && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                        Featured
                      </Badge>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {webinar.duration}
                    </div>
                  </div>
                  <CardContent className="pt-4 flex-grow">
                    <h3 className="font-bold mb-2">{webinar.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{webinar.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(webinar.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {webinar.time}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {webinar.registered}/{webinar.maxParticipants} attended
                        </div>
                        <span className="text-xs text-gray-500">By {webinar.presenter}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge className={getDifficultyColor(webinar.difficulty)}>
                        {webinar.difficulty}
                      </Badge>
                      <Button variant="outline" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        View Recording
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
        
        {filteredWebinars.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No webinars found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filter to find what you&apos;re looking for.
              </p>
              <Button onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setShowUpcoming(true);
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Webinar Details Modal */}
      {selectedWebinar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="relative">
              <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                  <Video className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedWebinar(null)}
                className="absolute top-4 right-4 text-black hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 flex-grow overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedWebinar.title}</h2>
                  <p className="text-gray-600">{selectedWebinar.description}</p>
                </div>
                {selectedWebinar.upcoming && (
                  <Button 
                    variant={registeredWebinars.has(selectedWebinar.id) ? "outline" : "default"}
                    onClick={() => handleRegister(selectedWebinar.id)}
                    className="gap-2"
                  >
                    {registeredWebinars.has(selectedWebinar.id) ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Registered
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4" />
                        Register Now
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-bold mb-3">Event Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{formatDate(selectedWebinar.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{selectedWebinar.time} ({selectedWebinar.duration})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{selectedWebinar.registered}/{selectedWebinar.maxParticipants} registered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-gray-500" />
                      <span>Presented by {selectedWebinar.presenter}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-3">About This Webinar</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Category:</span>
                      <Badge className={getDifficultyColor(selectedWebinar.difficulty)}>
                        {selectedWebinar.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <Badge className={selectedWebinar.upcoming ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
                        {selectedWebinar.upcoming ? "Upcoming" : "Completed"}
                      </Badge>
                    </div>
                    {selectedWebinar.featured && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Featured:</span>
                        <Badge className="bg-red-500 text-white">
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold mb-3">What You&apos;ll Learn</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Practical strategies you can implement immediately</li>
                  <li>Expert insights from leading professionals in the field</li>
                  <li>Opportunities to ask questions and get personalized advice</li>
                  <li>Resources and materials to support your journey</li>
                </ul>
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline" className="gap-2">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Add to Calendar
                </Button>
                
                {!selectedWebinar.upcoming && (
                  <Button variant="outline" className="gap-2">
                    <Video className="h-4 w-4" />
                    Watch Recording
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end">
              <Button onClick={() => setSelectedWebinar(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}