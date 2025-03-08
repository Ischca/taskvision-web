/**
 * TaskVision共通型定義ファイル
 * Webアプリケーションとクローム拡張機能で共有される型定義を含みます
 */

// タスクデータの基本型
export interface TaskData {
  title: string;
  description?: string;
  blockId?: string | null;
  date?: string | null; // Format: "YYYY-MM-DD"
  status?: 'open' | 'done';
  deadline?: string | null; // Format: "YYYY-MM-DD HH:MM"
  source?: TaskSource;
  userId?: string;
  createdAt?: any; // Firebaseのタイムスタンプ型は環境によって異なるため抽象化
  priority?: TaskPriority; // 優先度を追加
  tags?: string[]; // タグを追加
  [key: string]: any;
}

// 優先度の型
export type TaskPriority = 'high' | 'medium' | 'low';

// 完全なタスク型
export interface Task extends TaskData {
  id: string;
  userId: string;
  blockId: string | null;
  status: 'open' | 'done';
  reminderSettings?: ReminderSettings;
  repeatSettings?: RepeatSettings;
  parentTaskId?: string;
  originalDate?: string;
  priority: TaskPriority; // 優先度を必須に
}

// リマインダー設定型
export interface ReminderSettings {
  enableBlockStartReminder: boolean;
  blockStartReminderMinutes: number;
  enableBlockEndReminder: boolean;
  blockEndReminderMinutes: number;
  enableDeadlineReminder: boolean;
  deadlineReminderMinutes: number;
}

// タスクの情報ソースタイプ
export type TaskSourceType = 'manual' | 'slack' | 'email' | 'chrome_extension';

// タスクソース定義
export interface TaskSource {
  type: TaskSourceType;

  // Slack特有の情報
  messageUrl?: string;
  channelId?: string;
  channelName?: string;
  messageTs?: string;
  permalink?: string;
  sender?: string;
  timestamp?: string;

  // Email特有の情報
  emailId?: string;
  subject?: string;
  receivedAt?: string;

  // Chrome特有の情報
  url?: string;
  title?: string;
  pageTitle?: string;
  faviconUrl?: string;
  capturedAt?: string;

  // その他のメタデータ
  [key: string]: any;
}

// ブロック型
export interface Block {
  id: string;
  userId: string;
  name: string;
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  order: number;
  color?: string; // ブロックの色を追加
}

// リマインダータイプ
export type ReminderType = 'block_start' | 'block_end' | 'task_deadline';

// リマインダー型
export interface Reminder {
  id?: string;
  taskId: string;
  blockId?: string;
  type: ReminderType;
  time: string; // Format: "HH:MM" または "YYYY-MM-DD HH:MM"
  message: string;
  isEnabled: boolean;
  minutesBefore?: number;
}

// 繰り返し関連の型定義
export type RepeatType = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom';
export type RepeatEndType = 'never' | 'after' | 'on_date';
export type RepeatExceptionAction = 'skip' | 'reschedule';

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

// 認証関連の型
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// API関連の型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// タグ関連の型
export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
}

// タスクビュー・フィルタリング関連の型
export interface TaskFilter {
  status?: 'open' | 'done' | 'all';
  priority?: TaskPriority | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  searchText?: string;
}

// ユーザー設定型
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultTaskView: 'day' | 'week' | 'month';
  defaultPriority: TaskPriority;
  workingHours: {
    start: string; // Format: "HH:MM"
    end: string; // Format: "HH:MM"
  };
  weekStart: 0 | 1 | 6; // 0: 日曜日, 1: 月曜日, 6: 土曜日
  notifications: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
  };
}
