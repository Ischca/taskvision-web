import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Task } from '@/types';
import { IntegrationType } from '../../types';
import crypto from 'crypto';
import { logger } from '@/lib/logger';
import { SlackApiResponse, SlackChannel } from '@/types';

/**
 * Slackメッセージからタスクを作成するための関数
 * @param userId ユーザーID
 * @param messageText メッセージ本文
 * @param messageUrl メッセージURL
 * @param channelName チャンネル名
 * @param sender 送信者
 * @param timestamp タイムスタンプ
 * @returns 作成されたタスクのID
 */
export async function createTaskFromSlackMessage(
  userId: string,
  messageText: string,
  messageUrl: string,
  channelName: string,
  sender: string,
  timestamp: string
): Promise<string> {
  try {
    // タイトルはメッセージの最初の行か、60文字以内に切り詰める
    const title = messageText.split('\n')[0].substring(0, 60);

    // 説明文にはメッセージ全体とメタデータを含める
    const description = `
Slackメッセージから作成されたタスク:

${messageText}

---
送信者: ${sender}
チャンネル: ${channelName}
時間: ${new Date(parseInt(timestamp) * 1000).toLocaleString()}
メッセージURL: ${messageUrl}
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
        type: 'slack',
        messageUrl,
        channelName,
        sender,
        timestamp,
      },
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating task from Slack message:', error);
    throw error;
  }
}

/**
 * Slackインテグレーションを設定するための関数
 * @param userId ユーザーID
 * @param slackWorkspaceId Slackワークスペースのid
 * @param slackAuthToken 認証トークン
 */
export async function setupSlackIntegration(
  userId: string,
  slackWorkspaceId: string,
  slackAuthToken: string
): Promise<void> {
  try {
    // Firestoreに統合設定を保存
    await addDoc(collection(db, 'integrations'), {
      userId,
      type: 'slack',
      workspaceId: slackWorkspaceId,
      authToken: slackAuthToken,
      createdAt: serverTimestamp(),
      isActive: true,
    });
  } catch (error) {
    console.error('Error setting up Slack integration:', error);
    throw error;
  }
}

/**
 * Slack連携機能の実装
 * このファイルはSlackからのメッセージをTaskVisionのタスクに変換するための
 * ユーティリティ関数を提供します。
 */

interface SlackMessageEvent {
  type: string;
  user: string;
  text: string;
  ts: string;
  channel: string;
  team: string;
  thread_ts?: string;
  // 他のSlackイベントプロパティ
}

interface SlackReactionEvent {
  type: string;
  user: string;
  reaction: string;
  item: {
    type: string;
    channel: string;
    ts: string;
  };
  event_ts: string;
  // 他のSlackリアクションイベントプロパティ
}

export interface SlackIntegrationSettings {
  workspaceId: string;
  botToken: string;
  channels: string[];
  triggerReactions: string[];
  defaultDueDate: 'today' | 'tomorrow' | 'none';
}

/**
 * Slackのメッセージイベントからタスクデータを抽出します
 */
export const extractTaskFromSlackMessage = (message: SlackMessageEvent) => {
  // メッセージの内容からタスク情報を抽出する実装
  const lines = message.text.split('\n');
  const title = lines[0].substring(0, 60); // 最初の行をタイトルとして使用（最大60文字）
  const description = message.text;

  return {
    title,
    description,
    source: {
      type: 'slack' as IntegrationType,
      channelId: message.channel,
      messageTs: message.ts,
      userId: message.user,
      teamId: message.team,
      threadTs: message.thread_ts,
    },
    created: new Date(),
    completed: false,
    // その他のタスクプロパティ
  };
};

/**
 * Slackのリアクションイベントからタスクを作成するかどうかを判断します
 */
export const shouldCreateTaskFromReaction = (
  reactionEvent: SlackReactionEvent,
  settings: SlackIntegrationSettings
) => {
  // 設定に基づいてタスク作成の条件をチェック
  return settings.triggerReactions.includes(reactionEvent.reaction);
};

/**
 * Slackのリクエスト署名を検証する
 * @see https://api.slack.com/authentication/verifying-requests-from-slack
 *
 * @param signingSecret Slackアプリの署名シークレット
 * @param requestSignature リクエストヘッダーのX-Slack-Signature
 * @param requestTimestamp リクエストヘッダーのX-Slack-Request-Timestamp
 * @param requestBody リクエストボディ（文字列形式）
 * @returns 署名が有効かどうか
 */
export async function verifySlackRequestSignature(
  signingSecret: string,
  requestSignature: string,
  requestTimestamp: string,
  requestBody: string
): Promise<boolean> {
  try {
    // タイムスタンプのチェック（5分以上古いリクエストは拒否）
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timestamp = parseInt(requestTimestamp, 10);

    if (isNaN(timestamp) || Math.abs(currentTimestamp - timestamp) > 300) {
      logger.warn(`Invalid timestamp: ${requestTimestamp}`);
      return false;
    }

    // 署名の生成
    const baseString = `v0:${requestTimestamp}:${requestBody}`;
    const hmac = crypto.createHmac('sha256', signingSecret);
    hmac.update(baseString);
    const signature = `v0=${hmac.digest('hex')}`;

    // タイミング攻撃を防ぐために一定時間の比較を行う
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(requestSignature)
    );
  } catch (error) {
    logger.error('Error verifying Slack request signature:', error);
    return false;
  }
}

/**
 * Slackボットトークンの有効性を検証する
 *
 * @param token Slackボットトークン
 * @returns トークンが有効かどうか
 */
export async function validateSlackToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = (await response.json()) as SlackApiResponse;
    return data.ok === true;
  } catch (error) {
    logger.error('Error validating Slack token:', error);
    return false;
  }
}

/**
 * Slackチャンネル一覧を取得
 *
 * @param token Slackボットトークン
 * @returns チャンネル一覧
 */
export async function fetchSlackChannels(
  token: string
): Promise<SlackChannel[]> {
  try {
    // 公開チャンネルの取得
    const publicResponse = await fetch(
      'https://slack.com/api/conversations.list',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          types: 'public_channel',
          exclude_archived: true,
          limit: 1000,
        }),
      }
    );

    const publicData = (await publicResponse.json()) as SlackApiResponse;

    if (!publicData.ok) {
      logger.error(`Slack API error: ${publicData.error}`);
      return [];
    }

    // プライベートチャンネルの取得
    const privateResponse = await fetch(
      'https://slack.com/api/conversations.list',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          types: 'private_channel',
          exclude_archived: true,
          limit: 1000,
        }),
      }
    );

    const privateData = (await privateResponse.json()) as SlackApiResponse;

    if (!privateData.ok) {
      logger.error(`Slack API error: ${privateData.error}`);
      // プライベートチャンネルのエラーは無視して公開チャンネルのみ返す
      return publicData.channels || [];
    }

    // 公開チャンネルとプライベートチャンネルを結合
    const allChannels = [
      ...(publicData.channels || []),
      ...(privateData.channels || []),
    ] as SlackChannel[];

    // 名前でソート
    return allChannels.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    logger.error('Error fetching Slack channels:', error);
    return [];
  }
}
