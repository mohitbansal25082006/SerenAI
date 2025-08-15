"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Video, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ChevronLeft,
  Clock,
  BookOpen,
  MessageSquare,
  Search,
  Filter,
  Star,
  Download,
  Share,
  Heart,
  Eye,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  views: number;
  likes: number;
  thumbnail: string;
  uploadDate: string;
  featured: boolean;
}

export default function VideoTutorialsPage() {
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const { collapsed } = useSidebar();
  const videoRef = useRef<HTMLVideoElement>(null);

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "getting-started", name: "Getting Started" },
    { id: "chat", name: "AI Chat" },
    { id: "journal", name: "Journaling" },
    { id: "mood", name: "Mood Tracking" },
    { id: "activities", name: "Wellness Activities" },
    { id: "insights", name: "Insights" },
  ];

  const videoTutorials: VideoTutorial[] = [
    {
      id: "1",
      title: "Getting Started with SerenAI",
      description: "Learn how to set up your account and navigate the dashboard.",
      duration: "8:45",
      category: "getting-started",
      difficulty: "beginner",
      views: 12450,
      likes: 342,
      thumbnail: "/thumbnails/getting-started.jpg",
      uploadDate: "2 weeks ago",
      featured: true,
    },
    {
      id: "2",
      title: "Using the AI Chat Feature",
      description: "Discover how to have meaningful conversations with SerenAI.",
      duration: "12:30",
      category: "chat",
      difficulty: "beginner",
      views: 8765,
      likes: 256,
      thumbnail: "/thumbnails/ai-chat.jpg",
      uploadDate: "1 week ago",
      featured: true,
    },
    {
      id: "3",
      title: "Journaling for Mental Wellness",
      description: "Learn effective journaling techniques to improve your mental health.",
      duration: "15:20",
      category: "journal",
      difficulty: "intermediate",
      views: 6543,
      likes: 189,
      thumbnail: "/thumbnails/journaling.jpg",
      uploadDate: "3 days ago",
      featured: false,
    },
    {
      id: "4",
      title: "Understanding Mood Patterns",
      description: "Track and analyze your mood to gain insights into your emotional well-being.",
      duration: "10:15",
      category: "mood",
      difficulty: "intermediate",
      views: 5432,
      likes: 167,
      thumbnail: "/thumbnails/mood-patterns.jpg",
      uploadDate: "5 days ago",
      featured: false,
    },
    {
      id: "5",
      title: "Wellness Activities Guide",
      description: "Explore different activities designed to improve your mental wellness.",
      duration: "14:50",
      category: "activities",
      difficulty: "beginner",
      views: 7890,
      likes: 298,
      thumbnail: "/thumbnails/wellness-activities.jpg",
      uploadDate: "1 week ago",
      featured: true,
    },
    {
      id: "6",
      title: "Understanding Your Insights",
      description: "Learn how to interpret AI-generated insights and use them effectively.",
      duration: "18:25",
      category: "insights",
      difficulty: "advanced",
      views: 4321,
      likes: 134,
      thumbnail: "/thumbnails/insights.jpg",
      uploadDate: "2 days ago",
      featured: false,
    },
    {
      id: "7",
      title: "Advanced Journaling Techniques",
      description: "Take your journaling practice to the next level with these advanced methods.",
      duration: "22:10",
      category: "journal",
      difficulty: "advanced",
      views: 3210,
      likes: 98,
      thumbnail: "/thumbnails/advanced-journaling.jpg",
      uploadDate: "4 days ago",
      featured: false,
    },
    {
      id: "8",
      title: "Breathing Exercises for Stress Relief",
      description: "Learn simple breathing techniques to reduce stress and anxiety.",
      duration: "7:30",
      category: "activities",
      difficulty: "beginner",
      views: 9876,
      likes: 421,
      thumbnail: "/thumbnails/breathing-exercises.jpg",
      uploadDate: "6 days ago",
      featured: false,
    },
  ];

  const filteredVideos = videoTutorials.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredVideos = videoTutorials.filter(video => video.featured);
  const recommendedVideos = videoTutorials.filter(video => !watchedVideos.has(video.id)).slice(0, 3);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        // Add to watched videos if not already there
        if (selectedVideo && !watchedVideos.has(selectedVideo.id)) {
          setWatchedVideos(prev => new Set(prev).add(selectedVideo.id));
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume / 100;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleLike = (videoId: string) => {
    if (likedVideos.has(videoId)) {
      setLikedVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    } else {
      setLikedVideos(prev => new Set(prev).add(videoId));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if (duration) {
        setProgress((currentTime / duration) * 100);
      }
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setProgress(100);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
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
          <h1 className="text-3xl font-bold">Video Tutorials</h1>
        </div>
        
        {/* Hero Section */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Learn at Your Own Pace</h2>
                  <p className="mb-6 text-blue-100 max-w-2xl">
                    Our video tutorials are designed to help you make the most of SerenAI&apos;s features 
                    and support your mental wellness journey.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/dashboard/documentation">
                      <Button 
                        variant="secondary" 
                        className="bg-white text-blue-600 hover:bg-gray-100"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Documentation
                      </Button>
                    </Link>
                    <Link href="/dashboard/webinars-workshops">
                      <Button 
                        className="bg-white/20 backdrop-blur-sm text-white border-white hover:bg-white hover:text-blue-600 shadow-md"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Webinars
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="w-64 h-64 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Video className="h-24 w-24 text-white/80" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Featured Videos */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredVideos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative">
                    <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                      Featured
                    </Badge>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <CardContent className="pt-4 flex-grow">
                    <h3 className="font-bold mb-2">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{video.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {formatViews(video.views)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {video.likes}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search videos..."
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
        
        {/* Recommended Videos */}
        {recommendedVideos.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedVideos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full flex flex-col border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative">
                      <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                        <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <CardContent className="pt-4 flex-grow">
                      <h3 className="font-bold mb-2">{video.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{video.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {formatViews(video.views)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {video.likes}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* All Videos */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative">
                    <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    {video.featured && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                        Featured
                      </Badge>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    {watchedVideos.has(video.id) && (
                      <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                        Watched
                      </Badge>
                    )}
                  </div>
                  <CardContent className="pt-4 flex-grow">
                    <h3 className="font-bold mb-2">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{video.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {formatViews(video.views)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {video.likes}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge className={getDifficultyColor(video.difficulty)}>
                        {video.difficulty}
                      </Badge>
                      <span className="text-xs text-gray-500">{video.uploadDate}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
        
        {filteredVideos.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No videos found</h3>
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
      </div>
      
      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="bg-black rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full max-h-[60vh]"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnd}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                poster={selectedVideo.thumbnail}
              >
                <source src="/videos/sample-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-4 mb-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handlePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  
                  <div className="flex-1">
                    <Progress value={progress} className="h-1" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-24 accent-blue-500"
                    />
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-white text-sm">
                  {selectedVideo.title}
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 text-white hover:bg-white/20"
              >
                X
              </Button>
            </div>
            
            <div className="p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
              <p className="text-gray-300 mb-4">{selectedVideo.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{formatViews(selectedVideo.views)} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedVideo.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedVideo.uploadDate}</span>
                </div>
                <Badge className={getDifficultyColor(selectedVideo.difficulty)}>
                  {selectedVideo.difficulty}
                </Badge>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  variant={likedVideos.has(selectedVideo.id) ? "default" : "outline"}
                  onClick={() => handleLike(selectedVideo.id)}
                  className="gap-2"
                >
                  <Heart className="h-4 w-4" />
                  {likedVideos.has(selectedVideo.id) ? "Liked" : "Like"}
                </Button>
                
                <Button variant="outline" className="gap-2">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}