import { NextRequest, NextResponse } from 'next/server';
import { verifySlackRequestSignature } from '@/lib/integrations/slackIntegration';
import { processSlackEvent } from '@/lib/integrations/slackEventProcessor';
import { getUserByWebhookToken } from '@/lib/integrations/integrationUtils';
import { getIntegrationByType } from '@/lib/integrations/integrationUtils';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // リクエストのボディを取得
    const body = await request.json();
    const rawBody = await request.text();

    // URLからユーザーIDとトークンを抽出
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const webhookToken = url.searchParams.get('token');

    if (!userId || !webhookToken) {
      logger.error('Slack webhook: Missing userId or token');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // ユーザー認証
    const user = await getUserByWebhookToken(userId, webhookToken, 'slack');
    if (!user) {
      logger.error(`Slack webhook: Invalid webhook token for user ${userId}`);
      return NextResponse.json(
        { error: 'Invalid webhook token' },
        { status: 401 }
      );
    }

    // Slack連携設定を取得
    const integration = await getIntegrationByType(userId, 'slack');
    if (!integration || !integration.isActive) {
      logger.error(
        `Slack webhook: Integration not found or inactive for user ${userId}`
      );
      return NextResponse.json(
        { error: 'Integration not found or inactive' },
        { status: 404 }
      );
    }

    // Slackからのリクエスト検証
    const slackSignature = request.headers.get('x-slack-signature');
    const slackTimestamp = request.headers.get('x-slack-request-timestamp');

    if (!slackSignature || !slackTimestamp) {
      logger.error('Slack webhook: Missing Slack signature headers');
      return NextResponse.json(
        { error: 'Missing Slack signature headers' },
        { status: 400 }
      );
    }

    // Slack Signing Secretを取得
    const signingSecret = process.env.SLACK_SIGNING_SECRET;
    if (!signingSecret) {
      logger.error('Slack webhook: SLACK_SIGNING_SECRET not configured');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // リクエスト検証
    const isValid = await verifySlackRequestSignature(
      signingSecret,
      slackSignature,
      slackTimestamp,
      rawBody
    );

    if (!isValid) {
      logger.error(
        `Slack webhook: Invalid request signature for user ${userId}`
      );
      return NextResponse.json(
        { error: 'Invalid request signature' },
        { status: 401 }
      );
    }

    // Slack URL検証チャレンジに応答
    if (body.type === 'url_verification') {
      logger.info('Slack webhook: Responding to URL verification challenge');
      return NextResponse.json({ challenge: body.challenge });
    }

    // イベント処理
    if (body.type === 'event_callback') {
      // バックグラウンドで非同期処理
      processSlackEvent(body, userId, integration).catch((error) => {
        logger.error('Error processing Slack event:', error);
      });

      // イベント受信確認を即時返す（Slackは3秒以内のレスポンスを要求）
      return NextResponse.json({ success: true });
    }

    // 未知のイベントタイプ
    logger.warn(`Slack webhook: Unknown event type - ${body.type}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Slack webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
