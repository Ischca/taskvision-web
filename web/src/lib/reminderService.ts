import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  // updateDoc, // 未使用なのでコメントアウト
  addDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { Task, Block, Reminder, ReminderType } from '@/types';

// ブラウザ通知のパーミッション要求
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// 通知のオプションインターフェース拡張
interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

// 通知を表示
export const showNotification = (
  title: string,
  options: ExtendedNotificationOptions = {}
) => {
  if (Notification.permission === 'granted') {
    // タイトル未指定の場合は「TaskVision」をデフォルトに
    const notificationTitle = title || 'TaskVision';

    // オプションのデフォルト値
    const defaultOptions: ExtendedNotificationOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      ...options,
    };

    try {
      new Notification(notificationTitle, defaultOptions);
    } catch (error) {
      console.error('通知の表示に失敗しました:', error);
    }
  }
};

// リマインダーを作成
export const createReminder = async (
  taskId: string,
  type: ReminderType,
  time: Date,
  blockId?: string
): Promise<string | null> => {
  try {
    const taskDoc = await getDoc(doc(db, 'tasks', taskId));
    if (!taskDoc.exists()) {
      console.error('タスクが見つかりません');
      return null;
    }

    const task = taskDoc.data() as Task;
    let message = '';

    switch (type) {
      case 'block_start':
        // ブロック名は別途取得
        const blockName = blockId ? await getBlockName(blockId) : '未設定';
        message = `ブロック「${blockName}」が間もなく始まります。タスク「${task.title}」の準備をしましょう。`;
        break;
      case 'block_end':
        // ブロック名は別途取得
        const endBlockName = blockId ? await getBlockName(blockId) : '未設定';
        message = `ブロック「${endBlockName}」が間もなく終了します。タスク「${task.title}」は完了しましたか？`;
        break;
      case 'task_deadline':
        message = `タスク「${task.title}」の締切時間が近づいています。`;
        break;
    }

    // blockIdが未定義の場合は除外する
    const reminderData: Omit<Reminder, 'id'> = {
      taskId,
      type,
      time: time.toISOString(),
      message,
      isEnabled: true,
      minutesBefore: 0, // 実際の分数は計算して設定
    };

    // blockIdが定義されている場合のみ追加
    if (blockId) {
      reminderData.blockId = blockId;
    }

    const docRef = await addDoc(collection(db, 'reminders'), reminderData);
    return docRef.id;
  } catch (error) {
    console.error('リマインダーの作成に失敗しました:', error);
    return null;
  }
};

// ブロック名を取得する関数
const getBlockName = async (blockId: string): Promise<string> => {
  try {
    const blockDoc = await getDoc(doc(db, 'blocks', blockId));
    if (blockDoc.exists()) {
      const block = blockDoc.data() as Block;
      return block.name || '未設定';
    }
    return '未設定';
  } catch (error) {
    console.error('ブロック名の取得に失敗しました:', error);
    return '未設定';
  }
};

// タスクのリマインダーを更新（設定変更時）
export const updateTaskReminders = async (task: Task): Promise<void> => {
  try {
    // 現在のタスクに関連するリマインダーをすべて削除
    const remindersQuery = query(
      collection(db, 'reminders'),
      where('taskId', '==', task.id)
    );
    const remindersSnapshot = await getDocs(remindersQuery);

    // 既存のリマインダーを削除
    const deletePromises = remindersSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);

    // リマインダー設定が有効でない場合は終了
    if (!task.reminderSettings) return;

    const {
      enableBlockStartReminder,
      blockStartReminderMinutes,
      enableBlockEndReminder,
      blockEndReminderMinutes,
      enableDeadlineReminder,
      deadlineReminderMinutes,
    } = task.reminderSettings;

    const now = new Date();
    const promises: Promise<string | null>[] = [];

    // タスクがブロックに割り当てられている場合
    if (task.blockId) {
      // ブロック情報を取得
      const blockDoc = await getDoc(doc(db, 'blocks', task.blockId));
      if (blockDoc.exists()) {
        const block = blockDoc.data() as Block;

        // ブロック開始リマインダー
        if (enableBlockStartReminder && block.startTime) {
          const [hours, minutes] = block.startTime.split(':').map(Number);

          // 日付部分を今日または指定された日付に設定
          const startDate = task.date ? new Date(task.date) : new Date();
          startDate.setHours(hours, minutes, 0, 0);

          // リマインダー時間を計算（分前）
          const reminderTime = new Date(startDate);
          reminderTime.setMinutes(
            reminderTime.getMinutes() - blockStartReminderMinutes
          );

          // 現在時刻より後の場合のみリマインダーを作成
          if (reminderTime > now) {
            promises.push(
              createReminder(task.id, 'block_start', reminderTime, task.blockId)
            );
          }
        }

        // ブロック終了リマインダー
        if (enableBlockEndReminder && block.endTime) {
          const [hours, minutes] = block.endTime.split(':').map(Number);

          // 日付部分を今日または指定された日付に設定
          const endDate = task.date ? new Date(task.date) : new Date();
          endDate.setHours(hours, minutes, 0, 0);

          // リマインダー時間を計算（分前）
          const reminderTime = new Date(endDate);
          reminderTime.setMinutes(
            reminderTime.getMinutes() - blockEndReminderMinutes
          );

          // 現在時刻より後の場合のみリマインダーを作成
          if (reminderTime > now) {
            promises.push(
              createReminder(task.id, 'block_end', reminderTime, task.blockId)
            );
          }
        }
      }
    }

    // タスク締切リマインダー
    if (enableDeadlineReminder && task.deadline) {
      const deadlineDate = new Date(task.deadline);

      // リマインダー時間を計算（分前）
      const reminderTime = new Date(deadlineDate);
      reminderTime.setMinutes(
        reminderTime.getMinutes() - deadlineReminderMinutes
      );

      // 現在時刻より後の場合のみリマインダーを作成
      if (reminderTime > now) {
        promises.push(createReminder(task.id, 'task_deadline', reminderTime));
      }
    }

    // すべてのリマインダー作成を待つ
    await Promise.all(promises);
  } catch (error) {
    console.error('リマインダーの更新に失敗しました:', error);
  }
};

// リマインダーチェック（アプリ起動時や定期的に実行）
export const checkReminders = async (userId: string): Promise<void> => {
  try {
    // ユーザーのタスクを取得
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);

    // 各タスクのリマインダーを更新
    const updatePromises = tasksSnapshot.docs.map((doc) => {
      const task = { id: doc.id, ...doc.data() } as Task;
      return updateTaskReminders(task);
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('リマインダーチェック中にエラーが発生しました:', error);
  }
};

// リマインダータイマーを開始
export const startReminderTimer = (userId: string): NodeJS.Timeout => {
  // 初回実行
  requestNotificationPermission().then((granted) => {
    if (granted) {
      checkReminders(userId);
    } else {
      console.error('通知の許可が得られませんでした');
    }
  });

  // 定期的に実行（15分ごと）
  const timerId = setInterval(() => {
    if (Notification.permission === 'granted') {
      checkReminders(userId);
    }
  }, 15 * 60 * 1000);

  return timerId;
};

// リマインダータイマーを停止
export const stopReminderTimer = (timerId: NodeJS.Timeout): void => {
  clearInterval(timerId);
};

// リマインダーのローカル処理（Firebaseのコストを抑えるため）
export const setupLocalReminders = (task: Task): void => {
  if (!task.reminderSettings) return;

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    enableBlockStartReminder,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    blockStartReminderMinutes,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    enableBlockEndReminder,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    blockEndReminderMinutes,
    enableDeadlineReminder,
    deadlineReminderMinutes,
  } = task.reminderSettings;

  // 既存のタイマーをクリア（タスクIDベースでローカルストレージに保存されたタイマーID）
  const existingTimerIdsStr = localStorage.getItem(
    `reminder_timers_${task.id}`
  );
  if (existingTimerIdsStr) {
    const existingTimerIds = JSON.parse(existingTimerIdsStr);
    existingTimerIds.forEach((id: number) => window.clearTimeout(id));
  }

  const newTimerIds: number[] = [];
  const now = new Date().getTime();

  // 締切リマインダー
  if (enableDeadlineReminder && task.deadline) {
    const deadlineTime = new Date(task.deadline).getTime();
    const reminderTime = deadlineTime - deadlineReminderMinutes * 60 * 1000;

    if (reminderTime > now) {
      const timeoutId = window.setTimeout(() => {
        showNotification('タスク締切リマインダー', {
          body: `タスク「${task.title}」の締切時間が近づいています。`,
          tag: `deadline_${task.id}`,
        });
      }, reminderTime - now);

      newTimerIds.push(timeoutId);
    }
  }

  // タイマーIDをローカルストレージに保存
  if (newTimerIds.length > 0) {
    localStorage.setItem(
      `reminder_timers_${task.id}`,
      JSON.stringify(newTimerIds)
    );
  } else {
    localStorage.removeItem(`reminder_timers_${task.id}`);
  }
};
