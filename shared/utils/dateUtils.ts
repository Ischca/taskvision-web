/**
 * 日付関連のユーティリティ関数
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
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(now.getDate()).padStart(2, '0')}`;

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
