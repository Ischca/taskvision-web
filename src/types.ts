import { Timestamp } from 'firebase/firestore';

export interface Block {
  id: string;
  userId: string;
  name: string;
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  order: number;
}

export type ReminderType = 'block_start' | 'block_end' | 'task_deadline';

export interface Reminder {
  id?: string;
  taskId: string;
  blockId?: string;
  type: ReminderType;
  time: string; // Format: "HH:MM" または "YYYY-MM-DD HH:MM"
  message: string;
  isEnabled: boolean;
  minutesBefore?: number; // 開始または終了の何分前に通知するか
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  blockId: string | null;
  date: string | null; // Format: "YYYY-MM-DD"
  status: 'open' | 'done';
  createdAt?: Timestamp;
  deadline?: string; // Format: "YYYY-MM-DD HH:MM"
  reminderSettings?: {
    enableBlockStartReminder: boolean;
    blockStartReminderMinutes: number; // ブロック開始の何分前に通知するか
    enableBlockEndReminder: boolean;
    blockEndReminderMinutes: number; // ブロック終了の何分前に通知するか
    enableDeadlineReminder: boolean;
    deadlineReminderMinutes: number; // 締切の何分前に通知するか
  };
  repeatSettings?: RepeatSettings; // 繰り返し設定
  parentTaskId?: string; // これが設定されていればインスタンス（子タスク）
  originalDate?: string; // 親タスクから生成されたときの元々の日付
}

// 繰り返しタイプの定義
export type RepeatType = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom';

// 繰り返し終了タイプの定義
export type RepeatEndType = 'never' | 'after' | 'on_date';

// 繰り返し例外アクションの定義
export type RepeatExceptionAction = 'skip' | 'reschedule';

// 繰り返し例外の定義
export interface RepeatException {
  date: string; // 例外の日付 YYYY-MM-DD
  action: RepeatExceptionAction;
  newDate?: string; // 振替先日付
  newBlockId?: string; // 振替先ブロックID
}

// 繰り返し設定の定義
export interface RepeatSettings {
  enabled: boolean;
  type: RepeatType;
  frequency: number; // 1=毎日、2=1日おき、など
  daysOfWeek?: number[]; // 週次の場合：[0,1,2,3,4,5,6] (0=日曜)
  dayOfMonth?: number; // 月次の場合：1-31
  endType: RepeatEndType;
  occurrences?: number; // 回数指定の場合
  endDate?: string; // 終了日指定の場合
  exceptions?: RepeatException[]; // 例外設定
}
