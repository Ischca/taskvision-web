// 型定義のエクスポート
export * from './dist/types';

// 日付ユーティリティ関数
export declare function formatDate(date: Date): string;
export declare function parseDate(dateStr: string): Date;
export declare function isDatePast(dateStr: string | null): boolean;
export declare function isToday(dateStr: string | null): boolean;
export declare function getDaysDiff(dateStr1: string, dateStr2: string): number;

// タスク関連のユーティリティ関数
import { Task, TaskSource } from './dist/types';
export declare function getSourceLabel(source?: TaskSource): string;
export declare function isTaskOverdue(task: Task): boolean;
export declare function suggestPriority(
  source: TaskSource | undefined
): 'high' | 'medium' | 'low';
export declare function completeTask(task: Task): Task;
export declare function reopenTask(task: Task): Task;
