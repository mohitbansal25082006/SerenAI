"use client";

import { useState, useEffect } from "react";
import { 
  Brain, 
  TrendingUp, 
  Activity, 
  BookOpen, 
  ChevronLeft,
  Target,
  Lightbulb,
  BarChart3,
  Clock,
  Award,
  AlertTriangle,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";

interface Insight {
  id: string;
  title: string;
  description: string;
  type: "pattern" | "suggestion" | "warning";
  createdAt: Date;
}

interface WeeklyStats {
  avgMood: number;
  journalEntries: number;
  chatSessions: number;
  moodRecords: number;
  moodTrend: "up" | "down" | "stable";
  mostCommonEmotion: string;
  mostActiveDay: string;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { collapsed } = useSidebar();

  // Fetch insights and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsResponse, statsResponse] = await Promise.all([
          fetch("/api/insights"),
          fetch("/api/insights/stats")
        ]);

        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json();
          setInsights(insightsData.insights || []);
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setWeeklyStats(statsData.stats);
        }
      } catch (error) {
        console.error("Error fetching insights data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch("/api/insights/generate", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
        
        // Also refresh stats
        const statsResponse = await fetch("/api/insights/stats");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setWeeklyStats(statsData.stats);
        }
      }
    } catch (error) {
      console.error("Error generating insights:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/insights/export");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `serenai-insights-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "pattern":
        return <BarChart3 className="h-5 w-5 text-blue-500" />;
      case "suggestion":
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Brain className="h-5 w-5 text-purple-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">Personalized Insights</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportData}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button 
              onClick={handleGenerateInsights}
              disabled={isGenerating}
              className="gap-2"
            >
              <Brain className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate Insights"}
            </Button>
          </div>
        </div>

        {weeklyStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Average Mood</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{weeklyStats.avgMood.toFixed(1)}/10</div>
                <div className="flex items-center mt-2">
                  {weeklyStats.moodTrend === "up" ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">Improving</span>
                    </>
                  ) : weeklyStats.moodTrend === "down" ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />
                      <span className="text-sm text-red-600">Declining</span>
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm text-blue-600">Stable</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Journal Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{weeklyStats.journalEntries}</div>
                <p className="text-sm text-gray-500 mt-2">This week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Chat Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{weeklyStats.chatSessions}</div>
                <p className="text-sm text-gray-500 mt-2">This week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Most Common Emotion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{weeklyStats.mostCommonEmotion}</div>
                <p className="text-sm text-gray-500 mt-2">Detected this week</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Journaling</span>
                    <span className="text-sm text-gray-500">
                      {weeklyStats?.journalEntries || 0} entries
                    </span>
                  </div>
                  <Progress value={((weeklyStats?.journalEntries || 0) / 7) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Chat Sessions</span>
                    <span className="text-sm text-gray-500">
                      {weeklyStats?.chatSessions || 0} sessions
                    </span>
                  </div>
                  <Progress value={((weeklyStats?.chatSessions || 0) / 7) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Mood Tracking</span>
                    <span className="text-sm text-gray-500">
                      {weeklyStats?.moodRecords || 0} records
                    </span>
                  </div>
                  <Progress value={((weeklyStats?.moodRecords || 0) / 7) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Most Active Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {weeklyStats?.mostActiveDay || "N/A"}
                </div>
                <p className="text-gray-600 mb-4">
                  You tend to be most active on this day
                </p>
                <Badge variant="outline" className="gap-1">
                  <Award className="h-3 w-3" />
                  Peak Activity
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">AI-Generated Insights</h2>
          
          {insights.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No insights yet</h3>
                <p className="text-gray-600 mb-4">
                  Generate insights to see patterns and suggestions based on your activity.
                </p>
                <Button onClick={handleGenerateInsights} disabled={isGenerating}>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Insights
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{insight.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {formatDate(insight.createdAt)}
                          </Badge>
                        </div>
                        <p className="text-gray-700">{insight.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Wellness Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-2">Practice Mindfulness</h3>
                <p className="text-sm text-gray-600">
                  Take 5 minutes each day to focus on your breathing and be present in the moment.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium mb-2">Stay Connected</h3>
                <p className="text-sm text-gray-600">
                  Reach out to friends or family members regularly to maintain social connections.
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-medium mb-2">Physical Activity</h3>
                <p className="text-sm text-gray-600">
                  Even a short walk can boost your mood and reduce stress levels.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium mb-2">Quality Sleep</h3>
                <p className="text-sm text-gray-600">
                  Aim for 7-9 hours of sleep each night to support mental well-being.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}