const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// 設定
const distDir = path.resolve(__dirname, '../dist');
const pemFile = path.resolve(__dirname, '../key.pem');
const crxFile = path.resolve(__dirname, '../taskvision-chrome-extension.crx');

// 必要なディレクトリがあるか確認
if (!fs.existsSync(distDir)) {
  console.error('エラー: distディレクトリが見つかりません。先にビルドを実行してください。');
  process.exit(1);
}

console.log('Chrome拡張機能パッケージ（CRX）を作成しています...');

// 秘密鍵が存在しない場合は生成
if (!fs.existsSync(pemFile)) {
  console.log('秘密鍵が見つからないため、新しい鍵を生成します...');
  try {
    execSync(`openssl genrsa -out "${pemFile}" 2048`);
    console.log('✅ 秘密鍵を生成しました');
  } catch (error) {
    console.error('❌ 秘密鍵の生成に失敗しました:', error.message);
    process.exit(1);
  }
}

// Chromeの実行ファイルパスを決定する関数
function getChromeExecutablePath() {
  const platform = os.platform();
  
  switch (platform) {
    case 'win32':
      // Windowsでは、通常以下のパスにChromeがインストールされている
      return '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"';
    case 'darwin':
      // macOSでは、通常以下のパスにChromeがインストールされている
      return '"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"';
    case 'linux':
      // Linuxでは、通常以下のコマンドでChromeを実行できる
      return 'google-chrome';
    default:
      console.warn(`警告: 未知のプラットフォーム ${platform} です。デフォルトの 'chrome' コマンドを使用します。`);
      return 'chrome';
  }
}

// Chrome拡張機能パッケージ（CRX）を作成
try {
  const chromePath = getChromeExecutablePath();
  console.log(`使用するChromeパス: ${chromePath}`);
  
  // CIモードかどうかを確認（環境変数で制御可能）
  const isCI = process.env.CI === 'true';
  
  // Chrome拡張機能ツールを使用してCRXファイルを作成
  console.log('Chromeを使用してCRXファイルを生成しています...');
  
  // --no-message-box フラグをCI環境で追加
  const noMessageBox = isCI ? '--no-message-box' : '';
  
  try {
    // 既存のCRXファイルがあれば削除
    if (fs.existsSync(crxFile)) {
      fs.unlinkSync(crxFile);
    }
    
    // Chromeコマンドラインでパッケージ化を実行
    execSync(`${chromePath} --pack-extension="${distDir}" --pack-extension-key="${pemFile}" ${noMessageBox}`);
    
    // Chromeが生成したdist.crxファイルをtaskvision-chrome-extension.crxにコピー
    const generatedCrxFile = distDir + '.crx';
    if (fs.existsSync(generatedCrxFile)) {
      fs.copyFileSync(generatedCrxFile, crxFile);
      console.log(`CRXファイルをコピーしました: ${generatedCrxFile} -> ${crxFile}`);
    }
    
    // 成功メッセージ
    console.log(`\n✅ CRXパッケージ生成が完了しました！`);
    console.log(`CRXファイルの場所: ${crxFile}`);
    
  } catch (error) {
    console.error('❌ Chromeでのパッケージ化に失敗しました:', error.message);
    console.log('代替方法として、ZIPファイルを生成します...');
    
    // 代替方法: ZIPファイルを作成
    console.log('拡張機能のZIPファイルを作成しています...');
    const zipFile = path.resolve(__dirname, '../taskvision-chrome-extension.zip');
    execSync(`cd "${distDir}" && zip -r "${zipFile}" *`);
    console.log(`✅ ZIPファイルが生成されました: ${zipFile}`);
  }
  
  // インストール方法のガイダンスを表示
  console.log('\n【重要】以下の方法で拡張機能をインストールできます：');
  console.log('1. Chrome Web Storeに公開する場合: ZIPまたはCRXファイルをアップロード');
  console.log('2. 開発者モードでのインストール: Chromeで chrome://extensions を開き、');
  console.log('   「パッケージ化されていない拡張機能を読み込む」から dist フォルダを選択');
  console.log('3. エンタープライズ配布: ポリシーを使用してサイドロードする\n');
  
  console.log('CI環境での使用方法:');
  console.log('  CI=true npm run package  # メッセージボックスを表示せずに実行');
  
} catch (error) {
  console.error('❌ パッケージの作成に失敗しました:', error.message);
  process.exit(1);
} 