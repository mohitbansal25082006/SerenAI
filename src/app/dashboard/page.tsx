"use client";

import React from "react";
import { useState, useEffect } from "react";
import ThreeBackground from "@/components/dashboard/ThreeBackground";
import { motion } from "framer-motion";
import {
  MessageSquare,
  BookOpen,
  BarChart3,
  TrendingUp,
  Heart,
  Calendar,
  Activity,
  Brain,
  Zap,
  Target,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useSidebar } from "@/contexts/SidebarContext";
import { useUser } from "@clerk/nextjs";

interface MoodItem {
  day: string;
  mood: number;
}

interface UserStats {
  avgMood?: number;
  streak?: number;
  completedActivities?: number;
  moodData?: MoodItem[];
}

interface ActivityItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  completed: boolean;
}

interface InsightItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function Dashboard(): React.ReactElement {
  const [greeting, setGreeting] = useState<string>("");
  const [moodScore, setMoodScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [completedActivities, setCompletedActivities] = useState<number>(0);
  const [moodData, setMoodData] = useState<MoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { collapsed } = useSidebar();
  const { user } = useUser();

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        // Stop loading if there's no authenticated user so the UI doesn't hang
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/stats`);
        if (response.ok) {
          const data = (await response.json()) as UserStats;
          setMoodScore(data.avgMood ?? 0);
          setStreak(data.streak ?? 0);
          setCompletedActivities(data.completedActivities ?? 0);
          setMoodData(data.moodData ?? []);
        } else {
          console.error("Failed to fetch user stats:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Recommended activities
  const activities: ActivityItem[] = [
    {
      title: "Breathing Exercise",
      description: "5-minute guided breathing",
      icon: <Heart className="h-5 w-5 text-red-400" />,
      duration: "5 min",
      completed: completedActivities > 0,
    },
    {
      title: "Gratitude Journaling",
      description: "Write about things you're grateful for",
      icon: <BookOpen className="h-5 w-5 text-blue-400" />,
      duration: "10 min",
      completed: completedActivities > 1,
    },
    {
      title: "Mindful Walking",
      description: "Practice mindfulness while walking",
      icon: <Activity className="h-5 w-5 text-green-400" />,
      duration: "15 min",
      completed: completedActivities > 2,
    },
    {
      title: "Body Scan Meditation",
      description: "Release tension with body awareness",
      icon: <Brain className="h-5 w-5 text-purple-400" />,
      duration: "20 min",
      completed: completedActivities > 3,
    },
  ];

  // Recent insights
  const insights: InsightItem[] = [
    {
      title: "Mood Pattern",
      description:
        "Your mood tends to improve in the evenings. Consider scheduling challenging tasks for earlier in the day.",
      icon: <BarChart3 className="h-5 w-5 text-blue-400" />,
      color: "bg-blue-100 border-blue-200",
    },
    {
      title: "Suggested Activity",
      description:
        "Based on your recent journal entries, try a 10-minute gratitude meditation before bed tonight.",
      icon: <Lightbulb className="h-5 w-5 text-yellow-400" />,
      color: "bg-yellow-100 border-yellow-200",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 relative flex items-center justify-center">
        <ThreeBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 relative">
      <ThreeBackground />

      <div className={`relative z-10 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{greeting}, {user?.firstName || 'User'}!</h1>
              <p className="text-gray-600">How are you feeling today?</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Mood Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold">{moodScore.toFixed(1)}/10</div>
                  <div className="flex items-center text-green-600 text-sm">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +0.8
                  </div>
                </div>
                <Progress value={moodScore * 10} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Current Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{streak} days</div>
                  <div className="bg-orange-100 p-1 rounded-full">
                    <Zap className="h-4 w-4 text-orange-500" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Keep it up!</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{completedActivities}/4</div>
                  <div className="bg-green-100 p-1 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <Progress value={completedActivities * 25} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Next Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold">Today, 6 PM</div>
                  <div className="bg-blue-100 p-1 rounded-full">
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Evening check-in</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-blue-100 to-blue-50 backdrop-blur-md border-blue-200 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  Chat with SerenAI
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Start a conversation with your AI companion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/chat">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Chatting</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-purple-100 to-purple-50 backdrop-blur-md border-purple-200 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  Journal Entry
                </CardTitle>
                <CardDescription className="text-gray-600">Record your thoughts and feelings</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/journal">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Write Entry</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="bg-gradient-to-br from-green-100 to-green-50 backdrop-blur-md border-green-200 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  Mood Tracker
                </CardTitle>
                <CardDescription className="text-gray-600">Track your emotional patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/mood">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Track Mood</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Mood Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Weekly Mood Trends
                </CardTitle>
                <CardDescription className="text-gray-600">Your emotional patterns over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2 mt-4">
                  {moodData.length > 0 ? (
                    moodData.map((item, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div className="text-xs text-gray-500 mb-1">{item.day}</div>
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all duration-500 hover:from-blue-400 hover:to-blue-200"
                          style={{ height: `${item.mood * 10}%` }}
                        ></div>
                        <div className="text-xs mt-1 text-gray-700">{item.mood.toFixed(1)}</div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">No mood data available yet</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Daily Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Target className="h-5 w-5 text-green-500" />
                  Daily Activities
                </CardTitle>
                <CardDescription className="text-gray-600">Complete these activities for better mental wellness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className={`p-2 rounded-lg ${activity.completed ? 'bg-green-100' : 'bg-gray-200'}`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{activity.title}</h3>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{activity.duration}</span>
                        {activity.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Button size="sm" className="h-7 text-xs">Start</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <Card className="bg-white/80 backdrop-blur-md border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Brain className="h-5 w-5 text-purple-500" />
                Personalized Insights
              </CardTitle>
              <CardDescription className="text-gray-600">AI-powered insights based on your recent activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${insight.color}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{insight.icon}</div>
                      <div>
                        <h3 className="font-medium mb-1">{insight.title}</h3>
                        <p className="text-sm">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
