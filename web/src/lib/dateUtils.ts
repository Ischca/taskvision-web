/**
 * 日付関連のユーティリティ関数
 *
 * このファイルはshared/utils/dateUtils.tsの内容を反映したものです。
 * アプリケーション全体で日付処理を統一するために使用してください。
 */

/**
 * 日付をYYYY-MM-DD形式にフォーマットする
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD形式の日付文字列からDateオブジェクトを作成
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * 日付が期限切れかどうかをチェック
 */
export function isDatePast(dateStr: string | null): boolean {
  if (!dateStr) return false;

  const now = new Date();
  now.setHours(0, 0, 0, 0); // 時間部分をリセット
  const date = new Date(dateStr);

  return date < now;
}

/**
 * 日付が今日かどうかをチェック
 */
export function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;

  const now = new Date();
  const today = formatDate(now);

  return dateStr === today;
}

/**
 * 日付の差分を日数で取得
 */
export function getDaysDiff(dateStr1: string, dateStr2: string): number {
  const date1 = new Date(dateStr1);
  const date2 = new Date(dateStr2);

  // 時間部分をリセット
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);

  // ミリ秒の差分を日数に変換
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * 二つの日付が同じかどうかをチェック（年月日のみを比較）
 */
export function isSameDate(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 日付の月範囲（月の最初の日と最後の日）を取得
 */
export function getMonthRange(date: Date): { firstDay: Date; lastDay: Date } {
  const year = date.getFullYear();
  const month = date.getMonth();

  // 月の最初の日
  const firstDay = new Date(year, month, 1);

  // 月の最後の日（翌月の0日 = 当月の最終日）
  const lastDay = new Date(year, month + 1, 0);

  return { firstDay, lastDay };
}

/**
 * 日付の文字列比較を安全に行う（Date型に変換して比較）
 */
export function compareDates(
  dateStr1: string | null,
  dateStr2: string | null
): number {
  // null値の処理
  if (dateStr1 === null && dateStr2 === null) return 0;
  if (dateStr1 === null) return -1;
  if (dateStr2 === null) return 1;

  const date1 = new Date(dateStr1);
  const date2 = new Date(dateStr2);

  return date1.getTime() - date2.getTime();
}
