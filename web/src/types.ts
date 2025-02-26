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

// タスクの情報ソースタイプ
export type TaskSourceType = 'manual' | 'slack' | 'email' | 'chrome_extension';

// タスクソース定義（統合版）
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
  receivedAt?: string; // ISO日付文字列

  // Chrome特有の情報
  url?: string;
  title?: string;
  pageTitle?: string;
  faviconUrl?: string;
  capturedAt?: string; // ISO日付文字列

  // 他のメタデータ
  [key: string]: any;
}

// 古いインターフェース定義を削除
// 以下の型は使用しません
// export interface SlackSource { ... }
// export interface EmailSource { ... }
// export interface ChromeExtensionSource { ... }
// export type TaskSource = ... | { type: 'manual' };

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
  source?: TaskSource; // タスクの情報ソース
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

// 統合サービスの種類
export type IntegrationType = 'slack' | 'email' | 'chrome_extension';

// 統合サービスの基本インターフェース
export interface Integration {
  id?: string;
  userId: string;
  type: IntegrationType;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  workspaceId?: string; // SlackIntegrationのため
  emailAddress?: string; // EmailIntegrationのため
}

// Slack統合の設定
export interface SlackIntegration extends Integration {
  type: 'slack';
  workspaceId: string;
  authToken: string;
  webhookToken: string;
  channels: string[];
  triggerReactions: string[];
  taskMarkers?: string[];
}

// Email統合の設定
export interface EmailIntegration extends Integration {
  type: 'email';
  email: string;
  forwardingAddress: string;
  filterKeywords: string[];
  parseSubjectAsTitle: boolean;
}

// Chrome拡張機能の統合設定
export interface ChromeIntegration extends Integration {
  type: 'chrome_extension';
  apiKey: string;
  autoCreateFromBookmarks: boolean;
  defaultTags: string[];
}

// Slackイベント関連の型定義
export interface SlackEvent {
  token: string;
  team_id: string;
  api_app_id: string;
  event: {
    type: string;
    [key: string]: any;
  };
  type: string;
  event_id: string;
  event_time: number;
  authed_users?: string[];
  challenge?: string;
}

export interface SlackMessageEvent {
  type: 'message';
  channel: string;
  user: string;
  text: string;
  ts: string;
  team: string;
  thread_ts?: string;
  subtype?: string;
}

export interface SlackReactionEvent {
  type: 'reaction_added';
  user: string;
  reaction: string;
  item: {
    type: string;
    channel: string;
    ts: string;
  };
  item_user: string;
  event_ts: string;
}

// Slack APIレスポンスの型定義
export interface SlackApiResponse {
  ok: boolean;
  error?: string;
  [key: string]: any;
}

// Slack API: チャンネル情報
export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_private: boolean;
  is_mpim: boolean;
}

// Slack API: ユーザー情報
export interface SlackUser {
  id: string;
  name: string;
  real_name: string;
  profile: {
    email?: string;
    display_name: string;
    real_name: string;
    image_24?: string;
    image_48?: string;
    image_72?: string;
  };
}
