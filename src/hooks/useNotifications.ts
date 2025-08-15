// src/hooks/useNotifications.ts
import { useState, useEffect } from 'react';
import { NotificationService } from '@/lib/notifications';

// Define the Notification interface locally to avoid import issues
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "reminder" | "achievement" | "system";
  timestamp: Date;
  read: boolean;
  icon: string;
  action?: {
    label: string;
    href: string;
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadNotifications = () => {
      try {
        const loadedNotifications = NotificationService.getNotifications();
        setNotifications(loadedNotifications);
        setUnreadCount(loadedNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error("Error loading notifications:", error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    loadNotifications();

    // Listen for storage changes to update notifications in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notifications') {
        loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-tab updates
    const handleCustomEvent = () => loadNotifications();
    window.addEventListener('notifications-updated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notifications-updated', handleCustomEvent);
    };
  }, []);

  const markAsRead = (id: string) => {
    try {
      NotificationService.markAsRead(id);
      // Trigger custom event
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = () => {
    try {
      NotificationService.markAllAsRead();
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = (id: string) => {
    try {
      NotificationService.deleteNotification(id);
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const clearAll = () => {
    try {
      NotificationService.clearAll();
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const addNotification = (
    title: string,
    message: string,
    type: "info" | "reminder" | "achievement" | "system",
    action?: { label: string; href: string }
  ) => {
    try {
      NotificationService.addNotification({ title, message, type, icon: "Bell", action });
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
  };
}