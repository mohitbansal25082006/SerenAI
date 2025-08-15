// src/lib/notifications.ts
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

interface SerializedNotification extends Omit<Notification, 'timestamp'> {
  timestamp: string;
}

export class NotificationService {
  private static MAX_NOTIFICATIONS = 200;
  private static STORAGE_KEY = 'serenai-notifications';
  private static MIN_DUPLICATE_INTERVAL = 30000; // 30 seconds

  static getNotifications(): Notification[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const parsed: SerializedNotification[] = JSON.parse(stored);
      
      return parsed
        .map(notification => ({
          ...notification,
          timestamp: new Date(notification.timestamp)
        }))
        .filter(notification => 
          notification.id &&
          notification.title &&
          notification.message &&
          !isNaN(notification.timestamp.getTime()) &&
          notification.type &&
          notification.icon
        )
        .slice(0, this.MAX_NOTIFICATIONS);
    } catch (error) {
      console.error("Error loading notifications:", error);
      return [];
    }
  }

  private static saveNotifications(notifications: Notification[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      const serialized: SerializedNotification[] = notifications
        .slice(0, this.MAX_NOTIFICATIONS)
        .map(notification => ({
          ...notification,
          timestamp: notification.timestamp.toISOString()
        }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error("Error saving notifications:", error);
    }
  }

  static addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): boolean {
    try {
      const notifications = this.getNotifications();
      
      // Check for duplicates based on title, message and recent timestamp
      const isDuplicate = notifications.some(n => 
        n.title === notification.title &&
        n.message === notification.message &&
        Date.now() - n.timestamp.getTime() < this.MIN_DUPLICATE_INTERVAL
      );
      
      if (isDuplicate) return false;
      
      const newNotification: Notification = {
        ...notification,
        id: this.generateUniqueId(),
        timestamp: new Date(),
        read: false
      };
      
      // Add to beginning of array (newest first) and save
      this.saveNotifications([newNotification, ...notifications]);
      return true;
    } catch (error) {
      console.error("Error adding notification:", error);
      return false;
    }
  }

  private static generateUniqueId(): string {
    // Combines timestamp, random string, and counter to ensure uniqueness
    return `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${performance.now().toString(36).replace('.', '')}`;
  }

  static markAsRead(id: string): boolean {
    try {
      const notifications = this.getNotifications();
      const index = notifications.findIndex(n => n.id === id);
      
      if (index === -1) return false;
      
      const updatedNotifications = [...notifications];
      updatedNotifications[index] = {
        ...updatedNotifications[index],
        read: true
      };
      
      this.saveNotifications(updatedNotifications);
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  static markAllAsRead(): void {
    try {
      const notifications = this.getNotifications().map(n => ({
        ...n,
        read: true
      }));
      this.saveNotifications(notifications);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  static deleteNotification(id: string): boolean {
    try {
      const notifications = this.getNotifications().filter(n => n.id !== id);
      this.saveNotifications(notifications);
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }

  static getUnreadCount(): number {
    return this.getNotifications().filter(n => !n.read).length;
  }

  static getRecentNotifications(limit: number = 5): Notification[] {
    return this.getNotifications()
      .slice(0, limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Specific notification types
  static sendDailyReminder(): boolean {
    return this.addNotification({
      title: "Daily Reminder",
      message: "Don't forget to complete your journal entry for today.",
      type: "reminder",
      icon: "Clock",
      action: {
        label: "Write Entry",
        href: "/dashboard/journal"
      }
    });
  }

  static sendActivityReminder(activityType: string, href: string = "/dashboard/activities"): boolean {
    return this.addNotification({
      title: "Activity Reminder",
      message: `Time for your ${activityType} activity! Take a moment for your wellness.`,
      type: "reminder",
      icon: "Activity",
      action: {
        label: "Start Activity",
        href
      }
    });
  }

  static sendAchievement(message: string): boolean {
    return this.addNotification({
      title: "Achievement Unlocked!",
      message: `Congratulations! ${message}`,
      type: "achievement",
      icon: "Star"
    });
  }

  static sendSystemNotification(title: string, message: string, action?: { label: string; href: string }): boolean {
    return this.addNotification({
      title,
      message,
      type: "system",
      icon: "Settings",
      action
    });
  }

  static sendWelcomeNotification(userName?: string): boolean {
    return this.addNotification({
      title: "Welcome to SerenAI!",
      message: userName 
        ? `Welcome back, ${userName}! Start your wellness journey.`
        : "Welcome to SerenAI! Explore your wellness features.",
      type: "info",
      icon: "Bell",
      action: {
        label: "Get Started",
        href: "/dashboard"
      }
    });
  }
}