// ページ内で選択されたテキストを取得するためのコンテンツスクリプト

// メッセージリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    const selectedText = window.getSelection()?.toString() || '';
    sendResponse({ text: selectedText });
  }

  if (request.action === 'getPageMetadata') {
    const metadata = {
      title: document.title,
      url: window.location.href,
      faviconUrl: getFaviconUrl(),
      description: getMetaDescription(),
    };
    sendResponse({ metadata });
  }
});

// ファビコンURLを取得
function getFaviconUrl(): string {
  const link =
    document.querySelector('link[rel="icon"]') ||
    document.querySelector('link[rel="shortcut icon"]');

  if (link && link.getAttribute('href')) {
    const faviconUrl = link.getAttribute('href') || '';
    if (faviconUrl.startsWith('http')) {
      return faviconUrl;
    } else {
      return new URL(faviconUrl, window.location.origin).href;
    }
  }

  return window.location.origin + '/favicon.ico';
}

// メタディスクリプションを取得
function getMetaDescription(): string {
  const metaDesc = document.querySelector('meta[name="description"]');
  return metaDesc ? metaDesc.getAttribute('content') || '' : '';
}
