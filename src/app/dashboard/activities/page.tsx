"use client";

import { useState, useEffect } from "react";
import { 
  Activity, 
  Target, 
  Clock, 
  CheckCircle, 
  Play, 
  Pause,
  ChevronLeft,
  Heart,
  Brain,
  BookOpen,
  Dumbbell,
  Music,
  TreePine,
  Sun,
  Moon,
  Coffee,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";

interface WellnessActivity {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  type: "breathing" | "meditation" | "exercise" | "journaling" | "music" | "nature";
  icon: React.ReactNode;
  completed: boolean;
  progress?: number;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<WellnessActivity[]>([]);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { collapsed } = useSidebar();

  // Initialize activities
  useEffect(() => {
    setActivities([
      {
        id: "1",
        title: "Deep Breathing",
        description: "Practice deep breathing exercises to reduce stress",
        duration: 5,
        type: "breathing",
        icon: <Heart className="h-6 w-6 text-red-500" />,
        completed: false,
      },
      {
        id: "2",
        title: "Mindfulness Meditation",
        description: "10-minute guided meditation session",
        duration: 10,
        type: "meditation",
        icon: <Brain className="h-6 w-6 text-purple-500" />,
        completed: false,
      },
      {
        id: "3",
        title: "Gratitude Journaling",
        description: "Write about things you're grateful for",
        duration: 10,
        type: "journaling",
        icon: <BookOpen className="h-6 w-6 text-blue-500" />,
        completed: false,
      },
      {
        id: "4",
        title: "Quick Stretch",
        description: "5-minute stretching routine for relaxation",
        duration: 5,
        type: "exercise",
        icon: <Dumbbell className="h-6 w-6 text-green-500" />,
        completed: false,
      },
      {
        id: "5",
        title: "Calming Music",
        description: "Listen to soothing music for relaxation",
        duration: 15,
        type: "music",
        icon: <Music className="h-6 w-6 text-yellow-500" />,
        completed: false,
      },
      {
        id: "6",
        title: "Nature Walk",
        description: "Take a walk in nature to clear your mind",
        duration: 20,
        type: "nature",
        icon: <TreePine className="h-6 w-6 text-green-600" />,
        completed: false,
      },
    ]);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            // Mark activity as completed
            if (activeActivity) {
              setActivities(prev => 
                prev.map(act => 
                  act.id === activeActivity 
                    ? { ...act, completed: true, progress: 100 }
                    : act
                )
              );
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timeLeft, activeActivity]);

  const startActivity = (activityId: string, duration: number) => {
    setActiveActivity(activityId);
    setTimeLeft(duration * 60); // Convert minutes to seconds
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case "breathing":
        return <Heart className="h-4 w-4" />;
      case "meditation":
        return <Brain className="h-4 w-4" />;
      case "journaling":
        return <BookOpen className="h-4 w-4" />;
      case "exercise":
        return <Dumbbell className="h-4 w-4" />;
      case "music":
        return <Music className="h-4 w-4" />;
      case "nature":
        return <TreePine className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "breathing":
        return "bg-red-100 text-red-800";
      case "meditation":
        return "bg-purple-100 text-purple-800";
      case "journaling":
        return "bg-blue-100 text-blue-800";
      case "exercise":
        return "bg-green-100 text-green-800";
      case "music":
        return "bg-yellow-100 text-yellow-800";
      case "nature":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const completedCount = activities.filter(a => a.completed).length;
  const totalCount = activities.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" passHref legacyBehavior={false}>
              <Button variant="ghost" size="icon" asChild>
                <a>
                  <ChevronLeft className="h-5 w-5" />
                </a>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Wellness Activities</h1>
          </div>
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {completedCount}/{totalCount} Completed
          </Badge>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Daily Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Activities Completed</span>
                <span>{completionPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
              <p className="text-sm text-gray-600 mt-2">
                Complete all activities to earn your daily wellness streak!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Activity Timer */}
        {activeActivity && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Active Activity
                </span>
                <Badge variant="outline">
                  {formatTime(timeLeft)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {activities.find(a => a.id === activeActivity)?.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {activities.find(a => a.id === activeActivity)?.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveActivity(null);
                      setIsPlaying(false);
                      setTimeLeft(0);
                    }}
                  >
                    Stop
                  </Button>
                </div>
              </div>
              <Progress 
                value={activities.find(a => a.id === activeActivity)?.progress || 0} 
                className="mt-4 h-2" 
              />
            </CardContent>
          </Card>
        )}

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <Card 
              key={activity.id} 
              className={`transition-all duration-300 ${
                activity.completed 
                  ? "border-green-200 bg-green-50" 
                  : activeActivity === activity.id 
                    ? "border-blue-200 bg-blue-50" 
                    : "hover:shadow-md"
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {activity.icon}
                    <span>{activity.title}</span>
                  </div>
                  {activity.completed && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{activity.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getActivityTypeColor(activity.type)}>
                    {getActivityTypeIcon(activity.type)}
                    <span className="ml-1 capitalize">{activity.type}</span>
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {activity.duration} min
                  </div>
                </div>
                
                {activity.progress !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{activity.progress}%</span>
                    </div>
                    <Progress value={activity.progress} className="h-2" />
                  </div>
                )}
                
                <Button
                  className="w-full"
                  onClick={() => startActivity(activity.id, activity.duration)}
                  disabled={activity.completed || activeActivity !== null}
                  variant={activity.completed ? "outline" : "default"}
                >
                  {activity.completed ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </>
                  ) : activeActivity === activity.id ? (
                    <>
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          In Progress
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Activity
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Wellness Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Wellness Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Sun className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Morning Routine</h3>
                <p className="text-sm text-gray-600">Start your day with 5 minutes of stretching</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Coffee className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Hydration</h3>
                <p className="text-sm text-gray-600">Drink 8 glasses of water throughout the day</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TreePine className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Nature Break</h3>
                <p className="text-sm text-gray-600">Take a 10-minute walk outside</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Moon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Digital Detox</h3>
                <p className="text-sm text-gray-600">Unplug 1 hour before bedtime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}