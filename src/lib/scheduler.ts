// src/lib/scheduler.ts
import { NotificationService } from './notifications';

interface UserSettings {
  notificationsEnabled: boolean;
  emailReminders: boolean;
  dailyDigest: boolean;
  dataSharing: boolean;
  language: string;
  reminderTime?: string; // "HH:MM" format
  digestTime?: string;   // "HH:MM" format
}

interface NotificationAction {
  label: string;
  href: string;
}

interface ScheduledTask {
  id: string;
  type: 'reminder' | 'digest' | 'activity' | 'achievement';
  scheduledTime: Date;
  callback: () => void;
}

export class NotificationScheduler {
  private static instance: NotificationScheduler;
  private intervals: NodeJS.Timeout[] = [];
  private scheduledTasks: ScheduledTask[] = [];
  private userSettings: UserSettings = {
    notificationsEnabled: true,
    emailReminders: true,
    dailyDigest: true,
    dataSharing: false,
    language: 'en',
    reminderTime: '09:00',
    digestTime: '20:00'
  };

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  private initialize(): void {
    this.loadUserSettings();
    this.setupSchedulers();
    this.setupStorageListener();
  }

  private loadUserSettings(): void {
    try {
      const settings = localStorage.getItem('serenai-notification-settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings) as Partial<UserSettings>;
        this.userSettings = { ...this.userSettings, ...parsedSettings };
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  }

  private saveUserSettings(): void {
    try {
      localStorage.setItem(
        'serenai-notification-settings',
        JSON.stringify(this.userSettings)
      );
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  }

  private setupStorageListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'serenai-notification-settings') {
          this.loadUserSettings();
          this.reschedule();
        }
      });
    }
  }

  private setupSchedulers(): void {
    this.cleanup();

    if (!this.userSettings.notificationsEnabled) return;

    if (this.userSettings.emailReminders) {
      this.scheduleDailyReminder();
    }

    if (this.userSettings.dailyDigest) {
      this.scheduleDailyDigest();
    }

    this.scheduleActivityReminders();
    this.scheduleWeeklySummary();
    this.scheduleMonthlyAchievementsCheck();
  }

  private scheduleDailyReminder(): void {
    const [hours, minutes] = (this.userSettings.reminderTime || '09:00').split(':').map(Number);
    const scheduledTime = this.getNextScheduledTime(hours, minutes);

    const task: ScheduledTask = {
      id: `daily-reminder-${scheduledTime.getTime()}`,
      type: 'reminder',
      scheduledTime,
      callback: () => {
        if (!NotificationService.sendDailyReminder()) {
          console.warn('Failed to send daily reminder - possible duplicate');
        }
        this.scheduleDailyReminder(); // Reschedule for next day
      }
    };

    this.scheduleTask(task);
  }

  private scheduleDailyDigest(): void {
    const [hours, minutes] = (this.userSettings.digestTime || '20:00').split(':').map(Number);
    const scheduledTime = this.getNextScheduledTime(hours, minutes);

    const task: ScheduledTask = {
      id: `daily-digest-${scheduledTime.getTime()}`,
      type: 'digest',
      scheduledTime,
      callback: () => {
        NotificationService.sendSystemNotification(
          "Daily Digest",
          "Here's your daily wellness summary",
          { label: "View Summary", href: "/dashboard/insights" }
        );
        this.scheduleDailyDigest(); // Reschedule for next day
      }
    };

    this.scheduleTask(task);
  }

  private scheduleActivityReminders(): void {
    const activities = [
      { hour: 10, type: "breathing", href: "/dashboard/activities/breathing" },
      { hour: 14, type: "mindfulness", href: "/dashboard/activities/mindfulness" },
      { hour: 16, type: "mood check", href: "/dashboard/mood" }
    ];

    activities.forEach((activity, index) => {
      const scheduledTime = this.getNextScheduledTime(activity.hour, 0);
      
      const task: ScheduledTask = {
        id: `activity-${index}-${scheduledTime.getTime()}`,
        type: 'activity',
        scheduledTime,
        callback: () => {
          NotificationService.sendActivityReminder(activity.type, activity.href);
          this.scheduleActivityReminders(); // Reschedule all activities
        }
      };

      this.scheduleTask(task);
    });
  }

  private scheduleWeeklySummary(): void {
    // Schedule for next Sunday at 18:00 (6 PM)
    const scheduledTime = this.getNextWeeklyTime(0, 18, 0);

    const task: ScheduledTask = {
      id: `weekly-summary-${scheduledTime.getTime()}`,
      type: 'digest',
      scheduledTime,
      callback: () => {
        NotificationService.sendSystemNotification(
          "Weekly Summary",
          "Review your weekly wellness progress",
          { label: "View Insights", href: "/dashboard/insights" }
        );
        this.scheduleWeeklySummary(); // Reschedule for next week
      }
    };

    this.scheduleTask(task);
  }

  private scheduleMonthlyAchievementsCheck(): void {
    // Schedule for first day of next month at 9:00 AM
    const scheduledTime = this.getNextMonthlyTime(1, 9, 0);

    const task: ScheduledTask = {
      id: `monthly-check-${scheduledTime.getTime()}`,
      type: 'achievement',
      scheduledTime,
      callback: () => {
        this.checkAndSendAchievements();
        this.scheduleMonthlyAchievementsCheck(); // Reschedule for next month
      }
    };

    this.scheduleTask(task);
  }

  private getNextScheduledTime(hours: number, minutes: number): Date {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    return scheduledTime;
  }

  private getNextWeeklyTime(dayOfWeek: number, hours: number, minutes: number): Date {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setDate(now.getDate() + ((7 + dayOfWeek - now.getDay()) % 7));
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 7);
    }

    return scheduledTime;
  }

  private getNextMonthlyTime(dayOfMonth: number, hours: number, minutes: number): Date {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setMonth(now.getMonth() + 1, dayOfMonth);
    scheduledTime.setHours(hours, minutes, 0, 0);

    return scheduledTime;
  }

  private scheduleTask(task: ScheduledTask): void {
    const now = new Date();
    const timeUntilScheduled = task.scheduledTime.getTime() - now.getTime();

    if (timeUntilScheduled <= 0) {
      console.warn(`Skipping past scheduled task: ${task.id}`);
      return;
    }

    const timeoutId = setTimeout(() => {
      task.callback();
      this.removeTask(task.id);
    }, timeUntilScheduled);

    this.intervals.push(timeoutId);
    this.scheduledTasks.push(task);
  }

  private removeTask(id: string): void {
    this.scheduledTasks = this.scheduledTasks.filter(task => task.id !== id);
  }

  private checkAndSendAchievements(): void {
    try {
      const notifications = NotificationService.getNotifications();
      const hasMonthlyAchievement = notifications.some(
        n => n.type === "achievement" && 
             n.timestamp.getDate() === new Date().getDate()
      );
      
      if (!hasMonthlyAchievement) {
        NotificationService.sendAchievement("completed another month of wellness activities!");
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  public cleanup(): void {
    this.intervals.forEach(clearTimeout);
    this.intervals = [];
    this.scheduledTasks = [];
  }

  public reschedule(): void {
    this.cleanup();
    this.setupSchedulers();
  }

  public updateSettings(newSettings: Partial<UserSettings>): void {
    this.userSettings = { ...this.userSettings, ...newSettings };
    this.saveUserSettings();
    this.reschedule();
  }

  public getCurrentSettings(): UserSettings {
    return { ...this.userSettings };
  }

  public sendTestNotification(): boolean {
    return NotificationService.sendSystemNotification(
      "Test Notification",
      "This is a test notification from SerenAI",
      { label: "Go to Dashboard", href: "/dashboard" }
    );
  }

  public scheduleCustomReminder(
    title: string,
    message: string,
    time: Date,
    action?: NotificationAction
  ): string {
    const taskId = `custom-${time.getTime()}`;
    
    const task: ScheduledTask = {
      id: taskId,
      type: 'reminder',
      scheduledTime: time,
      callback: () => {
        NotificationService.addNotification({
          title,
          message,
          type: "reminder",
          icon: "Clock",
          action
        });
      }
    };

    this.scheduleTask(task);
    return taskId;
  }

  public cancelScheduledTask(taskId: string): boolean {
    const taskIndex = this.scheduledTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return false;

    clearTimeout(this.intervals[taskIndex]);
    this.intervals.splice(taskIndex, 1);
    this.scheduledTasks.splice(taskIndex, 1);
    return true;
  }
}

// Initialize on client side
if (typeof window !== 'undefined') {
  NotificationScheduler.getInstance();
}