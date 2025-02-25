import { Task, RepeatSettings, RepeatType } from '@/types';
import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

/**
 * 繰り返しタスクのインスタンスを生成する
 * @param parentTask 親タスク
 * @param startDate 開始日
 * @param endDate 終了日
 */
export async function generateRepeatTaskInstances(
  parentTask: Task,
  startDate: Date,
  endDate: Date
): Promise<void> {
  // 繰り返し設定が有効でない場合は何もしない
  if (!parentTask.repeatSettings?.enabled) return;

  // 指定された日付範囲内の繰り返し日を取得
  const repeatDates = getRepeatDates(
    parentTask.repeatSettings,
    startDate,
    endDate
  );

  // 各日付に対してタスクインスタンスを作成
  for (const date of repeatDates) {
    // 例外かどうかをチェック
    const exceptionInfo = checkIfDateIsException(
      date,
      parentTask.repeatSettings.exceptions
    );

    // スキップする例外の場合は作成しない
    if (exceptionInfo && exceptionInfo.action === 'skip') continue;

    // 日付フォーマット（YYYY-MM-DD）を用意
    const dateStr = date.toISOString().split('T')[0];

    // 親タスクからコピーしたタスクを作成
    const taskInstance: Partial<Task> = {
      userId: parentTask.userId,
      title: parentTask.title,
      description: parentTask.description,
      blockId: exceptionInfo?.newBlockId || parentTask.blockId,
      date: dateStr,
      status: 'open',
      createdAt: serverTimestamp() as any,
      deadline: parentTask.deadline,
      reminderSettings: parentTask.reminderSettings,
      parentTaskId: parentTask.id,
      // 繰り返しインスタンスには繰り返し設定を持たせない
    };

    // Firestoreに追加
    await addDoc(collection(db, 'tasks'), taskInstance);
  }
}

/**
 * 指定された繰り返し設定に基づいて、日付範囲内の繰り返し日を取得する
 * @param repeatSettings 繰り返し設定
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns 繰り返し日の配列
 */
export function getRepeatDates(
  repeatSettings: RepeatSettings,
  startDate: Date,
  endDate: Date
): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  // 終了日が設定されている場合は、endDateと設定された終了日のうち早い方を使用
  let effectiveEndDate = new Date(endDate);
  if (repeatSettings.endType === 'on_date' && repeatSettings.endDate) {
    const settingsEndDate = new Date(repeatSettings.endDate);
    if (settingsEndDate < effectiveEndDate) {
      effectiveEndDate = settingsEndDate;
    }
  }

  // 回数制限の場合の追跡用
  let occurrenceCount = 0;
  const maxOccurrences =
    repeatSettings.endType === 'after'
      ? repeatSettings.occurrences || 10
      : Number.MAX_SAFE_INTEGER;

  // 日付範囲内を探索
  while (currentDate <= effectiveEndDate && occurrenceCount < maxOccurrences) {
    if (isDateMatchingPattern(currentDate, repeatSettings)) {
      dates.push(new Date(currentDate));
      occurrenceCount++;
    }

    // 日付を1日進める
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * 指定された日付が繰り返しパターンに一致するかどうかを判定する
 * @param date 確認する日付
 * @param settings 繰り返し設定
 * @returns 一致する場合はtrue
 */
function isDateMatchingPattern(date: Date, settings: RepeatSettings): boolean {
  const dayOfWeek = date.getDay(); // 0=日曜, 1=月曜, ..., 6=土曜
  const dayOfMonth = date.getDate(); // 1-31

  switch (settings.type) {
    case 'daily':
      // 指定された頻度ごとに日を繰り返す
      const baseDate = new Date();
      baseDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays % (settings.frequency || 1) === 0;

    case 'weekdays':
      // 平日のみ（月〜金）
      return dayOfWeek >= 1 && dayOfWeek <= 5;

    case 'weekly':
      // 指定された曜日に繰り返す
      return settings.daysOfWeek?.includes(dayOfWeek) || false;

    case 'monthly':
      // 毎月の指定された日に繰り返す
      return dayOfMonth === (settings.dayOfMonth || 1);

    case 'custom':
      // カスタム頻度（日数）で繰り返す
      const customBaseDate = new Date();
      customBaseDate.setHours(0, 0, 0, 0);
      const customDiffDays = Math.floor(
        (date.getTime() - customBaseDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return customDiffDays % (settings.frequency || 1) === 0;

    default:
      return false;
  }
}

/**
 * 指定された日付が例外かどうかを確認する
 * @param date チェックする日付
 * @param exceptions 例外リスト
 * @returns 例外情報（例外でない場合はnull）
 */
export function checkIfDateIsException(
  date: Date,
  exceptions?: RepeatException[]
): RepeatException | null {
  if (!exceptions || exceptions.length === 0) return null;

  const dateStr = date.toISOString().split('T')[0];

  return exceptions.find((ex) => ex.originalDate === dateStr) || null;
}

/**
 * 繰り返しタスクに例外を追加する
 * @param taskId タスクID
 * @param originalDate 元の日付
 * @param action アクション（skip/reschedule）
 * @param newDate 新しい日付（rescheduledの場合）
 * @param newBlockId 新しいブロックID（オプション）
 */
export async function addRepeatException(
  taskId: string,
  originalDate: string,
  action: 'skip' | 'reschedule',
  newDate?: string,
  newBlockId?: string
): Promise<void> {
  try {
    // タスクの取得
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('id', '==', taskId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Task not found');
    }

    const taskDoc = snapshot.docs[0];
    const taskData = taskDoc.data() as Task;
    const repeatSettings = taskData.repeatSettings;

    if (!repeatSettings) {
      throw new Error('Task has no repeat settings');
    }

    // 例外リストの初期化
    if (!repeatSettings.exceptions) {
      repeatSettings.exceptions = [];
    }

    // 例外の作成
    const exception: RepeatException = {
      originalDate,
      action,
    };

    // リスケジュールの場合は新しい日付を設定
    if (action === 'reschedule' && newDate) {
      exception.newDate = newDate;
      exception.newBlockId = newBlockId;
    }

    // 既存の例外を更新または新しい例外を追加
    const existingIndex = repeatSettings.exceptions.findIndex(
      (ex) => ex.originalDate === originalDate
    );

    if (existingIndex >= 0) {
      repeatSettings.exceptions[existingIndex] = exception;
    } else {
      repeatSettings.exceptions.push(exception);
    }

    // ドキュメントを更新
    await updateDoc(taskDoc.ref, {
      repeatSettings,
    });
  } catch (error) {
    console.error('Error adding repeat exception:', error);
    throw error;
  }
}

/**
 * ユーザーの繰り返しタスクをチェックし、必要に応じて次のインスタンスを生成する
 * @param userId ユーザーID
 */
export async function checkAndGenerateNextRepeatTasks(
  userId: string
): Promise<void> {
  try {
    // 繰り返し設定を持つタスクを取得
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', userId),
      where('repeatSettings.enabled', '==', true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    // 現在の日付から2週間先まで
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14); // 2週間後

    // 各繰り返しタスクに対して処理
    for (const doc of snapshot.docs) {
      const task = { id: doc.id, ...doc.data() } as Task;
      await generateRepeatTaskInstances(task, startDate, endDate);
    }
  } catch (error) {
    console.error('Error checking and generating repeat tasks:', error);
  }
}
