// taskvision-shared パッケージから型と関数をインポート
import {
  Task,
  TaskData,
  TaskSource,
  TaskPriority,
  formatDate,
  suggestPriority,
} from 'taskvision-shared';

/**
 * ウェブページの情報からタスクを作成する
 * @param pageTitle ページのタイトル
 * @param pageUrl ページのURL
 * @param faviconUrl ファビコンのURL
 * @param description 説明文（オプション）
 * @returns 作成されたタスクデータ
 */
export function createTaskFromWebPage(
  pageTitle: string,
  pageUrl: string,
  faviconUrl: string,
  description?: string
): TaskData {
  const now = new Date();

  // ウェブページ情報をソースとして設定
  const source: TaskSource = {
    type: 'chrome_extension',
    url: pageUrl,
    title: pageTitle,
    pageTitle: pageTitle,
    faviconUrl: faviconUrl,
    capturedAt: now.toISOString(),
  };

  // 優先度を自動的に提案
  const priority = suggestPriority(source);

  return {
    title: pageTitle,
    description: description || `ウェブページから取得: ${pageUrl}`,
    source: source,
    date: formatDate(now),
    status: 'open',
    priority: priority,
  };
}

/**
 * タスクをAPIに送信する
 * @param task 送信するタスク
 * @returns 送信が成功したかどうか
 */
export async function sendTaskToAPI(task: TaskData): Promise<boolean> {
  try {
    // ここではAPIエンドポイントを呼び出す実装をする
    console.log('タスクをAPIに送信:', task);
    return true;
  } catch (error) {
    console.error('タスク送信エラー:', error);
    return false;
  }
}
