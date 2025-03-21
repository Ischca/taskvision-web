import { Task, TaskData, TaskSource, TaskSourceType } from "../types";
import { formatDate } from "./dateUtils";

/**
 * タスクソースからラベルを生成する
 */
export function getSourceLabel(source?: TaskSource): string {
  if (!source) return "手動作成";

  switch (source.type) {
    case "slack":
      return `Slack: ${source.channelName || ""}`;
    case "email":
      return `Email: ${source.subject || ""}`;
    case "chrome_extension":
      return `Web: ${source.title || source.url || ""}`;
    default:
      return "手動作成";
  }
}

/**
 * タスクが期限切れかどうかをチェック
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.deadline) return false;

  const now = new Date();
  const deadline = new Date(task.deadline);

  return deadline < now;
}

/**
 * ソース情報に基づいて優先順位を提案
 */
export function suggestPriority(
  source: TaskSource | undefined,
): "high" | "medium" | "low" {
  if (!source) return "medium";

  // ソースタイプによる基本的な優先度の提案
  switch (source.type) {
    case "slack":
      // Slackメッセージは基本的に中程度の優先度
      return "medium";
    case "email":
      // メールは内容によって高い場合もあるが基本は中程度
      return "medium";
    case "chrome_extension":
      // Web情報は基本的に低い優先度
      return "low";
    default:
      return "medium";
  }
}

/**
 * タスクを完了状態に変更
 */
export function completeTask(task: Task): Task {
  return {
    ...task,
    status: "done",
  };
}

/**
 * タスクをオープン状態に戻す
 */
export function reopenTask(task: Task): Task {
  return {
    ...task,
    status: "open",
  };
}
