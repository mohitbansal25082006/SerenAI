"use client";
import { useState, useEffect, useRef } from "react";
import { 
  User, 
  Mail, 
  Calendar, 
  ChevronLeft,
  Shield,
  Moon,
  Sun,
  Monitor,
  Camera,
  Edit,
  Save,
  X,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUser, useClerk } from "@clerk/nextjs";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Privacy settings
  const [dataCollectionEnabled, setDataCollectionEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [personalizedContentEnabled, setPersonalizedContentEnabled] = useState(true);
  const [isSavingPrivacySettings, setIsSavingPrivacySettings] = useState(false);
  
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
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
  
  // Load privacy settings from localStorage
  useEffect(() => {
    setDataCollectionEnabled(localStorage.getItem('dataCollectionEnabled') !== 'false');
    setAnalyticsEnabled(localStorage.getItem('analyticsEnabled') !== 'false');
    setPersonalizedContentEnabled(localStorage.getItem('personalizedContentEnabled') !== 'false');
  }, []);
  
  useEffect(() => {
    if (user) {
      // Try to get names from unsafeMetadata first, then fall back to user object
      setFirstName(user.unsafeMetadata?.firstName as string || user.firstName || "");
      setLastName(user.unsafeMetadata?.lastName as string || user.lastName || "");
      setEmail(user.primaryEmailAddress?.emailAddress || "");
      setPreviewUrl(user.imageUrl);
    }
  }, [user]);
  
  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      // Update user metadata with the new names
      await user?.update({
        unsafeMetadata: {
          firstName: firstName.trim(),
          lastName: lastName.trim()
        }
      });
      
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const handleChangePhotoClick = () => {
    if (!isEditing) return;
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    setIsUploading(true);
    try {
      setPreviewUrl(URL.createObjectURL(file));
      await user?.setProfileImage({ file });
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to update profile picture");
      setPreviewUrl(user?.imageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSavePrivacySettings = async () => {
    setIsSavingPrivacySettings(true);
    
    try {
      // Save privacy settings to localStorage
      localStorage.setItem('dataCollectionEnabled', String(dataCollectionEnabled));
      localStorage.setItem('analyticsEnabled', String(analyticsEnabled));
      localStorage.setItem('personalizedContentEnabled', String(personalizedContentEnabled));
      
      // In a real app, you would also send these settings to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Privacy settings updated successfully");
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      toast.error("Failed to update privacy settings");
    } finally {
      setIsSavingPrivacySettings(false);
    }
  };
  
  const removeProfilePicture = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) return;
    
    try {
      await user?.setProfileImage({ file: null });
      setPreviewUrl(null);
      toast.success("Profile picture removed");
    } catch (error) {
      console.error("Error removing profile picture:", error);
      toast.error("Failed to remove profile picture");
    }
  };
  
  if (!isLoaded) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
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
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
          <Button 
            variant={isEditing ? "default" : "outline"}
            onClick={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isLoading || isUploading}
            className="gap-2"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  {previewUrl ? (
                    <Image 
                      src={previewUrl} 
                      alt={`${firstName} ${lastName}` || "User"} 
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      unoptimized={true}
                    />
                  ) : (
                    <User className="h-16 w-16 text-white" />
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  disabled={!isEditing}
                />
                <div className="flex flex-col gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleChangePhotoClick}
                    disabled={isUploading || !isEditing}
                    className="gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    {isUploading ? "Uploading..." : "Change Photo"}
                  </Button>
                  {previewUrl && isEditing && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={removeProfilePicture}
                      disabled={isUploading}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
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
                  <label className="text-sm font-medium">First Name</label>
                  {isEditing ? (
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                      placeholder="Enter your first name"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{firstName || "Not provided"}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  {isEditing ? (
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                      placeholder="Enter your last name"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{lastName || "Not provided"}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{email || "Not provided"}</span>
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
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm">Data Collection</span>
                      <p className="text-xs text-gray-500">Allow collection of usage data to improve our services</p>
                    </div>
                    <Switch
                      checked={dataCollectionEnabled}
                      onCheckedChange={setDataCollectionEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm">Analytics</span>
                      <p className="text-xs text-gray-500">Help us understand how you use SerenAI</p>
                    </div>
                    <Switch
                      checked={analyticsEnabled}
                      onCheckedChange={setAnalyticsEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm">Personalized Content</span>
                      <p className="text-xs text-gray-500">Receive personalized insights and recommendations</p>
                    </div>
                    <Switch
                      checked={personalizedContentEnabled}
                      onCheckedChange={setPersonalizedContentEnabled}
                    />
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <Button 
                      onClick={handleSavePrivacySettings}
                      disabled={isSavingPrivacySettings}
                      className="w-full"
                    >
                      {isSavingPrivacySettings ? "Saving..." : "Save Privacy Settings"}
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