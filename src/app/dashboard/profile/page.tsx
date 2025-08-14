"use client";
import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Calendar, 
  ChevronLeft,
  Bell,
  Shield,
  Moon,
  Sun,
  Monitor,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProfilePage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { user, isLoaded } = useUser();
  const { collapsed } = useSidebar();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  
  // Set initial theme to light if not already set
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('theme')) {
      setTheme('light');
      localStorage.setItem('theme', 'light');
    }
  }, [setTheme]);
  
  useEffect(() => {
    if (user) {
      // Check if notifications are enabled in localStorage
      const notificationsPref = localStorage.getItem('notificationsEnabled');
      if (notificationsPref !== null) {
        setNotificationsEnabled(notificationsPref === 'true');
      }
    }
  }, [user]);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const handleExportData = async () => {
    try {
      const response = await fetch('/api/insights/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `serenai-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    
    try {
      // First, try to delete user data from our database
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // If database deletion was successful, delete from Clerk
        if (user) {
          await user.delete();
        }
        toast.success("Account deleted successfully");
        router.push('/');
      } else {
        throw new Error('Account deletion failed');
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };
  
  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('notificationsEnabled', newValue.toString());
    
    if (newValue) {
      toast.success("Notifications enabled");
    } else {
      toast.success("Notifications disabled");
    }
  };
  
  if (!isLoaded) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" passHref legacyBehavior>
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  {user?.imageUrl ? (
                    <Image 
                      src={user.imageUrl} 
                      alt={user.fullName || "User"} 
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      unoptimized={true}
                    />
                  ) : (
                    <User className="h-16 w-16 text-white" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{user?.fullName || "Not provided"}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{user?.primaryEmailAddress?.emailAddress || "Not provided"}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Member Since</label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{user?.createdAt ? formatDate(user.createdAt) : "Unknown"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTheme("light");
                        localStorage.setItem('theme', 'light');
                      }}
                      className="gap-2"
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTheme("dark");
                        localStorage.setItem('theme', 'dark');
                      }}
                      className="gap-2"
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTheme("system");
                        localStorage.setItem('theme', 'system');
                      }}
                      className="gap-2"
                    >
                      <Monitor className="h-4 w-4" />
                      System
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notifications</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gray-500" />
                      <span>Email Notifications</span>
                    </div>
                    <Button
                      variant={notificationsEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={toggleNotifications}
                    >
                      {notificationsEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Two-Factor Authentication</span>
                    <Badge variant="outline">Not Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Export</span>
                    <Button variant="outline" size="sm" onClick={handleExportData}>
                      Export Data
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Delete Account</span>
                    <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}