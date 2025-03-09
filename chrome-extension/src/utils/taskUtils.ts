// taskvision-shared パッケージから型と関数をインポート
import { Task, TaskData, TaskSource, TaskPriority } from 'taskvision-shared';

// formatDateの実装
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// suggestPriorityの実装
function suggestPriority(
  source: TaskSource | undefined
): 'high' | 'medium' | 'low' {
  if (!source) return 'medium';

  // ソースタイプによる基本的な優先度の提案
  switch (source.type) {
    case 'slack':
      // Slackメッセージは基本的に中程度の優先度
      return 'medium';
    case 'email':
      // メールは内容によって高い場合もあるが基本は中程度
      return 'medium';
    case 'chrome_extension':
      // Web情報は基本的に低い優先度
      return 'low';
    default:
      return 'medium';
  }
}

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
