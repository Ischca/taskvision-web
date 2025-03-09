// Firebase認証関連
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';

// ウェブアプリのURLを環境変数から取得
const webAppUrl =
  process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://task-vision.com';

// 認証状態を監視
let userAuthenticated = false;

// コンテキストメニューを設定
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'add-task',
    title: '選択テキストをTaskVisionタスクに追加',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'add-page',
    title: '現在のページをTaskVisionタスクに追加',
    contexts: ['page'],
  });

  // 認証状態の監視を開始
  startAuthStateObserver();
});

// 認証状態監視を開始
function startAuthStateObserver() {
  onAuthStateChanged(auth, (user) => {
    userAuthenticated = !!user;
  });
}

// コンテキストメニューのクリックイベントをハンドル
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // 未ログイン状態の場合はログインページにリダイレクト
  if (!userAuthenticated) {
    chrome.tabs.create({ url: `${webAppUrl}/login` });
    return;
  }

  if (info.menuItemId === 'add-task' && info.selectionText) {
    chrome.tabs.create({
      url:
        chrome.runtime.getURL('popup.html') +
        `?title=${encodeURIComponent(tab?.title || '')}` +
        `&url=${encodeURIComponent(tab?.url || '')}` +
        `&text=${encodeURIComponent(info.selectionText)}`,
    });
  } else if (info.menuItemId === 'add-page') {
    chrome.tabs.create({
      url:
        chrome.runtime.getURL('popup.html') +
        `?title=${encodeURIComponent(tab?.title || '')}` +
        `&url=${encodeURIComponent(tab?.url || '')}`,
    });
  }
});

// メッセージリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    // Manifest V3対応
    if (chrome.scripting && request.tabId) {
      chrome.scripting.executeScript(
        {
          target: { tabId: request.tabId },
          func: () => window.getSelection()?.toString() || '',
        },
        (results) => {
          if (chrome.runtime.lastError) {
            sendResponse({ error: chrome.runtime.lastError.message });
          } else {
            const text = results && results[0] ? results[0].result : '';
            sendResponse({ text });
          }
        }
      );
      return true; // 非同期レスポンスを示すために true を返す
    } else {
      // 後方互換性のため残す
      try {
        chrome.tabs.executeScript(
          {
            code: 'window.getSelection().toString();',
          },
          (selection) => {
            if (chrome.runtime.lastError) {
              sendResponse({ error: chrome.runtime.lastError.message });
            } else {
              sendResponse({
                text: selection && selection[0] ? selection[0] : '',
              });
            }
          }
        );
        return true; // 非同期レスポンスを示すために true を返す
      } catch (e) {
        sendResponse({ error: 'Script execution failed' });
        return false;
      }
    }
  } else if (request.action === 'checkAuthState') {
    // 認証状態を確認
    sendResponse({ authenticated: userAuthenticated });
    return false; // 同期レスポンス
  }
  return false;
});
