// src/lib/scheduler.ts
import { NotificationService } from './notifications';

interface UserSettings {
  notificationsEnabled: boolean;
  emailReminders: boolean;
  dailyDigest: boolean;
  reminderTime: string; // "HH:MM" format
  digestTime: string;   // "HH:MM" format
  activityReminders: boolean;
}

interface ScheduledTask {
  id: string;
  type: 'reminder' | 'digest' | 'activity';
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
    activityReminders: true,
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
    this.loadSettings();
    this.setupSchedulers();
    this.setupStorageListener();
  }

  private loadSettings(): void {
    try {
      const settings = localStorage.getItem('serenai-notification-settings');
      if (settings) {
        this.userSettings = { ...this.userSettings, ...JSON.parse(settings) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(
        'serenai-notification-settings',
        JSON.stringify(this.userSettings)
      );
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === 'serenai-notification-settings') {
        this.loadSettings();
        this.reschedule();
      }
    });
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

    if (this.userSettings.activityReminders) {
      this.scheduleActivityReminders();
    }

    this.scheduleWeeklySummary();
    this.scheduleMonthlyAchievements();
  }

  private scheduleDailyReminder(): void {
    const [hours, minutes] = this.userSettings.reminderTime.split(':').map(Number);
    const scheduledTime = this.getNextDailyTime(hours, minutes);

    const task: ScheduledTask = {
      id: `daily-reminder-${scheduledTime.getTime()}`,
      type: 'reminder',
      scheduledTime,
      callback: () => {
        NotificationService.sendDailyReminder();
        this.scheduleDailyReminder(); // Reschedule
      }
    };

    this.scheduleTask(task);
  }

  private scheduleDailyDigest(): void {
    const [hours, minutes] = this.userSettings.digestTime.split(':').map(Number);
    const scheduledTime = this.getNextDailyTime(hours, minutes);

    const task: ScheduledTask = {
      id: `daily-digest-${scheduledTime.getTime()}`,
      type: 'digest',
      scheduledTime,
      callback: () => {
        NotificationService.sendSystemNotification(
          "Daily Digest",
          "Here's your daily wellness summary",
          { label: "View Insights", href: "/dashboard/insights" }
        );
        this.scheduleDailyDigest(); // Reschedule
      }
    };

    this.scheduleTask(task);
  }

  private scheduleActivityReminders(): void {
    const activities = [
      { hour: 10, type: "morning meditation", href: "/meditation" },
      { hour: 14, type: "afternoon mindfulness", href: "/mindfulness" },
      { hour: 18, type: "evening reflection", href: "/journal" }
    ];

    activities.forEach((activity, index) => {
      const scheduledTime = this.getNextDailyTime(activity.hour, 0);
      
      const task: ScheduledTask = {
        id: `activity-${index}-${scheduledTime.getTime()}`,
        type: 'activity',
        scheduledTime,
        callback: () => {
          NotificationService.sendActivityReminder(activity.type, activity.href);
          this.scheduleActivityReminders(); // Reschedule all
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
          { label: "View Report", href: "/dashboard/reports" }
        );
        this.scheduleWeeklySummary(); // Reschedule
      }
    };

    this.scheduleTask(task);
  }

  private scheduleMonthlyAchievements(): void {
    // Schedule for first day of next month at 9:00 AM
    const scheduledTime = this.getNextMonthlyTime(1, 9, 0);

    const task: ScheduledTask = {
      id: `monthly-achievements-${scheduledTime.getTime()}`,
      type: 'reminder',
      scheduledTime,
      callback: () => {
        NotificationService.sendAchievement("You've completed another month of wellness activities!");
        this.scheduleMonthlyAchievements(); // Reschedule
      }
    };

    this.scheduleTask(task);
  }

  private getNextDailyTime(hours: number, minutes: number): Date {
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

    if (scheduledTime <= now) {
      scheduledTime.setMonth(scheduledTime.getMonth() + 1);
    }

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
      try {
        task.callback();
      } catch (error) {
        console.error(`Error executing task ${task.id}:`, error);
      }
      this.removeTask(task.id);
    }, timeUntilScheduled);

    this.intervals.push(timeoutId);
    this.scheduledTasks.push(task);
  }

  private removeTask(id: string): void {
    this.scheduledTasks = this.scheduledTasks.filter(task => task.id !== id);
  }

  public updateSettings(newSettings: Partial<UserSettings>): void {
    this.userSettings = { ...this.userSettings, ...newSettings };
    this.saveSettings();
    this.reschedule();
  }

  public reschedule(): void {
    this.cleanup();
    this.setupSchedulers();
  }

  public cleanup(): void {
    this.intervals.forEach(clearTimeout);
    this.intervals = [];
    this.scheduledTasks = [];
  }

  public getCurrentSettings(): UserSettings {
    return { ...this.userSettings };
  }

  public getScheduledTasks(): ScheduledTask[] {
    return [...this.scheduledTasks];
  }
}

// Initialize on client side
if (typeof window !== 'undefined') {
  NotificationScheduler.getInstance();
}