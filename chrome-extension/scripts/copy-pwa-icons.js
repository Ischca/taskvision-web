const fs = require('fs');
const path = require('path');

// パス設定
const rootDir = path.resolve(__dirname, '../../');
const pwaIconsDir = path.join(rootDir, 'web/public/icons');
const extensionIconsDir = path.join(__dirname, '../public/icons');

// 必要なディレクトリがあるか確認
if (!fs.existsSync(extensionIconsDir)) {
  fs.mkdirSync(extensionIconsDir, { recursive: true });
}

console.log('PWAアイコンをChrome拡張機能用にコピーしています...');

// PWAのアイコンマッピング
const iconMapping = [
  {
    src: 'manifest-icon-192.maskable.png',
    dest: 'icon128.png'
  },
  {
    src: 'manifest-icon-192.maskable.png',
    dest: 'icon48.png'
  },
  {
    src: 'manifest-icon-192.maskable.png',
    dest: 'icon16.png'
  }
];

// アイコンをコピー
let success = true;
iconMapping.forEach(({ src, dest }) => {
  const srcPath = path.join(pwaIconsDir, src);
  const destPath = path.join(extensionIconsDir, dest);
  
  try {
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ ${src} を ${dest} としてコピーしました`);
    } else {
      console.error(`❌ ソースアイコン ${src} が見つかりませんでした`);
      success = false;
    }
  } catch (error) {
    console.error(`❌ ${src} の ${dest} へのコピーに失敗しました:`, error.message);
    success = false;
  }
});

if (success) {
  console.log('PWAアイコンのコピーが完了しました！');
} else {
  console.log('一部のアイコンコピーに失敗しました。既存のアイコンは保持されます。');
} 