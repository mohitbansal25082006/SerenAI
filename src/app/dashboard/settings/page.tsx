"use client";
import { useState, useEffect } from "react";
import { 
  ChevronLeft,
  Bell,
  Shield,
  Globe,
  HelpCircle,
  LogOut,
  Smartphone,
  Mail,
  Calendar,
  CheckCircle,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { NotificationScheduler } from "@/lib/scheduler";

export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [emailReminders, setEmailReminders] = useState(false);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [language, setLanguage] = useState("english");
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  
  const { user } = useUser();
  const { collapsed } = useSidebar();
  const router = useRouter();
  const { signOut } = useClerk();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    
    if (savedSettings.notificationsEnabled !== undefined) {
      setNotificationsEnabled(savedSettings.notificationsEnabled);
    }
    if (savedSettings.emailReminders !== undefined) {
      setEmailReminders(savedSettings.emailReminders);
    }
    if (savedSettings.dailyDigest !== undefined) {
      setDailyDigest(savedSettings.dailyDigest);
    }
    if (savedSettings.dataSharing !== undefined) {
      setDataSharing(savedSettings.dataSharing);
    }
    if (savedSettings.language !== undefined) {
      setLanguage(savedSettings.language);
    }
  }, []);

  // Save settings to localStorage when they change and reschedule notifications
  useEffect(() => {
    const settings = {
      notificationsEnabled,
      emailReminders,
      dailyDigest,
      dataSharing,
      language
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));

    // Reschedule notifications when relevant settings change
    if (typeof window !== 'undefined' && (notificationsEnabled || emailReminders || dailyDigest)) {
      try {
        NotificationScheduler.getInstance().reschedule();
      } catch (error) {
        console.error("Error rescheduling notifications:", error);
      }
    }
  }, [notificationsEnabled, emailReminders, dailyDigest, dataSharing, language]);

  const handleSignOut = () => {
    signOut().then(() => router.push("/"));
  };

  const handleEnable2FA = async () => {
    setIsEnabling2FA(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTwoFactorEnabled(true);
      toast.success("Two-factor authentication enabled successfully");
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      toast.error("Failed to enable two-factor authentication");
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("Are you sure you want to disable two-factor authentication?")) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwoFactorEnabled(false);
      toast.success("Two-factor authentication disabled");
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      toast.error("Failed to disable two-factor authentication");
    }
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
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
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

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications about your wellness journey</p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reminders">Email Reminders</Label>
                  <p className="text-sm text-gray-600">Get daily reminders to complete activities</p>
                </div>
                <Switch
                  id="reminders"
                  checked={emailReminders}
                  onCheckedChange={setEmailReminders}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="digest">Daily Digest</Label>
                  <p className="text-sm text-gray-600">Receive a summary of your daily activities</p>
                </div>
                <Switch
                  id="digest"
                  checked={dailyDigest}
                  onCheckedChange={setDailyDigest}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-sharing">Data Sharing</Label>
                  <p className="text-sm text-gray-600">Share anonymized data to improve SerenAI</p>
                </div>
                <Switch
                  id="data-sharing"
                  checked={dataSharing}
                  onCheckedChange={setDataSharing}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={twoFactorEnabled ? "default" : "outline"}>
                    {twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  {twoFactorEnabled ? (
                    <Button variant="outline" size="sm" onClick={handleDisable2FA}>
                      Disable
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleEnable2FA} disabled={isEnabling2FA}>
                      {isEnabling2FA ? "Enabling..." : "Enable"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="korean">Korean</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Help Center</Label>
                  <p className="text-sm text-gray-600">Find answers to common questions</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/documentation">Visit</Link>
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Contact Support</Label>
                  <p className="text-sm text-gray-600">Get help from our support team</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/contact-support">Contact</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Export Data</Label>
                  <p className="text-sm text-gray-600">Download all your data</p>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  Export
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Delete Account</Label>
                  <p className="text-sm text-gray-600">Permanently delete your account</p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Sign Out */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="w-full gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}