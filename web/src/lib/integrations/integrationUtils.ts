import { Integration, IntegrationType } from '@/types';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { encrypt, decrypt } from '@/lib/encryption';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

/**
 * 連携機能の共通ユーティリティ関数
 * このファイルは各種連携機能で共通して使用するユーティリティ関数を提供します。
 */

/**
 * ユーザーの連携設定を取得します
 */
export const getUserIntegrations = async (
  userId: string
): Promise<Integration[]> => {
  try {
    const integrationsRef = collection(db, 'integrations');
    const q = query(integrationsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const integrations: Integration[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Integration;
      integrations.push({
        ...data,
        id: doc.id,
      });
    });

    return integrations;
  } catch (error) {
    console.error('連携設定取得エラー:', error);
    throw error;
  }
};

/**
 * 特定タイプの連携設定を取得します
 */
export const getIntegrationByType = async (
  userId: string,
  type: IntegrationType
): Promise<Integration | null> => {
  try {
    const integrationsRef = collection(db, 'integrations');
    const q = query(
      integrationsRef,
      where('userId', '==', userId),
      where('type', '==', type)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      ...(doc.data() as Integration),
      id: doc.id,
    };
  } catch (error) {
    console.error('連携設定取得エラー:', error);
    throw error;
  }
};

/**
 * 連携設定を保存します
 */
export const saveIntegration = async (
  integration: Omit<Integration, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const integrationsRef = collection(db, 'integrations');

    // 既存の設定を確認
    const q = query(
      integrationsRef,
      where('userId', '==', integration.userId),
      where('type', '==', integration.type)
    );
    const querySnapshot = await getDocs(q);

    // 既存の設定がある場合は更新
    if (!querySnapshot.empty) {
      const existingDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'integrations', existingDoc.id), {
        ...integration,
      });
      return existingDoc.id;
    }

    // 新規設定の場合は追加
    const docRef = await addDoc(integrationsRef, {
      ...integration,
      createdAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error('連携設定保存エラー:', error);
    throw error;
  }
};

/**
 * 連携設定を削除します
 */
export const deleteIntegration = async (
  integrationId: string
): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'integrations', integrationId));
  } catch (error) {
    console.error('連携設定削除エラー:', error);
    throw error;
  }
};

/**
 * 連携設定を有効/無効に切り替えます
 */
export const toggleIntegrationStatus = async (
  integrationId: string,
  isActive: boolean
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'integrations', integrationId), {
      isActive,
    });
  } catch (error) {
    console.error('連携設定ステータス更新エラー:', error);
    throw error;
  }
};

/**
 * ウェブフックURLを生成します
 */
export const generateWebhookUrl = (
  type: IntegrationType,
  userId: string,
  token: string
): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://taskvision.app';

  switch (type) {
    case 'slack':
      return `${baseUrl}/api/integrations/slack-webhook?userId=${userId}&token=${token}`;
    case 'email':
      return `${baseUrl}/api/integrations/email-webhook?userId=${userId}&token=${token}`;
    case 'chrome_extension':
      return `${baseUrl}/api/integrations/chrome-extension?userId=${userId}&token=${token}`;
    default:
      throw new Error(`不明な連携タイプ: ${type}`);
  }
};

/**
 * セキュアなトークンを生成します
 */
export const generateSecureToken = (): string => {
  // 実際の実装ではcryptoモジュールを使用してランダムな文字列を生成します
  // このサンプルでは簡略化のためランダムな文字列を生成
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};
