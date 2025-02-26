import { createTask } from '@/lib/tasks';
import { logger } from '@/lib/logger';
import { SlackEvent, SlackMessageEvent, SlackReactionEvent } from '@/types';

/**
 * Slackイベントを処理する関数
 *
 * @param eventData Slackから受信したイベントデータ
 * @param userId ユーザーID
 * @param integration Slack連携設定
 */
export async function processSlackEvent(
  eventData: SlackEvent,
  userId: string,
  integration: any
): Promise<void> {
  try {
    const event = eventData.event;

    if (!event) {
      logger.warn('Invalid Slack event data: No event object');
      return;
    }

    // 監視対象のチャンネルが指定されている場合、そのチャンネルのイベントのみを処理
    if (
      integration.channels &&
      integration.channels.length > 0 &&
      event.channel &&
      !integration.channels.includes(event.channel)
    ) {
      logger.debug(`Slack event from non-monitored channel: ${event.channel}`);
      return;
    }

    // イベントタイプに応じた処理
    switch (event.type) {
      case 'reaction_added':
        await handleReactionAddedEvent(
          event as SlackReactionEvent,
          userId,
          integration
        );
        break;

      case 'message':
        await handleMessageEvent(
          event as SlackMessageEvent,
          userId,
          integration
        );
        break;

      default:
        logger.debug(`Unhandled Slack event type: ${event.type}`);
        break;
    }
  } catch (error) {
    logger.error('Error processing Slack event:', error);
    throw error;
  }
}

/**
 * メッセージにリアクションが追加されたイベントを処理
 */
async function handleReactionAddedEvent(
  event: SlackReactionEvent,
  userId: string,
  integration: any
): Promise<void> {
  try {
    // 設定されたトリガーリアクションかチェック
    const triggerReactions = integration.triggerReactions || [
      'white_check_mark',
      'check',
    ];

    if (!triggerReactions.includes(event.reaction)) {
      logger.debug(`Non-trigger reaction: ${event.reaction}`);
      return;
    }

    if (event.item.type !== 'message') {
      logger.debug(`Reaction added to non-message item: ${event.item.type}`);
      return;
    }

    // メッセージ情報を取得
    const messageInfo = await fetchMessageInfo(
      integration.authToken,
      event.item.channel,
      event.item.ts
    );

    if (!messageInfo) {
      logger.error('Failed to fetch message info');
      return;
    }

    // タスク作成
    await createTaskFromSlackMessage(
      userId,
      messageInfo.text,
      messageInfo.user,
      event.item.channel,
      event.item.ts,
      messageInfo.permalink
    );

    logger.info(
      `Created task from Slack message with reaction: ${event.reaction}`
    );
  } catch (error) {
    logger.error('Error handling reaction_added event:', error);
    throw error;
  }
}

/**
 * メッセージイベントを処理
 */
async function handleMessageEvent(
  event: SlackMessageEvent,
  userId: string,
  integration: any
): Promise<void> {
  try {
    // メッセージにタスク作成のキーワードやマーカーがあるかチェック
    const taskMarkers = integration.taskMarkers || ['#task', '#TODO'];

    if (!event.text) {
      return;
    }

    const hasTaskMarker = taskMarkers.some(
      (marker) => event.text && event.text.includes(marker)
    );

    if (!hasTaskMarker) {
      return;
    }

    // メッセージのパーマリンクを取得
    const permalink = await getMessagePermalink(
      integration.authToken,
      event.channel,
      event.ts
    );

    // タスク作成
    await createTaskFromSlackMessage(
      userId,
      event.text,
      event.user,
      event.channel,
      event.ts,
      permalink
    );

    logger.info(`Created task from Slack message with task marker`);
  } catch (error) {
    logger.error('Error handling message event:', error);
    throw error;
  }
}

/**
 * Slackメッセージからタスクを作成
 */
async function createTaskFromSlackMessage(
  userId: string,
  messageText: string,
  slackUserId: string,
  channelId: string,
  messageTs: string,
  permalink?: string
): Promise<void> {
  try {
    // タスクタイトルの作成（長いメッセージは省略）
    const title =
      messageText.length > 100
        ? `${messageText.substring(0, 97)}...`
        : messageText;

    // タスク説明の作成
    let description = messageText;

    if (permalink) {
      description += `\n\n---\n[Slackの元メッセージを表示](${permalink})`;
    }

    // Slackユーザー情報を取得
    let assignee = null;
    try {
      const userInfo = await fetchSlackUserInfo(slackUserId);
      if (userInfo) {
        description += `\n\nSlackユーザー: ${userInfo.name} (${userInfo.real_name})`;
      }
    } catch (err) {
      logger.warn(`Could not fetch Slack user info for ${slackUserId}`, err);
    }

    // タスク作成
    await createTask({
      title,
      description,
      userId,
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      assignee,
      source: {
        type: 'slack',
        channelId,
        messageTs,
        permalink,
      },
    });
  } catch (error) {
    logger.error('Error creating task from Slack message:', error);
    throw error;
  }
}

/**
 * Slackメッセージの情報を取得
 */
async function fetchMessageInfo(
  token: string,
  channelId: string,
  messageTs: string
): Promise<{ text: string; user: string; permalink: string } | null> {
  try {
    // conversations.history APIを呼び出してメッセージを取得
    const response = await fetch(
      'https://slack.com/api/conversations.history',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          channel: channelId,
          latest: messageTs,
          inclusive: true,
          limit: 1,
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      logger.error(`Slack API error: ${data.error}`);
      return null;
    }

    const message = data.messages?.[0];
    if (!message) {
      logger.error('No message found');
      return null;
    }

    // メッセージのパーマリンクを取得
    const permalink = await getMessagePermalink(token, channelId, messageTs);

    return {
      text: message.text,
      user: message.user,
      permalink: permalink || '',
    };
  } catch (error) {
    logger.error('Error fetching message info:', error);
    return null;
  }
}

/**
 * メッセージのパーマリンクを取得
 */
async function getMessagePermalink(
  token: string,
  channelId: string,
  messageTs: string
): Promise<string | null> {
  try {
    const response = await fetch('https://slack.com/api/chat.getPermalink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        channel: channelId,
        message_ts: messageTs,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      logger.error(`Slack API error: ${data.error}`);
      return null;
    }

    return data.permalink || null;
  } catch (error) {
    logger.error('Error getting message permalink:', error);
    return null;
  }
}

/**
 * Slackユーザー情報を取得
 */
async function fetchSlackUserInfo(
  token: string,
  userId: string
): Promise<{ id: string; name: string; real_name: string } | null> {
  try {
    const response = await fetch('https://slack.com/api/users.info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user: userId,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      logger.error(`Slack API error: ${data.error}`);
      return null;
    }

    return {
      id: data.user.id,
      name: data.user.name,
      real_name: data.user.real_name || data.user.name,
    };
  } catch (error) {
    logger.error('Error fetching user info:', error);
    return null;
  }
}
