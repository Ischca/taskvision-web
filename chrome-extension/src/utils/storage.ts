/**
 * Chrome拡張機能のストレージユーティリティ
 *
 * Chrome拡張機能では2種類のストレージを使用できます：
 * - sync: デバイス間で同期されるストレージ（容量制限あり）
 * - local: デバイスローカルのストレージ（より大きな容量）
 */

// ユーザー設定インターフェース
export interface UserSettings {
  enableContextMenu: boolean;
  defaultProjectId: string | null;
  notificationEnabled: boolean;
}

// デフォルト設定
export const defaultSettings: UserSettings = {
  enableContextMenu: true,
  defaultProjectId: null,
  notificationEnabled: true,
};

/**
 * 設定を保存する
 */
export const saveSettings = (settings: UserSettings): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ userSettings: settings }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

/**
 * 設定を取得する
 */
export const getSettings = (): Promise<UserSettings> => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('userSettings', (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.userSettings || defaultSettings);
      }
    });
  });
};

/**
 * 選択されたテキストを一時的に保存する
 */
export const saveSelectedText = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ selectedText: text }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

/**
 * 保存されたテキストを取得する
 */
export const getSelectedText = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('selectedText', (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.selectedText || '');
      }
    });
  });
};

/**
 * 現在のページURLを一時的に保存する
 */
export const saveCurrentUrl = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ currentUrl: url }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

/**
 * 保存されたURLを取得する
 */
export const getCurrentUrl = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('currentUrl', (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.currentUrl || '');
      }
    });
  });
};
