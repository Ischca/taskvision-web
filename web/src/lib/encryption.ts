import crypto from 'crypto';
import { logger } from '@/lib/logger';

// 環境変数から暗号化キーを取得
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || 'defaultdevelopmentkey0123456789abcdef';
const ENCRYPTION_IV_LENGTH = 16;
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

/**
 * 文字列を暗号化
 * @param text 暗号化する文字列
 * @returns 暗号化された文字列（Base64エンコード）
 */
export function encrypt(text: string): string {
  try {
    // 初期化ベクトル（IV）を生成
    const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);

    // 鍵を32バイトに生成（AES-256の要件）
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

    // 暗号化
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // IVと暗号化されたテキストを結合
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    logger.error('暗号化エラー:', error);
    throw new Error('暗号化に失敗しました');
  }
}

/**
 * 文字列を復号化
 * @param encryptedText 暗号化された文字列（Base64エンコード）
 * @returns 復号化された文字列
 */
export function decrypt(encryptedText: string): string {
  try {
    // IVと暗号テキストを分離
    const textParts = encryptedText.split(':');
    if (textParts.length !== 2) {
      throw new Error('暗号化テキストのフォーマットが不正です');
    }

    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedData = textParts[1];

    // 鍵を32バイトに生成（AES-256の要件）
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

    // 復号化
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error('復号化エラー:', error);
    throw new Error('復号化に失敗しました');
  }
}

/**
 * PBKDFを使用したより安全なパスワードハッシュ
 * @param password ハッシュ化するパスワード
 * @param salt ソルト（省略時は新しく生成）
 * @returns {hash, salt} ハッシュとソルト
 */
export function hashPassword(
  password: string,
  salt?: string
): { hash: string; salt: string } {
  try {
    // ソルトが指定されていなければ新しく生成
    const usedSalt = salt || crypto.randomBytes(16).toString('hex');

    // PBKDF2でハッシュ化（10万回反復）
    const hash = crypto
      .pbkdf2Sync(password, usedSalt, 100000, 64, 'sha512')
      .toString('hex');

    return { hash, salt: usedSalt };
  } catch (error) {
    logger.error('パスワードハッシュ化エラー:', error);
    throw new Error('パスワードのハッシュ化に失敗しました');
  }
}

/**
 * パスワードの検証
 * @param password 検証するパスワード
 * @param hash 保存されているハッシュ
 * @param salt 保存されているソルト
 * @returns 検証結果（true/false）
 */
export function verifyPassword(
  password: string,
  hash: string,
  salt: string
): boolean {
  try {
    const hashVerify = hashPassword(password, salt);
    return crypto.timingSafeEqual(
      Buffer.from(hashVerify.hash, 'hex'),
      Buffer.from(hash, 'hex')
    );
  } catch (error) {
    logger.error('パスワード検証エラー:', error);
    return false;
  }
}
