"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, ArrowLeft, History, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string | Date;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messageCount: number;
}

interface ApiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm SerenAI, your mental wellness companion. How are you feeling today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { collapsed } = useSidebar();

  // Load conversation history
  const loadConversations = async () => {
    try {
      const response = await fetch('/api/chat/history');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        toast.error('Failed to load conversation history');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversation history');
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputValue, conversationId }),
      });
      
      if (!response.ok) throw new Error("Failed to send message");
      
      const data = await response.json();
      
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Refresh conversation list if this is a new conversation
      if (!conversationId) {
        loadConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: "1",
      role: "assistant",
      content: "Hello! I'm SerenAI, your mental wellness companion. How are you feeling today?",
      timestamp: new Date(),
    }]);
    setConversationId(null);
    inputRef.current?.focus();
  };

  const handleSaveConversation = async () => {
    if (messages.length <= 1) {
      toast.error('Not enough messages to save.');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const title = messages.length > 1 
        ? `${messages[1].content.substring(0, 30)}${messages[1].content.length > 30 ? '...' : ''}`
        : 'Conversation';
      
      const response = await fetch('/api/chat/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, title }),
      });
      
      if (response.ok) {
        toast.success('Conversation saved successfully!');
        const data = await response.json();
        setConversationId(data.conversationId);
        loadConversations();
      } else {
        toast.error('Failed to save conversation.');
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast.error('Failed to save conversation.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/chat/conversation/${id}`);
      if (response.ok) {
        const data = await response.json();
        
        const formattedMessages = data.messages.map((msg: ApiMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(formattedMessages);
        setConversationId(id);
        setShowHistory(false);
        scrollToBottom();
        inputRef.current?.focus();
      } else {
        toast.error('Failed to load conversation.');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation.');
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${
      collapsed ? "lg:pl-20" : "lg:pl-64"
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Chat with SerenAI</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowHistory(!showHistory)}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              History
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSaveConversation}
              disabled={isSaving || messages.length <= 1}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={handleClearChat} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear Chat
            </Button>
          </div>
        </div>

        {showHistory && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Conversation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No saved conversations yet.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {conversations.map((conversation) => (
                    <div 
                      key={conversation.id}
                      className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleLoadConversation(conversation.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{conversation.title}</h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(conversation.createdAt)} • {conversation.messageCount} messages
                          </p>
                        </div>
                        <Badge variant="outline">
                          {conversation.messageCount}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white"></div>
              </div>
              SerenAI
              <Badge variant="outline" className="ml-auto">
                Online
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white border border-gray-200 rounded-bl-none"
                    }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.role === "user" ? "text-blue-100" : "text-gray-500"
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 max-w-[80%]">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={inputValue.trim() === "" || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            SerenAI is not a substitute for professional medical advice. If you&apos;re in crisis, please contact a crisis hotline or emergency services.
          </p>
        </div>
      </div>
    </div>
  );
}