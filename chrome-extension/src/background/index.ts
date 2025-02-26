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
});

// コンテキストメニューのクリックイベントをハンドル
chrome.contextMenus.onClicked.addListener((info, tab) => {
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
  }
  return false;
});
