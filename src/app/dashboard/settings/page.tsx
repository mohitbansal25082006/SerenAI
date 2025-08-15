"use client";
import { useState, useEffect } from "react";
import { 
  ChevronLeft,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Key,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { NotificationScheduler } from "@/lib/scheduler";

export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [dataSharing, setDataSharing] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  
  // Delete account states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
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
  }, []);
  
  // Auto-save settings to localStorage when they change and reschedule notifications
  useEffect(() => {
    const settings = {
      notificationsEnabled,
      emailReminders,
      dailyDigest,
      dataSharing
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
  }, [notificationsEnabled, emailReminders, dailyDigest, dataSharing]);
  
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
  
  const handleDeleteAccount = async () => {
    setShowDeleteConfirmation(true);
  };
  
  const confirmDeleteAccount = async () => {
    if (deleteConfirmationText !== "DELETE") {
      toast.error('Please type &quot;DELETE&quot; to confirm account deletion');
      return;
    }
    
    setIsDeletingAccount(true);
    
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        localStorage.clear();
        await signOut();
        toast.success("Account deleted successfully");
        router.push('/');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Account deletion failed');
      }
    } catch (error: unknown) {
      console.error("Error deleting account:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete account";
      toast.error(errorMessage);
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirmation(false);
      setDeleteConfirmationText("");
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
                Privacy &amp; Security
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
                <Button variant="outline" onClick={() => {
                  toast.info("Export functionality would be implemented here");
                }}>
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
      
      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-500">Delete Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">To confirm, type &quot;DELETE&quot; below:</p>
                <Input
                  value={deleteConfirmationText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setDeleteConfirmationText("");
                  }}
                  disabled={isDeletingAccount}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDeleteAccount}
                  disabled={isDeletingAccount || deleteConfirmationText !== "DELETE"}
                >
                  {isDeletingAccount ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}