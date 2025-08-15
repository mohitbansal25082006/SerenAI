"use client";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Plus,
  Save,
  X,
  Meh,
  Frown,
  Smile,
  Tag,
  Trash2,
  Edit3,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";

interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  mood?: number;
  tags: string[];
  createdAt: string | Date;
}

type RawEntry = {
  id: string;
  title?: string;
  content: string;
  mood?: number;
  tags?: string[] | null;
  createdAt?: string | number | null;
};

type CurrentEntryState = {
  title: string;
  content: string;
  mood: number;
  tags: string[];
  currentTag: string;
};

const moodEmojis = [
  {
    icon: <Frown className="h-6 w-6 text-red-500" />,
    value: 2,
    label: "Very Sad",
    color: "bg-red-50 border-red-200",
  },
  {
    icon: <Frown className="h-6 w-6 text-orange-500" />,
    value: 4,
    label: "Sad",
    color: "bg-orange-50 border-orange-200",
  },
  { 
    icon: <Meh className="h-6 w-6 text-yellow-500" />, 
    value: 6, 
    label: "Neutral",
    color: "bg-yellow-50 border-yellow-200",
  },
  { 
    icon: <Smile className="h-6 w-6 text-green-500" />, 
    value: 8, 
    label: "Happy",
    color: "bg-green-50 border-green-200",
  },
  { 
    icon: <Smile className="h-6 w-6 text-blue-500" />, 
    value: 10, 
    label: "Very Happy",
    color: "bg-blue-50 border-blue-200",
  },
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentEntry, setCurrentEntry] = useState<CurrentEntryState>({
    title: "",
    content: "",
    mood: 6,
    tags: [],
    currentTag: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("");
  const { collapsed } = useSidebar();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch("/api/journal");
        if (response.ok) {
          const data = await response.json();
          const loaded: JournalEntry[] = (data.entries || []).map((e: RawEntry) => ({
            id: e.id,
            title: e.title,
            content: e.content,
            mood: typeof e.mood === "number" ? e.mood : undefined,
            tags: Array.isArray(e.tags) ? e.tags : [],
            createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
          }));
          setEntries(loaded);
        }
      } catch (error) {
        console.error("Error fetching journal entries:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntries();
  }, []);

  useEffect(() => {
    const generatePrompt = async () => {
      try {
        const response = await fetch("/api/journal/prompt");
        if (response.ok) {
          const data = await response.json();
          setAiPrompt(data.prompt || "");
        }
      } catch (error) {
        console.error("Error generating AI prompt:", error);
      }
    };
    generatePrompt();
  }, []);

  const handleSaveEntry = async () => {
    if (!currentEntry.content.trim()) return;
    setIsLoading(true);
    try {
      const url = editingId ? `/api/journal/${editingId}` : "/api/journal";
      const method = editingId ? "PUT" : "POST";
      const payload = {
        title: currentEntry.title,
        content: currentEntry.content,
        mood: currentEntry.mood,
        tags: currentEntry.tags,
      };
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const fetchResponse = await fetch("/api/journal");
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          const loaded: JournalEntry[] = (data.entries || []).map((e: RawEntry) => ({
            id: e.id,
            title: e.title,
            content: e.content,
            mood: typeof e.mood === "number" ? e.mood : undefined,
            tags: Array.isArray(e.tags) ? e.tags : [],
            createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
          }));
          setEntries(loaded);
        }
        setCurrentEntry({
          title: "",
          content: "",
          mood: 6,
          tags: [],
          currentTag: "",
        });
        setIsCreating(false);
        setEditingId(null);
      } else {
        console.error("Failed to save entry:", await response.text());
      }
    } catch (error) {
      console.error("Error saving journal entry:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
      } else {
        console.error("Failed to delete entry:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting journal entry:", error);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setCurrentEntry({
      title: entry.title || "",
      content: entry.content,
      mood: entry.mood || 6,
      tags: entry.tags || [],
      currentTag: "",
    });
    setEditingId(entry.id);
    setIsCreating(true);
  };

  const handleAddTag = () => {
    const tag = currentEntry.currentTag.trim();
    if (tag && !currentEntry.tags.includes(tag)) {
      setCurrentEntry({
        ...currentEntry,
        tags: [...currentEntry.tags, tag],
        currentTag: "",
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setCurrentEntry({
      ...currentEntry,
      tags: currentEntry.tags.filter((t) => t !== tag),
    });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading && entries.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-900 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading your journal entries...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-900 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" legacyBehavior>
              <a>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-purple-100 transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </a>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">My Journal</h1>
          </div>
          <Button
            onClick={() => {
              setIsCreating(!isCreating);
              if (!isCreating) {
                setCurrentEntry({
                  title: "",
                  content: aiPrompt,
                  mood: 6,
                  tags: [],
                  currentTag: "",
                });
                setEditingId(null);
              }
            }}
            className={`gap-2 rounded-full px-5 py-2.5 shadow-md transition-all ${isCreating ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'}`}
          >
            <Plus className="h-4 w-4" />
            {isCreating ? "Cancel" : "New Entry"}
          </Button>
        </div>

        {isCreating && (
          <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 pb-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <BookOpen className="h-5 w-5 text-purple-600" />
                {editingId ? "Edit Entry" : "New Journal Entry"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Title (optional)</label>
                <Input
                  placeholder="Give your entry a title..."
                  value={currentEntry.title}
                  onChange={(e) =>
                    setCurrentEntry({ ...currentEntry, title: e.target.value })
                  }
                  className="rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-200"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">What&apos;s on your mind?</label>
                <Textarea
                  placeholder="Express your thoughts, feelings, and experiences..."
                  value={currentEntry.content}
                  onChange={(e) =>
                    setCurrentEntry({ ...currentEntry, content: e.target.value })
                  }
                  rows={6}
                  className="rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-200"
                />
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">How are you feeling?</label>
                <div className="grid grid-cols-5 gap-2">
                  {moodEmojis.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setCurrentEntry({ ...currentEntry, mood: mood.value })}
                      className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-200 ${currentEntry.mood === mood.value ? `${mood.color} border-purple-400 shadow-sm scale-105` : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                    >
                      {mood.icon}
                      <span className="text-xs mt-1 font-medium">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={currentEntry.currentTag}
                    onChange={(e) =>
                      setCurrentEntry({ ...currentEntry, currentTag: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-200"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddTag}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl px-4"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentEntry.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="gap-1 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded-full px-3 py-1.5 transition-colors"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreating(false)}
                  className="rounded-xl px-5 py-2.5 border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEntry} 
                  disabled={!currentEntry.content.trim()}
                  className="rounded-xl px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {entries.length === 0 ? (
          <Card className="text-center py-16 border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl">
            <CardContent>
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Your journal is empty</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start your journaling journey by creating your first entry. Reflect on your thoughts and experiences.
              </p>
              <Button 
                onClick={() => setIsCreating(true)}
                className="rounded-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <Card 
                key={entry.id} 
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      {entry.title && (
                        <CardTitle className="text-xl mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          {entry.title}
                        </CardTitle>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 font-medium">
                            {formatDate(entry.createdAt)}
                          </span>
                        </div>
                        {entry.mood && (
                          <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
                            <span className="text-sm text-gray-600 font-medium">Mood:</span>
                            <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                              {entry.mood}/10
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditEntry(entry)}
                        className="rounded-full hover:bg-purple-100 text-gray-500 hover:text-purple-600 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="whitespace-pre-line mb-5 text-gray-700 leading-relaxed">
                    {entry.content}
                  </div>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="gap-1 bg-purple-50 text-purple-700 border-purple-200 rounded-full px-3 py-1.5 hover:bg-purple-100 transition-colors"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}