import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { IntegrationType } from '../../types';

/**
 * Webページからタスクを作成するための関数
 * @param userId ユーザーID
 * @param title タスクのタイトル
 * @param url ページURL
 * @param pageTitle ページタイトル
 * @param selectedText 選択されたテキスト（オプション）
 * @returns 作成されたタスクのID
 */
export async function createTaskFromWebPage(
  userId: string,
  title: string,
  url: string,
  pageTitle: string,
  selectedText?: string
): Promise<string> {
  try {
    // 説明文を作成
    const description = `
Webページから作成されたタスク:

ページ: ${pageTitle}
URL: ${url}

${selectedText ? `選択されたテキスト:\n${selectedText}` : ''}
`;

    // Firestoreにタスクを追加
    const docRef = await addDoc(collection(db, 'tasks'), {
      userId,
      title: title.substring(0, 100), // 100文字以内に制限
      description: description.trim(),
      blockId: null, // ブロックは未割り当て
      date: null, // 日付は未割り当て
      status: 'open',
      createdAt: serverTimestamp(),
      source: {
        type: 'chrome_extension',
        url,
        pageTitle,
        capturedAt: new Date().toISOString(),
      },
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating task from web page:', error);
    throw error;
  }
}

/**
 * タスク作成後にChrome拡張機能に成功レスポンスを返すための関数
 * @param success 成功したかどうか
 * @param taskId 作成されたタスクのID（成功時）
 * @param errorMessage エラーメッセージ（失敗時）
 */
export function createExtensionResponse(
  success: boolean,
  taskId?: string,
  errorMessage?: string
): object {
  return {
    success,
    taskId,
    errorMessage,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Chrome拡張機能のAPIエンドポイント用関数テンプレート
 * Note: 実際のAPIルートで使用する関数の基本形
 */
export async function handleChromeExtensionRequest(
  userId: string,
  requestData: {
    title: string;
    url: string;
    pageTitle: string;
    selectedText?: string;
  }
): Promise<object> {
  try {
    const { title, url, pageTitle, selectedText } = requestData;

    // タイトルが空の場合はページタイトルを使用
    const taskTitle = title.trim() || pageTitle;

    const taskId = await createTaskFromWebPage(
      userId,
      taskTitle,
      url,
      pageTitle,
      selectedText
    );

    return createExtensionResponse(true, taskId);
  } catch (error) {
    console.error('Error handling Chrome extension request:', error);
    return createExtensionResponse(
      false,
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Chrome拡張機能連携の実装
 * このファイルはChrome拡張機能からのデータをTaskVisionのタスクに変換するための
 * ユーティリティ関数を提供します。
 */

export interface ChromeExtensionData {
  url: string;
  pageTitle: string;
  selectedText?: string;
  customTitle?: string;
  customDescription?: string;
  screenshot?: string; // Base64エンコードされた画像データ
  capturedAt: string; // ISO日付文字列
}

export interface ChromeExtensionSettings {
  includeScreenshot: boolean;
  maxScreenshotSize: number; // KB単位
  defaultSettings: {
    assignToBlock: boolean;
    defaultBlockId?: string;
    assignToToday: boolean;
  };
}

/**
 * Chrome拡張機能からのデータをタスクに変換します
 */
export const extractTaskFromChromeExtension = (data: ChromeExtensionData) => {
  // カスタムタイトルがあればそれを使用、なければページタイトルを使用
  const title = data.customTitle || data.pageTitle;

  // カスタム説明があればそれを使用、なければ選択テキスト（あれば）とURLを組み合わせる
  let description = data.customDescription || '';

  if (!data.customDescription && data.selectedText) {
    description = `選択テキスト:\n${data.selectedText}\n\nURL: ${data.url}`;
  } else if (!data.customDescription) {
    description = `URL: ${data.url}`;
  }

  return {
    title,
    description,
    source: {
      type: 'chrome_extension' as IntegrationType,
      url: data.url,
      pageTitle: data.pageTitle,
      capturedAt: data.capturedAt,
      hasScreenshot: !!data.screenshot,
    },
    created: new Date(),
    completed: false,
    // その他のタスクプロパティ
  };
};

/**
 * スクリーンショットのサイズをチェックし、必要に応じて処理します
 * @returns 処理後のスクリーンショットデータ、またはサイズ超過の場合はnull
 */
export const processScreenshot = (
  screenshot: string,
  settings: ChromeExtensionSettings
): string | null => {
  if (!settings.includeScreenshot) {
    return null;
  }

  // Base64のプレフィックス（例：data:image/png;base64,）を除外してサイズを計算
  const base64Data = screenshot.split(',')[1];
  if (!base64Data) {
    return null;
  }

  // Base64文字列のサイズから画像のバイトサイズをおおよそ計算
  const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
  const sizeInKB = sizeInBytes / 1024;

  if (sizeInKB > settings.maxScreenshotSize) {
    // サイズ超過の場合はnullを返す
    // 実際の実装では、画像リサイズなどの処理を行うことも考えられる
    return null;
  }

  return screenshot;
};

/**
 * Chrome拡張機能の認証トークンを検証します
 */
export const validateExtensionToken = async (
  token: string
): Promise<boolean> => {
  try {
    // トークン検証ロジックの実装
    // このサンプルでは常にtrueを返します
    return true;
  } catch (error) {
    console.error('拡張機能トークン検証エラー:', error);
    return false;
  }
};

/**
 * 拡張機能リクエストからユーザーIDを抽出します
 */
export const extractUserFromToken = async (
  token: string
): Promise<string | null> => {
  try {
    // トークンからユーザーIDを抽出するロジック
    // 実際の実装ではJWTの検証と解読などが必要です
    return 'sample-user-id';
  } catch (error) {
    console.error('ユーザーID抽出エラー:', error);
    return null;
  }
};

/**
 * スクリーンショットをストレージに保存します
 */
export const saveScreenshotToStorage = async (
  screenshot: string,
  userId: string,
  taskId: string
): Promise<string | null> => {
  try {
    // スクリーンショットを保存するロジック
    // 実際の実装ではFirebase Storageなどを使用します

    // 保存先のURLを返す
    return `https://example.com/screenshots/${userId}/${taskId}.png`;
  } catch (error) {
    console.error('スクリーンショット保存エラー:', error);
    return null;
  }
};
