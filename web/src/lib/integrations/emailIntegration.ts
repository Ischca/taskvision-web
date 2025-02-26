import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Task } from '@/types';
import { IntegrationType } from '../../types';

/**
 * メールからタスクを作成するための関数
 * @param userId ユーザーID
 * @param subject メールの件名
 * @param body メールの本文
 * @param sender 送信者
 * @param receivedAt 受信日時
 * @returns 作成されたタスクのID
 */
export async function createTaskFromEmail(
  userId: string,
  subject: string,
  body: string,
  sender: string,
  receivedAt: Date
): Promise<string> {
  try {
    // メールの件名をタスクのタイトルとして使用
    const title = subject.substring(0, 100); // 100文字以内に制限

    // 本文を説明欄に入れる
    const description = `
メールから作成されたタスク:

${body}

---
送信者: ${sender}
受信日時: ${receivedAt.toLocaleString()}
`;

    // Firestoreにタスクを追加
    const docRef = await addDoc(collection(db, 'tasks'), {
      userId,
      title,
      description: description.trim(),
      blockId: null, // ブロックは未割り当て
      date: null, // 日付は未割り当て
      status: 'open',
      createdAt: serverTimestamp(),
      source: {
        type: 'email',
        sender,
        receivedAt: receivedAt.toISOString(),
        subject,
      },
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating task from email:', error);
    throw error;
  }
}

/**
 * メールフィルターのインターフェース
 */
export interface EmailFilter {
  fromEmail?: string;
  toEmail?: string;
  subjectContains?: string[];
  bodyContains?: string[];
  excludeEmails?: string[];
}

/**
 * メールインテグレーションを設定するための関数
 * @param userId ユーザーID
 * @param emailAddress 連携するメールアドレス
 * @param filters 適用するフィルター
 */
export async function setupEmailIntegration(
  userId: string,
  emailAddress: string,
  filters: EmailFilter = {}
): Promise<void> {
  try {
    // Firestoreに統合設定を保存
    await addDoc(collection(db, 'integrations'), {
      userId,
      type: 'email',
      emailAddress,
      filters,
      createdAt: serverTimestamp(),
      isActive: true,
    });
  } catch (error) {
    console.error('Error setting up email integration:', error);
    throw error;
  }
}

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: EmailAttachment[];
  date: Date;
  messageId: string;
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  content: Buffer;
  size: number;
}

export interface EmailIntegrationSettings {
  emailAddress: string;
  filters?: {
    fromEmail?: string[];
    subjectContains?: string[];
    bodyContains?: string[];
    excludeEmails?: string[];
  };
  attachmentSettings?: {
    saveAttachments: boolean;
    maxSize: number; // バイト単位
    allowedTypes: string[]; // e.g. ['image/jpeg', 'application/pdf']
  };
}

/**
 * メールからタスクデータを抽出します
 */
export const extractTaskFromEmail = (email: EmailMessage) => {
  // メールの内容からタスク情報を抽出する実装
  const title = email.subject.substring(0, 100); // 件名をタイトルとして使用（最大100文字）

  // HTML本文があればそれをプレーンテキストに変換、なければテキスト本文を使用
  const description = email.text;

  return {
    title,
    description,
    source: {
      type: 'email' as IntegrationType,
      sender: email.from,
      receivedAt: email.date.toISOString(),
      subject: email.subject,
      messageId: email.messageId,
    },
    created: new Date(),
    completed: false,
    // その他のタスクプロパティ
  };
};

/**
 * メールの本文からHTMLタグを削除してプレーンテキストに変換します
 */
export const convertHtmlToText = (html: string): string => {
  // 簡易的なHTML→テキスト変換（本番環境では適切なライブラリを使用することをお勧めします）
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '') // スタイルタグを削除
    .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '') // スクリプトタグを削除
    .replace(/<[^>]+>/g, '') // HTMLタグを削除
    .replace(/&nbsp;/g, ' ') // &nbsp;を空白に置換
    .replace(/\s+/g, ' ') // 連続する空白を一つにまとめる
    .trim(); // 前後の空白を削除
};

/**
 * メールがフィルタリング条件に一致するかチェックします
 */
export const isEmailAllowed = (
  email: EmailMessage,
  settings: EmailIntegrationSettings
): boolean => {
  const filters = settings.filters;

  // フィルタ設定がなければすべて許可
  if (!filters) return true;

  // 送信者フィルタをチェック
  if (filters.fromEmail && filters.fromEmail.length > 0) {
    const senderAllowed = filters.fromEmail.some((allowedSender) =>
      email.from.includes(allowedSender)
    );
    if (!senderAllowed) return false;
  }

  // 除外リストをチェック
  if (filters.excludeEmails && filters.excludeEmails.length > 0) {
    const isExcluded = filters.excludeEmails.some((excludedEmail) =>
      email.from.includes(excludedEmail)
    );
    if (isExcluded) return false;
  }

  // 件名フィルタをチェック
  if (filters.subjectContains && filters.subjectContains.length > 0) {
    const subjectMatch = filters.subjectContains.some((keyword) =>
      email.subject.toLowerCase().includes(keyword.toLowerCase())
    );
    if (!subjectMatch) return false;
  }

  // 本文フィルタをチェック
  if (filters.bodyContains && filters.bodyContains.length > 0) {
    const bodyText = email.text.toLowerCase();
    const bodyMatch = filters.bodyContains.some((keyword) =>
      bodyText.includes(keyword.toLowerCase())
    );
    if (!bodyMatch) return false;
  }

  return true;
};

/**
 * メールから日付情報を抽出します（例：「明日まで」「5/1までに」など）
 */
export const extractDateFromEmailContent = (content: string): Date | null => {
  // 日付抽出のロジック実装
  // 実際の実装ではより高度な自然言語処理やパターンマッチングが必要です

  // このサンプルでは簡易的なパターンマッチのみ実装
  const tomorrowMatch = content.match(/明日|tomorrow/i);
  if (tomorrowMatch) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  const nextWeekMatch = content.match(/来週|next week/i);
  if (nextWeekMatch) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  }

  // 日付が見つからない場合はnullを返す
  return null;
};

/**
 * 添付ファイルが許可されているかチェックします
 */
export const isAttachmentAllowed = (
  attachment: EmailAttachment,
  settings: EmailIntegrationSettings
): boolean => {
  if (
    !settings.attachmentSettings ||
    !settings.attachmentSettings.saveAttachments
  ) {
    return false;
  }

  // サイズをチェック
  if (attachment.size > settings.attachmentSettings.maxSize) {
    return false;
  }

  // ファイルタイプをチェック
  if (
    settings.attachmentSettings.allowedTypes &&
    settings.attachmentSettings.allowedTypes.length > 0 &&
    !settings.attachmentSettings.allowedTypes.includes(attachment.contentType)
  ) {
    return false;
  }

  return true;
};
