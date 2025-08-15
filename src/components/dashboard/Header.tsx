"use client";
import { Bell, Home, ChevronRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { useUser } from "@clerk/nextjs";

export default function Header() {
  const { collapsed } = useSidebar();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  
  const handleBellClick = () => {
    router.push('/dashboard/notifications');
  };
  
  // Get user's display name from metadata or user object
  const getUserDisplayName = () => {
    if (!user) return "User";
    
    // Try to get the full name from metadata first
    const firstName = user.unsafeMetadata?.firstName || user.firstName || "";
    const lastName = user.unsafeMetadata?.lastName || user.lastName || "";
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    // Fallback to username or email
    return user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || "User";
  };
  
  // Generate breadcrumb navigation based on current path
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    
    if (paths.length === 0) return [];
    
    const breadcrumbs = [];
    let currentPath = '';
    
    for (let i = 0; i < paths.length; i++) {
      currentPath += `/${paths[i]}`;
      
      // Skip adding 'dashboard' to breadcrumbs if it's the first item
      if (i === 0 && paths[i] === 'dashboard') continue;
      
      // Format the breadcrumb label
      let label = paths[i];
      if (label === 'chat') label = 'AI Chat';
      else if (label === 'journal') label = 'Journal';
      else if (label === 'mood') label = 'Mood Tracker';
      else if (label === 'insights') label = 'Insights';
      else if (label === 'activities') label = 'Activities';
      else if (label === 'profile') label = 'Profile';
      else if (label === 'settings') label = 'Settings';
      else label = label.charAt(0).toUpperCase() + label.slice(1);
      
      breadcrumbs.push({
        label,
        path: currentPath
      });
    }
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbs();
  const userDisplayName = getUserDisplayName();
  
  return (
    <header 
      className={`sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all duration-300 ${
        collapsed ? "lg:pl-20" : "lg:pl-64"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          {/* SerenAI text that links to landing page */}
          <Link href="/" className="mr-6">
            <span className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              SerenAI
            </span>
          </Link>
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-1 text-sm">
            <Link 
              href="/dashboard" 
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <Home className="h-4 w-4" />
            </Link>
            
            {breadcrumbs.map((breadcrumb, index) => (
              <div key={index} className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                <Link 
                  href={breadcrumb.path} 
                  className={`${
                    pathname === breadcrumb.path 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {breadcrumb.label}
                </Link>
              </div>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User greeting */}
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm text-gray-500">Welcome back,</span>
            <span className="font-medium">
              {userDisplayName}
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 text-gray-900">
              <DropdownMenuLabel>Help & Support</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/documentation">Documentation</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/faq">FAQ</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/contact-support">Contact Support</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 hover:text-gray-900 relative"
            onClick={handleBellClick}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}