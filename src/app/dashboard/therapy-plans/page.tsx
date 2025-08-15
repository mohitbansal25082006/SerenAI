"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Calendar, 
  Target, 
  CheckCircle, 
  Clock, 
  ChevronLeft,
  Brain,
  BookOpen,
  Activity,
  Users,
  Download,
  Trash2,
  Edit,
  Play,
  Plus,
  X,
  Save,
  FileDown,
  Award,
  Timer,
  MoreHorizontal,
  BarChart3,
  TrendingUp,
  CalendarCheck,
  CheckSquare,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";
import jsPDF from 'jspdf';

interface TherapyPlan {
  id: string;
  title: string;
  description: string;
  goals: string[];
  activities: string[];
  resources: string[];
  duration: number;
  isActive: boolean;
  createdAt: Date;
  sessions?: TherapySession[];
}

interface TherapySession {
  id: string;
  title: string;
  notes?: string;
  mood?: number;
  completed: boolean;
  scheduledFor: Date;
  completedAt?: Date;
}

export default function TherapyPlansPage() {
  const [plans, setPlans] = useState<TherapyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TherapyPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    goals: [] as string[],
    activities: [] as string[],
    resources: [] as string[],
    duration: 30,
    isActive: true,
  });
  const [newGoal, setNewGoal] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [newResource, setNewResource] = useState("");
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    title: "",
    notes: "",
    mood: 5,
    scheduledFor: new Date(),
  });
  
  const { collapsed } = useSidebar();
  
  // Fetch therapy plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/therapy-plans");
        if (response.ok) {
          const data = await response.json();
          setPlans(data.plans || []);
        }
      } catch (error) {
        console.error("Error fetching therapy plans:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);
  
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch("/api/therapy-plans/generate", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setPlans([data.plan, ...plans]);
        setSelectedPlan(data.plan);
      }
    } catch (error) {
      console.error("Error generating therapy plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDeletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this therapy plan? This action cannot be undone.")) return;
    try {
      const response = await fetch(`/api/therapy-plans/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPlans(plans.filter(plan => plan.id !== id));
        if (selectedPlan?.id === id) {
          setSelectedPlan(null);
        }
      }
    } catch (error) {
      console.error("Error deleting therapy plan:", error);
    }
  };
  
  const handleStartSession = async () => {
    if (!selectedPlan) return;
    
    // Check if the plan is active
    if (!selectedPlan.isActive) {
      alert("Cannot create a new session for an inactive plan. Please activate the plan first.");
      return;
    }
    
    setSessionForm({
      title: "Therapy Session",
      notes: "",
      mood: 5,
      scheduledFor: new Date(),
    });
    setSessionModalOpen(true);
  };
  
  const handleCreateSession = async () => {
    if (!selectedPlan) return;
    
    try {
      const response = await fetch(`/api/therapy-plans/${selectedPlan.id}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionForm),
      });
      if (response.ok) {
        // Refresh plans to get updated sessions
        const plansResponse = await fetch("/api/therapy-plans");
        if (plansResponse.ok) {
          const data = await plansResponse.json();
          setPlans(data.plans || []);
          
          // Update selected plan if it's the one we added a session to
          const updatedPlan = data.plans.find((p: TherapyPlan) => p.id === selectedPlan.id);
          if (updatedPlan) {
            setSelectedPlan(updatedPlan);
          }
        }
        
        setSessionModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating therapy session:", error);
    }
  };
  
  const handleDeleteSession = async (sessionId: string) => {
    if (!selectedPlan || !confirm("Are you sure you want to delete this therapy session? This action cannot be undone.")) return;
    
    try {
      const response = await fetch(`/api/therapy-plans/${selectedPlan.id}/sessions/${sessionId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        // Refresh plans to get updated sessions
        const plansResponse = await fetch("/api/therapy-plans");
        if (plansResponse.ok) {
          const data = await plansResponse.json();
          setPlans(data.plans || []);
          
          // Update selected plan if it's the one we removed a session from
          const updatedPlan = data.plans.find((p: TherapyPlan) => p.id === selectedPlan.id);
          if (updatedPlan) {
            setSelectedPlan(updatedPlan);
          }
        }
      } else {
        // Handle error response
        const errorData = await response.json();
        alert(`Error deleting session: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting therapy session:", error);
      alert("Failed to delete session. Please try again.");
    }
  };
  
  const handleEditPlan = () => {
    if (!selectedPlan) return;
    
    setEditForm({
      title: selectedPlan.title,
      description: selectedPlan.description,
      goals: [...selectedPlan.goals],
      activities: [...selectedPlan.activities],
      resources: [...selectedPlan.resources],
      duration: selectedPlan.duration,
      isActive: selectedPlan.isActive,
    });
    setIsEditing(true);
  };
  
  const handleSaveEdit = async () => {
    if (!selectedPlan) return;
    
    try {
      // Create updated plan object preserving sessions
      const updatedPlan = {
        ...selectedPlan,
        ...editForm,
        sessions: selectedPlan.sessions // Preserve the sessions array
      };
      
      // Update the plans array
      const updatedPlans = plans.map(plan => 
        plan.id === selectedPlan.id ? updatedPlan : plan
      );
      
      setPlans(updatedPlans);
      setSelectedPlan(updatedPlan); // Update selectedPlan with the new data
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving therapy plan:", error);
    }
  };
  
  const handleExportPlan = () => {
    if (!selectedPlan) return;
    
    // Get the most up-to-date version of the plan from the plans array
    const currentPlan = plans.find(plan => plan.id === selectedPlan.id) || selectedPlan;
    
    exportToPDF(currentPlan);
  };
  
  const exportToPDF = (plan: TherapyPlan) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(plan.title, 20, 20);
    
    // Add description
    doc.setFontSize(12);
    const splitDescription = doc.splitTextToSize(plan.description, 170);
    doc.text(splitDescription, 20, 30);
    
    // Add duration
    doc.text(`Duration: ${plan.duration} days`, 20, 50);
    
    // Add goals
    doc.setFontSize(14);
    doc.text("Goals:", 20, 60);
    doc.setFontSize(12);
    let yPos = 70;
    plan.goals.forEach(goal => {
      const splitGoal = doc.splitTextToSize(`• ${goal}`, 170);
      doc.text(splitGoal, 20, yPos);
      yPos += splitGoal.length * 5 + 5;
    });
    
    // Add activities
    doc.setFontSize(14);
    doc.text("Activities:", 20, yPos + 10);
    doc.setFontSize(12);
    yPos += 20;
    plan.activities.forEach(activity => {
      const splitActivity = doc.splitTextToSize(`• ${activity}`, 170);
      doc.text(splitActivity, 20, yPos);
      yPos += splitActivity.length * 5 + 5;
    });
    
    // Add resources
    doc.setFontSize(14);
    doc.text("Resources:", 20, yPos + 10);
    doc.setFontSize(12);
    yPos += 20;
    plan.resources.forEach(resource => {
      const splitResource = doc.splitTextToSize(`• ${resource}`, 170);
      doc.text(splitResource, 20, yPos);
      yPos += splitResource.length * 5 + 5;
    });
    
    // Add progress information
    const progress = calculateProgress(plan);
    const completedSessions = plan.sessions?.filter(s => s.completed).length || 0;
    const totalSessions = plan.sessions?.length || 0;
    
    doc.setFontSize(14);
    doc.text("Progress Summary:", 20, yPos + 10);
    doc.setFontSize(12);
    yPos += 20;
    doc.text(`Overall Progress: ${Math.round(progress)}%`, 20, yPos);
    yPos += 10;
    doc.text(`Completed Sessions: ${completedSessions}/${totalSessions}`, 20, yPos);
    
    // Save the PDF
    doc.save(`${plan.title.replace(/\s+/g, '_')}_Therapy_Plan.pdf`);
  };
  
  const addGoal = () => {
    if (newGoal.trim() && !editForm.goals.includes(newGoal.trim())) {
      setEditForm({
        ...editForm,
        goals: [...editForm.goals, newGoal.trim()]
      });
      setNewGoal("");
    }
  };
  
  const removeGoal = (index: number) => {
    setEditForm({
      ...editForm,
      goals: editForm.goals.filter((_, i) => i !== index)
    });
  };
  
  const addActivity = () => {
    if (newActivity.trim() && !editForm.activities.includes(newActivity.trim())) {
      setEditForm({
        ...editForm,
        activities: [...editForm.activities, newActivity.trim()]
      });
      setNewActivity("");
    }
  };
  
  const removeActivity = (index: number) => {
    setEditForm({
      ...editForm,
      activities: editForm.activities.filter((_, i) => i !== index)
    });
  };
  
  const addResource = () => {
    if (newResource.trim() && !editForm.resources.includes(newResource.trim())) {
      setEditForm({
        ...editForm,
        resources: [...editForm.resources, newResource.trim()]
      });
      setNewResource("");
    }
  };
  
  const removeResource = (index: number) => {
    setEditForm({
      ...editForm,
      resources: editForm.resources.filter((_, i) => i !== index)
    });
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  const calculateProgress = (plan: TherapyPlan) => {
    // Enhanced progress calculation
    if (!plan.sessions || plan.sessions.length === 0) return 0;
    
    // Weight completed sessions more heavily
    const completedSessions = plan.sessions.filter(session => session.completed).length;
    const baseProgress = (completedSessions / plan.sessions.length) * 100;
    
    // Add bonus for consistency (completing sessions on time)
    const now = new Date();
    const onTimeSessions = plan.sessions.filter(session => {
      if (!session.completed) return false;
      const completedDate = session.completedAt ? new Date(session.completedAt) : now;
      const scheduledDate = new Date(session.scheduledFor);
      return completedDate <= scheduledDate;
    }).length;
    
    const consistencyBonus = (onTimeSessions / plan.sessions.length) * 10;
    
    // Add bonus for mood improvement (if mood data is available)
    const moodSessions = plan.sessions.filter(session => session.mood !== undefined);
    let moodBonus = 0;
    if (moodSessions.length > 1) {
      const avgMood = moodSessions.reduce((sum, session) => sum + (session.mood || 5), 0) / moodSessions.length;
      moodBonus = avgMood > 6 ? (avgMood - 6) * 2 : 0; // Bonus for good mood
    }
    
    // Cap the progress at 100%
    return Math.min(100, baseProgress + consistencyBonus + moodBonus);
  };
  
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 50) return "text-blue-600";
    return "text-amber-600";
  };
  
  const getProgressStatus = (progress: number) => {
    if (progress >= 80) return "Excellent Progress";
    if (progress >= 60) return "Good Progress";
    if (progress >= 40) return "Making Progress";
    if (progress >= 20) return "Getting Started";
    return "Just Beginning";
  };
  
  const getDaysRemaining = (plan: TherapyPlan) => {
    const createdDate = new Date(plan.createdAt);
    const endDate = new Date(createdDate);
    endDate.setDate(endDate.getDate() + plan.duration);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  const getConsistencyScore = (plan: TherapyPlan) => {
    if (!plan.sessions || plan.sessions.length === 0) return 0;
    
    const completedSessions = plan.sessions.filter(session => session.completed).length;
    if (completedSessions === 0) return 0;
    
    const now = new Date();
    const onTimeSessions = plan.sessions.filter(session => {
      if (!session.completed) return false;
      const completedDate = session.completedAt ? new Date(session.completedAt) : now;
      const scheduledDate = new Date(session.scheduledFor);
      return completedDate <= scheduledDate;
    }).length;
    
    return Math.round((onTimeSessions / completedSessions) * 100);
  };
  
  const getMoodTrend = (plan: TherapyPlan) => {
    if (!plan.sessions || plan.sessions.length === 0) return "stable";
    
    const moodSessions = plan.sessions
      .filter(session => session.mood !== undefined && session.completed)
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
    
    if (moodSessions.length < 2) return "stable";
    
    const firstHalf = moodSessions.slice(0, Math.floor(moodSessions.length / 2));
    const secondHalf = moodSessions.slice(Math.floor(moodSessions.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, session) => sum + (session.mood || 5), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, session) => sum + (session.mood || 5), 0) / secondHalf.length;
    
    if (secondAvg > firstAvg + 1) return "improving";
    if (secondAvg < firstAvg - 1) return "declining";
    return "stable";
  };
  
  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return "😊";
    if (mood >= 6) return "🙂";
    if (mood >= 4) return "😐";
    if (mood >= 2) return "😔";
    return "😢";
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining": return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
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
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Therapy Plans</h1>
          </div>
          <Button 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Brain className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate New Plan"}
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans List */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Your Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                {plans.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No therapy plans yet</p>
                    <Button onClick={handleGeneratePlan} disabled={isGenerating} className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Generate Your First Plan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                          selectedPlan?.id === plan.id 
                            ? "border-blue-500 bg-blue-50 shadow-md" 
                            : "border-gray-200 hover:bg-gray-50 hover:shadow-sm"
                        }`}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">{plan.title}</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPlan(plan);
                                  handleStartSession();
                                }}
                                disabled={!plan.isActive}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Start Session
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPlan(plan);
                                handleEditPlan();
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Plan
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePlan(plan.id);
                              }}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Plan
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{plan.description}</p>
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant={plan.isActive ? "default" : "secondary"} className={plan.isActive ? "bg-green-100 text-green-800" : ""}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(plan.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={calculateProgress(plan)} className="flex-1 h-2" />
                          <span className="text-xs font-medium text-gray-700">
                            {Math.round(calculateProgress(plan))}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Plan Details */}
          <div className="lg:col-span-2">
            {selectedPlan ? (
              <div className="space-y-6">
                {/* Plan Header */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <FileText className="h-6 w-6 text-blue-600" />
                          {selectedPlan.title}
                        </CardTitle>
                        <p className="text-gray-600 mt-2">{selectedPlan.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportPlan}>
                          <Download className="h-4 w-4 mr-1" />
                          Export PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleEditPlan}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          onClick={() => handleStartSession()}
                          size="sm"
                          disabled={!selectedPlan.isActive}
                          className={`bg-gradient-to-r ${selectedPlan.isActive ? 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'from-gray-400 to-gray-500'} ${!selectedPlan.isActive ? 'cursor-not-allowed' : ''}`}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          New Session
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-900">Duration</span>
                        </div>
                        <p className="text-lg font-bold text-blue-900">{selectedPlan.duration} days</p>
                        <p className="text-xs text-blue-700 mt-1">
                          {getDaysRemaining(selectedPlan)} days remaining
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900">Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={calculateProgress(selectedPlan)} className="flex-1 h-3" />
                          <span className={`text-lg font-bold ${getProgressColor(calculateProgress(selectedPlan))}`}>
                            {Math.round(calculateProgress(selectedPlan))}%
                          </span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">
                          {getProgressStatus(calculateProgress(selectedPlan))}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-5 w-5 text-purple-600" />
                          <span className="font-medium text-purple-900">Status</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={selectedPlan.isActive ? "default" : "secondary"} className={selectedPlan.isActive ? "bg-green-100 text-green-800" : ""}>
                            {selectedPlan.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center mt-2">
                          <Switch 
                            checked={selectedPlan.isActive} 
                            onChange={() => {
                              // Toggle active status
                              const updatedPlans = plans.map(plan => 
                                plan.id === selectedPlan.id 
                                  ? { ...plan, isActive: !plan.isActive }
                                  : plan
                              );
                              setPlans(updatedPlans);
                              setSelectedPlan({ ...selectedPlan, isActive: !selectedPlan.isActive });
                            }}
                          />
                          <span className="text-xs text-purple-700 ml-2">
                            {selectedPlan.isActive ? "Plan is active" : "Plan is paused"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Advanced Progress Tracking */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-indigo-600" />
                      Advanced Progress Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarCheck className="h-5 w-5 text-indigo-600" />
                          <span className="font-medium text-indigo-900">Consistency</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={getConsistencyScore(selectedPlan)} className="flex-1 h-3" />
                          <span className="text-lg font-bold text-indigo-900">
                            {getConsistencyScore(selectedPlan)}%
                          </span>
                        </div>
                        <p className="text-xs text-indigo-700 mt-1">
                          Sessions completed on time
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckSquare className="h-5 w-5 text-amber-600" />
                          <span className="font-medium text-amber-900">Completion Rate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-amber-900">
                            {selectedPlan.sessions ? Math.round((selectedPlan.sessions.filter(s => s.completed).length / selectedPlan.sessions.length) * 100) : 0}%
                          </div>
                        </div>
                        <p className="text-xs text-amber-700 mt-1">
                          Sessions completed
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-teal-600" />
                          <span className="font-medium text-teal-900">Mood Trend</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(getMoodTrend(selectedPlan))}
                          <span className="text-lg font-bold text-teal-900 capitalize">
                            {getMoodTrend(selectedPlan)}
                          </span>
                        </div>
                        <p className="text-xs text-teal-700 mt-1">
                          Emotional progress
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Goals */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {selectedPlan.goals.map((goal, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100"
                        >
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-800">{goal}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                {/* Activities */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Recommended Activities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {selectedPlan.activities.map((activity, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                          </div>
                          <span className="text-gray-800">{activity}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                {/* Resources */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {selectedPlan.resources.map((resource, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100"
                        >
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                          </div>
                          <span className="text-gray-800">{resource}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                {/* Sessions */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        Therapy Sessions
                      </CardTitle>
                      <Button 
                        onClick={() => handleStartSession()}
                        size="sm"
                        disabled={!selectedPlan.isActive}
                        className={`bg-gradient-to-r ${selectedPlan.isActive ? 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 'from-gray-400 to-gray-500'} ${!selectedPlan.isActive ? 'cursor-not-allowed' : ''}`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        New Session
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!selectedPlan.sessions || selectedPlan.sessions.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          {selectedPlan.isActive 
                            ? "No therapy sessions yet" 
                            : "This plan is inactive. Activate the plan to start sessions."
                          }
                        </p>
                        {selectedPlan.isActive && (
                          <Button onClick={() => handleStartSession()} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                            Start Your First Session
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedPlan.sessions.map((session) => (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                session.completed 
                                  ? "bg-green-100" 
                                  : "bg-indigo-100"
                              }`}>
                                {session.completed ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Timer className="h-5 w-5 text-indigo-600" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{session.title}</h4>
                                <p className="text-sm text-gray-600">
                                  Scheduled: {formatDate(session.scheduledFor)}
                                </p>
                                {session.notes && (
                                  <p className="text-sm text-gray-700 mt-1">{session.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {session.mood && (
                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                  <span className="text-lg">{getMoodEmoji(session.mood)}</span>
                                  <span className="text-xs font-medium">{session.mood}/10</span>
                                </div>
                              )}
                              <Badge variant={session.completed ? "default" : "secondary"} className={
                                session.completed ? "bg-green-100 text-green-800" : ""
                              }>
                                {session.completed ? "Completed" : "Scheduled"}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDeleteSession(session.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Session
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="text-center py-12 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent>
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Select a Therapy Plan</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Choose a plan from the list to view details and manage your therapy journey.
                  </p>
                  {plans.length === 0 && (
                    <Button onClick={handleGeneratePlan} disabled={isGenerating} className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Generate Your First Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      {/* Edit Plan Modal */}
      <AnimatePresence>
        {isEditing && selectedPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Edit Therapy Plan</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="7"
                      max="365"
                      value={editForm.duration}
                      onChange={(e) => setEditForm({...editForm, duration: parseInt(e.target.value) || 30})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Goals</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addGoal}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Goal
                      </Button>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add a goal"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                      />
                    </div>
                    <div className="space-y-2">
                      {editForm.goals.map((goal, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span>{goal}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeGoal(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Activities</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addActivity}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Activity
                      </Button>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add an activity"
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addActivity()}
                      />
                    </div>
                    <div className="space-y-2">
                      {editForm.activities.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span>{activity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeActivity(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Resources</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addResource}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Resource
                      </Button>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add a resource"
                        value={newResource}
                        onChange={(e) => setNewResource(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addResource()}
                      />
                    </div>
                    <div className="space-y-2">
                      {editForm.resources.map((resource, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span>{resource}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeResource(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="active"
                        checked={editForm.isActive}
                        onCheckedChange={(checked) => setEditForm({...editForm, isActive: checked})}
                      />
                      <Label htmlFor="active">Active Plan</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveEdit}>
                        <Save className="h-4 w-4 mr-1" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Session Modal */}
      <AnimatePresence>
        {sessionModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">New Therapy Session</h2>
                  <Button variant="ghost" size="icon" onClick={() => setSessionModalOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="session-title">Session Title</Label>
                    <Input
                      id="session-title"
                      value={sessionForm.title}
                      onChange={(e) => setSessionForm({...sessionForm, title: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="session-notes">Notes</Label>
                    <Textarea
                      id="session-notes"
                      value={sessionForm.notes}
                      onChange={(e) => setSessionForm({...sessionForm, notes: e.target.value})}
                      className="mt-1"
                      rows={3}
                      placeholder="How are you feeling today? What would you like to focus on?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="session-mood">Current Mood (1-10)</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <input
                        id="session-mood"
                        type="range"
                        min="1"
                        max="10"
                        value={sessionForm.mood}
                        onChange={(e) => setSessionForm({...sessionForm, mood: parseInt(e.target.value)})}
                        className="flex-1"
                      />
                      <div className="text-2xl">{getMoodEmoji(sessionForm.mood)}</div>
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold">
                        {sessionForm.mood}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="session-date">Scheduled Date</Label>
                    <Input
                      id="session-date"
                      type="datetime-local"
                      value={new Date(sessionForm.scheduledFor).toISOString().slice(0, 16)}
                      onChange={(e) => setSessionForm({...sessionForm, scheduledFor: new Date(e.target.value)})}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setSessionModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSession} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      Create Session
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}