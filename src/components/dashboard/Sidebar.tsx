"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  MessageSquare,
  BookOpen,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Brain,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useSidebar } from "@/contexts/SidebarContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "AI Chat", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Journal", href: "/dashboard/journal", icon: BookOpen },
  { name: "Mood Tracker", href: "/dashboard/mood", icon: BarChart3 },
  { name: "Insights", href: "/dashboard/insights", icon: Brain },
  { name: "Activities", href: "/dashboard/activities", icon: Activity },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile open/close
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      // always navigate home
      router.push("/");
    }
  };

  const desktopWidthClass = collapsed ? "w-20" : "w-64";
  const navLabelClass = collapsed ? "hidden" : "inline";
  const logoTextClass = collapsed ? "hidden" : "inline";

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-white/90 backdrop-blur-md border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col",
          desktopWidthClass,
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-3 border-b border-gray-200">
            <Link
              href="/"
              className={cn("flex items-center gap-2", collapsed ? "justify-center w-full" : "")}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className={`text-lg font-bold text-gray-900 ${logoTextClass}`}>SerenAI</span>
            </Link>
            {/* Collapse toggle (desktop only) */}
            <div className="hidden lg:flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="text-gray-700 hover:bg-gray-100"
              >
                {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    collapsed ? "justify-center" : ""
                  )}
                  onClick={() => setSidebarOpen(false)}
                  title={collapsed ? item.name : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span className={`${navLabelClass} truncate`}>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom controls */}
          <div className="p-3 border-t border-gray-200">
            <div className={cn("flex items-center gap-2", collapsed ? "justify-center" : "")}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  collapsed ? "justify-center w-full p-2" : ""
                )}
                onClick={handleSignOut}
                title={collapsed ? "Sign out" : undefined}
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span className={navLabelClass}>Sign Out</span>
              </Button>
            </div>
            <div className="mt-3 hidden lg:flex items-center justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="text-gray-700"
              >
                {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
