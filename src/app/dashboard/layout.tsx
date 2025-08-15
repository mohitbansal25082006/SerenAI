import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { syncUserWithDatabase } from "@/lib/auth";

// Client-side component for notifications
import ClientSideEffects from "./ClientSideEffects";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Server-side user sync
  try {
    await syncUserWithDatabase();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("User sync failed:", error);
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900">
        <ClientSideEffects userId={userId} />
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}