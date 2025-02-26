import { NextRequest, NextResponse } from 'next/server';
import {
  verifySlackRequestSignature,
  extractTaskFromSlackMessage,
} from '@/lib/integrations/slackIntegration';
import { getIntegrationByType } from '@/lib/integrations/integrationUtils';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import crypto from 'crypto';

// レート制限のための簡易実装
const requestCounts = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 10; // 1分間に最大10リクエスト
const RATE_WINDOW = 60 * 1000; // 1分間のウィンドウ（ミリ秒）

/**
 * レート制限をチェックする関数
 * @param ip IPアドレス
 * @returns 制限を超えていればtrue、そうでなければfalse
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return false;
  }

  // ウィンドウをリセット
  if (now - record.timestamp > RATE_WINDOW) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return false;
  }

  // カウントを増やす
  record.count += 1;
  requestCounts.set(ip, record);

  // 制限を超えているかチェック
  return record.count > RATE_LIMIT;
}

/**
 * Slackからのリクエストを処理するAPIルート
 */
export async function POST(request: NextRequest) {
  try {
    // IPベースのレート制限
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      console.warn(`レート制限超過: ${ip}`);
      return NextResponse.json(
        {
          error:
            'レート制限を超えました。しばらく待ってから再試行してください。',
        },
        { status: 429 }
      );
    }

    // リクエストの検証
    const body = await request.text();
    const headers = request.headers;

    // Slackの署名とタイムスタンプを取得
    const signature = headers.get('x-slack-signature');
    const timestamp = headers.get('x-slack-request-timestamp');

    // 必須パラメータの確認
    if (!signature || !timestamp) {
      console.error('署名またはタイムスタンプがありません');
      return NextResponse.json(
        { error: 'リクエストの検証に失敗しました' },
        { status: 401 }
      );
    }

    // リクエストURLからユーザーIDとトークンを取得
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const verificationToken = url.searchParams.get('token');

    if (!userId || !verificationToken) {
      console.error('ユーザーIDまたはトークンがありません');
      return NextResponse.json(
        { error: 'ユーザーIDまたはトークンが必要です' },
        { status: 400 }
      );
    }

    // ユーザーの連携設定を取得
    const integration = await getIntegrationByType(userId, 'slack');
    if (!integration || !integration.isActive) {
      console.error(`Slack連携が存在しないか、無効です (userId: ${userId})`);
      return NextResponse.json(
        { error: 'Slack連携が設定されていないか、無効になっています' },
        { status: 404 }
      );
    }

    // 署名シークレットの取得（実際の実装では安全に保存された値から取得）
    // ここではSlack統合設定から取得すると仮定
    const signingSecret = process.env.SLACK_SIGNING_SECRET || '';

    // 署名を検証
    if (
      !verifySlackRequestSignature(signature, timestamp, body, signingSecret)
    ) {
      console.error('Slackリクエストの署名検証に失敗しました');
      return NextResponse.json(
        { error: '署名検証に失敗しました' },
        { status: 401 }
      );
    }

    // ボディをJSONとしてパース
    let slackEvent;
    try {
      slackEvent = JSON.parse(body);
    } catch (e) {
      console.error('JSONパースエラー:', e);
      return NextResponse.json(
        { error: 'リクエストボディの解析に失敗しました' },
        { status: 400 }
      );
    }

    // Slack Challenge Checkに応答
    // Slackはイベント購読設定時に確認リクエストを送信します
    if (slackEvent.type === 'url_verification') {
      return NextResponse.json({ challenge: slackEvent.challenge });
    }

    // イベントタイプの確認
    if (slackEvent.event && slackEvent.event.type) {
      // メッセージイベントの処理
      if (slackEvent.event.type === 'message' && !slackEvent.event.subtype) {
        const messageEvent = slackEvent.event;

        // タスクデータを抽出
        const taskData = extractTaskFromSlackMessage(messageEvent);

        // Firestoreにタスクを保存
        const tasksRef = collection(db, 'tasks');
        await addDoc(tasksRef, {
          userId,
          title: taskData.title,
          description: taskData.description,
          blockId: null, // ブロックは未割り当て
          date: null, // 日付は未割り当て
          status: 'open',
          createdAt: serverTimestamp(),
          source: taskData.source,
        });

        // 成功レスポンス
        return NextResponse.json({ success: true });
      }

      // リアクションイベントの処理（今後実装）
      if (slackEvent.event.type === 'reaction_added') {
        // リアクションに基づくタスク作成ロジック
        // 現時点では未実装
        return NextResponse.json(
          { message: 'リアクションイベントは現在実装中です' },
          { status: 200 }
        );
      }
    }

    // サポートされていないイベントタイプ
    return NextResponse.json(
      {
        message: 'イベントは処理されましたが、アクションは実行されませんでした',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Slack webhook処理エラー:', error);
    return NextResponse.json({ error: '内部サーバーエラー' }, { status: 500 });
  }
}

// URL検証用のGETリクエスト
export async function GET() {
  return NextResponse.json({
    message: 'Slack連携APIエンドポイントは正常に動作しています',
  });
}
