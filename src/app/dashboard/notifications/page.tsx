"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Bell, 
  Clock, 
  Calendar,
  BookOpen,
  Activity,
  BarChart3,
  MessageSquare,
  Trash2,
  Settings,
  Star,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationService } from "@/lib/notifications";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { collapsed } = useSidebar();
  const { user } = useUser();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    
    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInMins < 1440) return `${Math.floor(diffInMins / 60)}h ago`;
    
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.read)
    : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "achievement":
        return <Star className="h-5 w-5 text-yellow-500" />;
      case "system":
        return <Settings className="h-5 w-5 text-gray-500" />;
      case "info":
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "reminder":
        return "bg-yellow-50 border-yellow-200";
      case "achievement":
        return "bg-yellow-50 border-yellow-200";
      case "system":
        return "bg-gray-50 border-gray-200";
      case "info":
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && user && notifications.length === 0) {
      NotificationService.sendWelcomeNotification(user.fullName || undefined);
      
      // Add initial sample notifications
      NotificationService.sendSystemNotification(
        "Getting Started",
        "Complete your profile to get personalized recommendations",
        { label: "Complete Profile", href: "/dashboard/profile" }
      );
      
      NotificationService.sendActivityReminder(
        "First Journal Entry",
        "/dashboard/activities"
      );
    }
  }, [user, notifications.length]);

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    NotificationService.sendSystemNotification(
      "Notifications Cleared",
      "All notifications have been marked as read"
    );
  };

  const handleClearAll = () => {
    clearAll();
    NotificationService.sendSystemNotification(
      "Notifications Cleared",
      "All notifications have been removed"
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              disabled={notifications.every(n => n.read)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-md border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-md border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unread</p>
                  <p className="text-2xl font-bold">
                    {notifications.filter(n => !n.read).length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">
                    {notifications.filter(n => !n.read).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-md border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today</p>
                  <p className="text-2xl font-bold">
                    {notifications.filter(n => {
                      const today = new Date();
                      const notificationDate = new Date(n.timestamp);
                      return notificationDate.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(value) => setFilter(value as "all" | "unread")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Notifications</TabsTrigger>
            <TabsTrigger value="unread">Unread Only</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications List */}
        <div className="space-y-4 mt-6">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <motion.div
                key={`${notification.id}-${notification.timestamp.getTime()}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  notification.read 
                    ? "bg-white border-gray-200" 
                    : `${getNotificationColor(notification.type)} border-l-4`
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    notification.read 
                      ? "bg-gray-100" 
                      : "bg-white"
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(new Date(notification.timestamp))}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    
                    {notification.action && (
                      <div className="flex items-center justify-between mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                        >
                          <Link href={notification.action.href}>
                            {notification.action.label}
                          </Link>
                        </Button>
                        
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <Card className="text-center py-12 hover:shadow-md transition-shadow">
              <CardContent>
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-gray-600 mb-4">
                  {filter === "unread" 
                    ? "You have no unread notifications." 
                    : "You don't have any notifications yet."
                  }
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Notification Settings */}
        <Card className="mt-8 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Manage your notification preferences and email reminders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-600">
                  Receive daily reminders to complete activities
                </p>
              </div>
              <Link href="/dashboard/settings">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Journal Entry
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Write about your thoughts and feelings
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/journal">
                    Write Entry
                  </Link>
                </Button>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Wellness Activities
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Try a guided wellness activity
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/activities">
                    Start Activity
                  </Link>
                </Button>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Mood Tracking
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Track your emotional patterns
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/mood">
                    Track Mood
                  </Link>
                </Button>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-yellow-600" />
                  AI Chat
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Talk with your AI companion
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/chat">
                    Start Chat
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}