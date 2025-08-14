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
  // backend may return ISO strings — accept both
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
  },
  {
    icon: <Frown className="h-6 w-6 text-orange-500" />,
    value: 4,
    label: "Sad",
  },
  { icon: <Meh className="h-6 w-6 text-yellow-500" />, value: 6, label: "Neutral" },
  { icon: <Smile className="h-6 w-6 text-green-500" />, value: 8, label: "Happy" },
  { icon: <Smile className="h-6 w-6 text-blue-500" />, value: 10, label: "Very Happy" },
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

  // Fetch journal entries
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

  // Generate AI prompt
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

      // send only the expected payload (omit currentTag)
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
        // Refresh entries
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

        // Reset form
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
    // browser confirm is fine in a client component
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
            <h1 className="text-2xl font-bold">Journal</h1>
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
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {isCreating ? "Cancel" : "New Entry"}
          </Button>
        </div>

        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {editingId ? "Edit Entry" : "New Journal Entry"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Title (optional)"
                value={currentEntry.title}
                onChange={(e) =>
                  setCurrentEntry({ ...currentEntry, title: e.target.value })
                }
              />

              <Textarea
                placeholder="What's on your mind?"
                value={currentEntry.content}
                onChange={(e) =>
                  setCurrentEntry({ ...currentEntry, content: e.target.value })
                }
                rows={6}
              />

              <div>
                <label className="block text-sm font-medium mb-2">How are you feeling?</label>
                <div className="flex justify-between">
                  {moodEmojis.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setCurrentEntry({ ...currentEntry, mood: mood.value })}
                      className={`flex flex-col items-center p-2 rounded-lg ${
                        currentEntry.mood === mood.value ? "bg-blue-100" : ""
                      }`}
                    >
                      {mood.icon}
                      <span className="text-xs mt-1">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a tag"
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
                  />
                  <Button type="button" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentEntry.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
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
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEntry} disabled={!currentEntry.content.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {entries.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No journal entries yet</h3>
              <p className="text-gray-600 mb-4">
                Start your journaling journey by creating your first entry.
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      {entry.title && <CardTitle>{entry.title}</CardTitle>}
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {formatDate(entry.createdAt)}
                        </span>
                        {entry.mood && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">Mood: {entry.mood}/10</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditEntry(entry)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line mb-4">{entry.content}</div>

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          <Tag className="h-3 w-3 mr-1" />
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
