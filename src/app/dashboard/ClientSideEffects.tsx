// src/app/dashboard/ClientSideEffects.tsx
"use client";

import { useEffect } from "react";
import { NotificationScheduler } from "@/lib/scheduler";
import { useAuth } from "@/hooks/useAuth";

export default function ClientSideEffects({ userId }: { userId: string }) {
  const { isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && userId && typeof window !== 'undefined') {
      const scheduler = NotificationScheduler.getInstance();
      // Initialize any user-specific scheduling here
    }
  }, [isLoaded, userId]);

  return null;
}