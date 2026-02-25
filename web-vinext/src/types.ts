import { Timestamp } from "firebase/firestore";

export interface Block {
  id: string;
  userId: string;
  name: string;
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  order: number;
}

export type ReminderType = "block_start" | "block_end" | "task_deadline";

export interface Reminder {
  id?: string;
  taskId: string;
  blockId?: string;
  type: ReminderType;
  time: string;
  message: string;
  isEnabled: boolean;
  minutesBefore?: number;
}

export type TaskSourceType = "manual" | "slack" | "email" | "chrome_extension";

export interface TaskSource {
  type: TaskSourceType;
  messageUrl?: string;
  channelId?: string;
  channelName?: string;
  messageTs?: string;
  permalink?: string;
  sender?: string;
  timestamp?: string;
  emailId?: string;
  subject?: string;
  receivedAt?: string;
  url?: string;
  title?: string;
  pageTitle?: string;
  faviconUrl?: string;
  capturedAt?: string;
  [key: string]: unknown;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  blockId: string | null;
  date: string | null; // Format: "YYYY-MM-DD"
  status: "open" | "done";
  createdAt?: Timestamp;
  deadline?: string; // Format: "YYYY-MM-DD HH:MM"
  reminderSettings?: {
    enableBlockStartReminder: boolean;
    blockStartReminderMinutes: number;
    enableBlockEndReminder: boolean;
    blockEndReminderMinutes: number;
    enableDeadlineReminder: boolean;
    deadlineReminderMinutes: number;
  };
  repeatSettings?: RepeatSettings;
  parentTaskId?: string;
  originalDate?: string;
  source?: TaskSource;
}

export type RepeatType =
  | "daily"
  | "weekdays"
  | "weekly"
  | "monthly"
  | "custom";
export type RepeatEndType = "never" | "after" | "on_date";
export type RepeatExceptionAction = "skip" | "reschedule";

export interface RepeatException {
  date: string;
  action: RepeatExceptionAction;
  newDate?: string;
  newBlockId?: string;
}

export interface RepeatSettings {
  enabled: boolean;
  type: RepeatType;
  frequency: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endType: RepeatEndType;
  occurrences?: number;
  endDate?: string;
  exceptions?: RepeatException[];
}
