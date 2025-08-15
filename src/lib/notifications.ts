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
  private static STORAGE_KEY = 'serenai-notifications-v2';
  private static DUPLICATE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all notifications from storage
   */
  static getNotifications(): Notification[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const parsed: SerializedNotification[] = JSON.parse(stored);
      
      return parsed
        .map(n => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
        .filter(n => 
          n.id &&
          n.title &&
          n.message &&
          !isNaN(n.timestamp.getTime())
        )
        .slice(0, this.MAX_NOTIFICATIONS);
    } catch (error) {
      console.error("Error loading notifications:", error);
      return [];
    }
  }

  /**
   * Save notifications to storage
   */
  private static saveNotifications(notifications: Notification[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      const serialized: SerializedNotification[] = notifications
        .slice(0, this.MAX_NOTIFICATIONS)
        .map(n => ({
          ...n,
          timestamp: n.timestamp.toISOString()
        }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error("Error saving notifications:", error);
    }
  }

  /**
   * Add a new notification
   */
  static addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): boolean {
    try {
      const notifications = this.getNotifications();
      
      // Check for duplicates within the time window
      const isDuplicate = notifications.some(n => 
        n.title === notification.title &&
        n.message === notification.message &&
        Date.now() - n.timestamp.getTime() < this.DUPLICATE_WINDOW_MS
      );
      
      if (isDuplicate) {
        console.log('Skipping duplicate notification:', notification.title);
        return false;
      }
      
      const newNotification: Notification = {
        ...notification,
        id: this.generateId(),
        timestamp: new Date(),
        read: false
      };
      
      // Add to beginning of array (newest first)
      this.saveNotifications([newNotification, ...notifications]);
      return true;
    } catch (error) {
      console.error("Error adding notification:", error);
      return false;
    }
  }

  private static generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mark a notification as read
   */
  static markAsRead(id: string): boolean {
    try {
      const notifications = this.getNotifications();
      const index = notifications.findIndex(n => n.id === id);
      
      if (index === -1) return false;
      
      const updated = [...notifications];
      updated[index] = { ...updated[index], read: true };
      
      this.saveNotifications(updated);
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
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

  /**
   * Delete a notification
   */
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

  /**
   * Clear all notifications
   */
  static clearAll(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }

  /**
   * Get count of unread notifications
   */
  static getUnreadCount(): number {
    return this.getNotifications().filter(n => !n.read).length;
  }

  /**
   * Get recent notifications (sorted by newest first)
   */
  static getRecentNotifications(limit: number = 5): Notification[] {
    return this.getNotifications()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Specific notification types

  static sendWelcomeNotification(userName?: string): boolean {
    return this.addNotification({
      title: "Welcome to SerenAI!",
      message: userName 
        ? `Welcome back, ${userName}! Start your wellness journey.` 
        : "Welcome to SerenAI! Begin exploring your wellness features.",
      type: "info",
      icon: "Bell",
      action: {
        label: "Get Started",
        href: "/dashboard"
      }
    });
  }

  static sendDailyReminder(): boolean {
    return this.addNotification({
      title: "Daily Check-in Reminder",
      message: "Don't forget to complete your daily wellness check-in",
      type: "reminder",
      icon: "Clock",
      action: {
        label: "Check In",
        href: "/dashboard/checkin"
      }
    });
  }

  static sendActivityReminder(activityName: string, href: string): boolean {
    return this.addNotification({
      title: "Activity Reminder",
      message: `Time for your ${activityName} activity!`,
      type: "reminder",
      icon: "Activity",
      action: {
        label: "Start Now",
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

  static sendSystemNotification(
    title: string, 
    message: string, 
    action?: { label: string; href: string }
  ): boolean {
    return this.addNotification({
      title,
      message,
      type: "system",
      icon: "Settings",
      action
    });
  }

  static sendTherapistMessage(therapistName: string): boolean {
    return this.addNotification({
      title: "New Message",
      message: `You have a new message from ${therapistName}`,
      type: "info",
      icon: "MessageSquare",
      action: {
        label: "View Messages",
        href: "/dashboard/messages"
      }
    });
  }
}