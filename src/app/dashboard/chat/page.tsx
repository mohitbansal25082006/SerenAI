"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, ArrowLeft, History, Save, X, Mic, MicOff, Volume2, VolumeX, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";
import { toast } from "sonner";
// Define types for SpeechRecognition API
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult[];
  [index: number]: SpeechRecognitionResult[];
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}
interface Window {
  SpeechRecognition: {
    new (): SpeechRecognition;
  };
  webkitSpeechRecognition: {
    new (): SpeechRecognition;
  };
  speechSynthesis: SpeechSynthesis;
}
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
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [ttsLanguage, setTtsLanguage] = useState('en-US');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef<string>("");
  const { collapsed } = useSidebar();
  // Check if browser supports speech recognition and text-to-speech
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as unknown as Window).SpeechRecognition || 
                               (window as unknown as Window).webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
      setTtsSupported('speechSynthesis' in window);
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          transcriptRef.current = transcript;
          setInputValue(transcript);
        };
        
        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          setInputValue('');
          transcriptRef.current = '';
          toast.error('Speech recognition error. Please try again.');
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
          // Automatically send the message if there's a transcript
          if (transcriptRef.current.trim() !== '') {
            handleSendMessage(transcriptRef.current);
            transcriptRef.current = '';
          }
        };
      }
    }
  }, []);
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
  // Text-to-speech function
  const speakText = (text: string) => {
    if (!ttsSupported || !ttsEnabled) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = ttsLanguage;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Try to find a voice that matches the language
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(ttsLanguage.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }
    
    window.speechSynthesis.speak(utterance);
  };
  // Toggle text-to-speech
  const toggleTts = () => {
    if (!ttsSupported) {
      toast.error('Text-to-speech is not supported in your browser.');
      return;
    }
    
    setTtsEnabled(!ttsEnabled);
    
    if (ttsEnabled) {
      // If turning off, cancel any ongoing speech
      window.speechSynthesis.cancel();
    }
  };
  // Toggle TTS language between English and Hindi
  const toggleTtsLanguage = () => {
    setTtsLanguage(prev => prev === 'en-US' ? 'hi-IN' : 'en-US');
    toast.success(`TTS language changed to ${ttsLanguage === 'en-US' ? 'Hindi' : 'English'}`);
  };
  // Speak assistant messages when they arrive
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        speakText(lastMessage.content);
      }
    }
    
    // Cleanup speech synthesis on unmount
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [messages, ttsLanguage]);
  const toggleListening = () => {
    if (!speechSupported) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      transcriptRef.current = ''; // Clear any previous transcript
      setInputValue('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };
  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputValue;
    if (messageToSend.trim() === "" || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: messageToSend, 
          conversationId,
          language: ttsLanguage === 'hi-IN' ? 'hindi' : 'english'
        }),
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
  const handleDeleteConversation = async (id: string) => {
    setIsDeleting(id);
    try {
      const response = await fetch(`/api/chat/conversation/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Conversation deleted successfully!');
        loadConversations();
        // If we're currently viewing the deleted conversation, clear the chat
        if (conversationId === id) {
          handleClearChat();
        }
      } else {
        toast.error('Failed to delete conversation.');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation.');
    } finally {
      setIsDeleting(null);
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
            <Button 
              variant="outline" 
              onClick={toggleTts}
              disabled={!ttsSupported}
              className={`gap-2 ${ttsEnabled ? 'bg-green-100 text-green-700' : ''}`}
            >
              {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {ttsEnabled ? "Voice On" : "Voice Off"}
            </Button>
            <Button 
              variant="outline" 
              onClick={toggleTtsLanguage}
              disabled={!ttsSupported}
              className={`gap-2 ${ttsLanguage === 'hi-IN' ? 'bg-purple-100 text-purple-700' : ''}`}
            >
              <Languages className="h-4 w-4" />
              {ttsLanguage === 'hi-IN' ? 'Hindi' : 'English'}
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
                      className="group p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors relative"
                    >
                      <div 
                        className="cursor-pointer"
                        onClick={() => handleLoadConversation(conversation.id)}
                      >
                        <div className="flex justify-between items-start pr-8">
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6"
                        onClick={() => handleDeleteConversation(conversation.id)}
                        disabled={isDeleting === conversation.id}
                      >
                        {isDeleting === conversation.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-gray-800" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
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
              {ttsLanguage === 'hi-IN' && (
                <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-700">
                  Hindi Mode
                </Badge>
              )}
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleListening}
                  disabled={!speechSupported}
                  className={isListening ? "bg-red-100 text-red-600" : ""}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={ttsLanguage === 'hi-IN' ? "अपना संदेश टाइप करें..." : "Type your message..."}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={inputValue.trim() === "" || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              
              {isListening && (
                <div className="mt-2 text-sm text-red-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  {ttsLanguage === 'hi-IN' ? "सुन रहे हैं... माइक्रोफ़ोन बटन को रोकने के लिए क्लिक करें।" : "Listening... Click the microphone button to stop."}
                </div>
              )}
              
              {!speechSupported && (
                <div className="mt-2 text-sm text-gray-500">
                  {ttsLanguage === 'hi-IN' ? "आपके ब्राउज़र में स्पीच रिकॉग्निशन समर्थित नहीं है।" : "Speech recognition is not supported in your browser."}
                </div>
              )}
              
              {!ttsSupported && (
                <div className="mt-2 text-sm text-gray-500">
                  {ttsLanguage === 'hi-IN' ? "आपके ब्राउज़र में टेक्स्ट-टू-स्पीच समर्थित नहीं है।" : "Text-to-speech is not supported in your browser."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            {ttsLanguage === 'hi-IN' 
              ? "सेरेनएआई पेशेवर चिकित्सा सलाह का विकल्प नहीं है। यदि आप संकट में हैं, तो कृपया किसी संकट हॉटलाइन या आपातकालीन सेवाओं से संपर्क करें।"
              : "SerenAI is not a substitute for professional medical advice. If you're in crisis, please contact a crisis hotline or emergency services."
            }
          </p>
        </div>
      </div>
    </div>
  );
}