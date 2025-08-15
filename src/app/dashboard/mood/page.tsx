"use client";
import { useState, useEffect } from "react";
import {
  BarChart3,
  Plus,
  TrendingUp,
  ChevronLeft,
  Frown,
  Meh,
  Smile,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";

interface MoodRecord {
  id: string;
  mood: number;
  note?: string;
  createdAt: Date;
}

type RawRecord = {
  id: string;
  mood: number | string;
  note?: string | null;
  createdAt?: string | number | null;
};

type DayStat = {
  date: Date;
  dateKey: string;
  dayName: string;
  records: MoodRecord[];
  avgMood: number;
};

const moodEmojis = [
  { icon: <Frown className="h-8 w-8 text-red-500" />, value: 2, label: "Very Sad" },
  { icon: <Frown className="h-8 w-8 text-orange-500" />, value: 4, label: "Sad" },
  { icon: <Meh className="h-8 w-8 text-yellow-500" />, value: 6, label: "Neutral" },
  { icon: <Smile className="h-8 w-8 text-green-500" />, value: 8, label: "Happy" },
  { icon: <Smile className="h-8 w-8 text-blue-500" />, value: 10, label: "Very Happy" },
];

export default function MoodPage() {
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<{ mood: number; note: string }>({
    mood: 6,
    note: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const { collapsed } = useSidebar();

  // Fetch mood records and normalize
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch("/api/mood");
        if (!response.ok) {
          console.error("Failed to fetch mood records:", await response.text());
          setIsLoading(false);
          return;
        }
        const data = await response.json();
        const raw: RawRecord[] = Array.isArray(data.records) ? data.records : [];
        const loaded: MoodRecord[] = raw.map((r) => ({
          id: r.id,
          // ensure mood is a number
          mood: typeof r.mood === "number" ? r.mood : Number(r.mood) || 0,
          note: r.note ?? undefined,
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        }));
        setRecords(loaded);
      } catch (error) {
        console.error("Error fetching mood records:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const handleSaveRecord = async () => {
    setIsLoading(true);
    try {
      const payload = {
        mood: currentRecord.mood,
        note: currentRecord.note,
      };
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        // refresh normalized data
        const fetchResponse = await fetch("/api/mood");
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          const raw: RawRecord[] = Array.isArray(data.records) ? data.records : [];
          const loaded: MoodRecord[] = raw.map((r) => ({
            id: r.id,
            mood: typeof r.mood === "number" ? r.mood : Number(r.mood) || 0,
            note: r.note ?? undefined,
            createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          }));
          setRecords(loaded);
        }
        setCurrentRecord({ mood: 6, note: "" });
        setIsAdding(false);
      } else {
        console.error("Failed to save mood record:", await response.text());
      }
    } catch (error) {
      console.error("Error saving mood record:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const response = await fetch(`/api/mood/${id}`, { method: "DELETE" });
      if (response.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      } else {
        console.error("Failed to delete mood record:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting mood record:", error);
    }
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Calculate average mood
  const avgMood =
    records.length > 0 ? records.reduce((sum, r) => sum + r.mood, 0) / records.length : 0;

  // Group records by day
  const recordsByDay: Record<string, MoodRecord[]> = {};
  records.forEach((record) => {
    const d = new Date(record.createdAt);
    const dateKey = d.toISOString().split("T")[0];
    if (!recordsByDay[dateKey]) recordsByDay[dateKey] = [];
    recordsByDay[dateKey].push(record);
  });

  // Build last 7 days stats
  const last7Days: DayStat[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    const dayRecords = recordsByDay[dateKey] ?? [];
    const avg =
      dayRecords.length > 0 ? dayRecords.reduce((s, r) => s + r.mood, 0) / dayRecords.length : 0;
    last7Days.push({
      date,
      dateKey,
      dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      records: dayRecords,
      avgMood: avg,
    });
  }

  if (isLoading && records.length === 0) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${
          collapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${
        collapsed ? "lg:pl-20" : "lg:pl-64"
      }`}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" legacyBehavior>
              <a>
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </a>
            </Link>
            <h1 className="text-2xl font-bold">Mood Tracker</h1>
          </div>
          <Button
            onClick={() => {
              setIsAdding(!isAdding);
              if (!isAdding) {
                setCurrentRecord({ mood: 6, note: "" });
              }
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {isAdding ? "Cancel" : "Track Mood"}
          </Button>
        </div>

        {isAdding && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Track Your Mood
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  How are you feeling right now?
                </label>
                <div className="flex justify-between">
                  {moodEmojis.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setCurrentRecord({ ...currentRecord, mood: mood.value })}
                      className={`flex flex-col items-center p-2 rounded-lg ${
                        currentRecord.mood === mood.value ? "bg-blue-100" : ""
                      }`}
                    >
                      {mood.icon}
                      <span className="text-xs mt-1">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <Textarea
                  placeholder="What's contributing to your mood?"
                  value={currentRecord.note}
                  onChange={(e) => setCurrentRecord({ ...currentRecord, note: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveRecord}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Record
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Mood</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgMood.toFixed(1)}/10</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+0.2 from last week</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{records.length}</div>
              <p className="text-sm text-gray-500 mt-2">Keep tracking to see patterns</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">7 days</div>
              <p className="text-sm text-gray-500 mt-2">Great job!</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Mood Chart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col mt-4">
              {/* Y-axis labels */}
              <div className="flex h-full">
                <div className="flex flex-col justify-between text-xs text-gray-500 pr-2">
                  <span>10</span>
                  <span>7.5</span>
                  <span>5</span>
                  <span>2.5</span>
                  <span>0</span>
                </div>
                
                {/* Chart area */}
                <div className="flex-1 flex items-end justify-between gap-2 border-l border-b border-gray-200">
                  {last7Days.map((day, index) => (
                    <div key={day.dateKey} className="flex flex-col items-center flex-1 h-full justify-end">
                      <div className="text-xs text-gray-500 mb-1">{day.dayName}</div>
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all duration-500 hover:from-blue-400 hover:to-blue-200"
                        style={{ height: `${(day.avgMood / 10) * 100}%`, minHeight: '4px' }}
                      ></div>
                      <div className="text-xs mt-1 text-gray-700">{day.avgMood.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {records.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No mood records yet</h3>
              <p className="text-gray-600 mb-4">
                Start tracking your mood to see patterns and insights.
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Track Mood
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Recent Records</h2>
            {records.slice(0, 10).map((record) => {
              const moodEmoji = moodEmojis.find((m) => m.value === Math.round(record.mood));
              return (
                <Card key={record.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{moodEmoji?.icon}</div>
                        <div>
                          <div className="font-medium">Mood: {record.mood}/10</div>
                          <div className="text-sm text-gray-500 mb-2">{formatDate(record.createdAt)}</div>
                          {record.note && <p className="text-gray-700">{record.note}</p>}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteRecord(record.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}