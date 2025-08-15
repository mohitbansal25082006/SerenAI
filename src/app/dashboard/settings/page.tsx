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

export default function SettingsPage() {
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  
  // Privacy & Security settings
  const [dataSharing, setDataSharing] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  
  // UI states
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'notifications' | 'privacy' | null>(null);
  
  // Delete account states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  const { user } = useUser(); // This is kept for potential future use
  const { collapsed } = useSidebar();
  const router = useRouter();
  const { signOut } = useClerk();
  
  // Load settings from localStorage on mount
  useEffect(() => {
    try {
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
      if (savedSettings.twoFactorEnabled !== undefined) {
        setTwoFactorEnabled(savedSettings.twoFactorEnabled);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);
  
  // Check for unsaved changes
  useEffect(() => {
    try {
      const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      
      const currentSettings = {
        notificationsEnabled,
        emailReminders,
        dailyDigest,
        dataSharing,
        twoFactorEnabled
      };
      
      const hasChanges = JSON.stringify(savedSettings) !== JSON.stringify(currentSettings);
      setHasUnsavedChanges(hasChanges);
    } catch (error) {
      console.error("Error checking for unsaved changes:", error);
    }
  }, [notificationsEnabled, emailReminders, dailyDigest, dataSharing, twoFactorEnabled]);
  
  const handleSaveSettings = async (section: 'notifications' | 'privacy') => {
    setIsSaving(true);
    setActiveSection(section);
    
    try {
      const settings = {
        notificationsEnabled,
        emailReminders,
        dailyDigest,
        dataSharing,
        twoFactorEnabled
      };
      
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${section === 'notifications' ? 'Notification' : 'Privacy & Security'} settings saved successfully`);
      setHasUnsavedChanges(false);
      setActiveSection(null);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSignOut = () => {
    signOut().then(() => router.push("/"));
  };
  
  const handleEnable2FA = async () => {
    setIsEnabling2FA(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTwoFactorEnabled(true);
      setHasUnsavedChanges(true);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwoFactorEnabled(false);
      setHasUnsavedChanges(true);
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
      toast.error('Please type "DELETE" to confirm account deletion');
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
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded">
                You have unsaved changes
              </span>
              <Button 
                size="sm" 
                onClick={() => {
                  handleSaveSettings(activeSection || 'notifications');
                }}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save All"}
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <Button 
                  size="sm" 
                  onClick={() => handleSaveSettings('notifications')}
                  disabled={isSaving || activeSection === 'notifications'}
                >
                  {isSaving && activeSection === 'notifications' ? "Saving..." : "Save"}
                </Button>
              </div>
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
                  onCheckedChange={(checked) => {
                    setNotificationsEnabled(checked);
                    setHasUnsavedChanges(true);
                  }}
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
                  onCheckedChange={(checked) => {
                    setEmailReminders(checked);
                    setHasUnsavedChanges(true);
                  }}
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
                  onCheckedChange={(checked) => {
                    setDailyDigest(checked);
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy &amp; Security
                </CardTitle>
                <Button 
                  size="sm" 
                  onClick={() => handleSaveSettings('privacy')}
                  disabled={isSaving || activeSection === 'privacy'}
                >
                  {isSaving && activeSection === 'privacy' ? "Saving..." : "Save"}
                </Button>
              </div>
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
                  onCheckedChange={(checked) => {
                    setDataSharing(checked);
                    setHasUnsavedChanges(true);
                  }}
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
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
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