// taskvision-shared パッケージから型と関数をインポート
import {
  Task,
  TaskData,
  TaskSource,
  TaskPriority,
  formatDate,
  isTaskOverdue,
  getSourceLabel,
  suggestPriority,
} from 'taskvision-shared';

/**
 * 新しいタスクを作成するためのヘルパー関数
 * @param taskData タスクのデータ
 * @returns 作成されたタスクオブジェクト
 */
export function createNewTask(taskData: TaskData): Task {
  const now = new Date();
  const source = taskData.source;

  return {
    ...taskData,
    id: `task_${Date.now()}`,
    userId: taskData.userId || '',
    blockId: taskData.blockId || null,
    status: taskData.status || 'open',
    createdAt: now.toISOString(),
    priority: taskData.priority || suggestPriority(source),
  };
}

/**
 * タスクが期限切れかどうかをチェックする
 * @param task チェックするタスク
 * @returns 期限切れの場合true、そうでない場合false
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.deadline) return false;

  const now = new Date();
  const deadline = new Date(task.deadline);

  return deadline < now;
}

/**
 * タスクソース情報からラベルを生成する
 * @param source タスクのソース情報
 * @returns 表示用のラベル文字列
 */
export function getSourceLabel(source?: TaskSource): string {
  if (!source) return '手動作成';

  switch (source.type) {
    case 'slack':
      return `Slack: ${source.channelName || ''}`;
    case 'email':
      return `Email: ${source.subject || ''}`;
    case 'chrome_extension':
      return `Web: ${source.title || source.url || ''}`;
    default:
      return '手動作成';
  }
}

/**
 * タスクの表示用ラベルを生成する
 * @param task 対象のタスク
 * @returns 表示用のラベル
 */
export function getTaskLabel(task: Task): string {
  let label = task.title;

  // 期限切れの場合は警告を追加
  if (isTaskOverdue(task)) {
    label += ' [期限切れ]';
  }

  // 優先度が高い場合は表示
  if (task.priority === 'high') {
    label += ' [重要]';
  }

  // ソース情報があれば追加
  if (task.source) {
    label += ` (${getSourceLabel(task.source)})`;
  }

  return label;
}
