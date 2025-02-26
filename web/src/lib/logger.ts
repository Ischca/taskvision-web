/**
 * シンプルなロガーモジュール
 * 環境や設定に応じてログレベルを制御可能
 */

// ログレベルの定義
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// 環境変数からログレベルを取得（デフォルトはINFO）
const LOG_LEVEL =
  process.env.NODE_ENV === 'production'
    ? LogLevel.INFO
    : process.env.LOG_LEVEL
    ? parseInt(process.env.LOG_LEVEL, 10)
    : LogLevel.DEBUG;

// タイムスタンプフォーマット
const formatTimestamp = () => {
  return new Date().toISOString();
};

// ロガーインスタンス
export const logger = {
  /**
   * エラーログ
   * 重大なエラーや例外を記録
   */
  error: (message: string, ...args: any[]) => {
    if (LOG_LEVEL >= LogLevel.ERROR) {
      console.error(`[${formatTimestamp()}] [ERROR] ${message}`, ...args);
    }
  },

  /**
   * 警告ログ
   * 問題はあるが処理は継続可能な状況
   */
  warn: (message: string, ...args: any[]) => {
    if (LOG_LEVEL >= LogLevel.WARN) {
      console.warn(`[${formatTimestamp()}] [WARN] ${message}`, ...args);
    }
  },

  /**
   * 情報ログ
   * アプリケーションの主要な状態変化や重要なイベントを記録
   */
  info: (message: string, ...args: any[]) => {
    if (LOG_LEVEL >= LogLevel.INFO) {
      console.info(`[${formatTimestamp()}] [INFO] ${message}`, ...args);
    }
  },

  /**
   * デバッグログ
   * 開発時の詳細な情報
   */
  debug: (message: string, ...args: any[]) => {
    if (LOG_LEVEL >= LogLevel.DEBUG) {
      console.debug(`[${formatTimestamp()}] [DEBUG] ${message}`, ...args);
    }
  },

  /**
   * 現在のログレベルを取得
   */
  getLogLevel: () => LOG_LEVEL,
};

// 本番環境の場合は初期化時にログ設定を表示
if (process.env.NODE_ENV === 'production') {
  logger.info(`Logger initialized with level: ${LogLevel[LOG_LEVEL]}`);
}
