# TaskVision Chrome拡張機能

ウェブブラウジング中に簡単にタスクを追加・管理できるTaskVisionのChrome拡張機能です。

## 機能

- **ワンクリックでタスク追加**: ウェブページの内容を選択してタスクとして追加
- **コンテキストメニュー統合**: 右クリックメニューからTaskVisionにタスクを追加
- **設定カスタマイズ**: 個人の好みに合わせて拡張機能の動作を調整
- **Firebaseとの連携**: TaskVisionアカウントとシームレスに連携

## インストール

### 開発者モード

1. このリポジトリをクローンまたはダウンロードします
2. `chrome-extension` ディレクトリに移動し、必要な依存関係をインストールします：

```bash
cd chrome-extension
npm install
```

3. 拡張機能をビルドします：

```bash
npm run build
```

4. Chromeで `chrome://extensions` を開きます
5. 右上の「デベロッパーモード」をオンにします
6. 「パッケージ化されていない拡張機能を読み込む」をクリックし、`chrome-extension/dist` ディレクトリを選択します

### ビルドスクリプトを使用する（macOS/Linux）

自動ビルドスクリプトを実行して、拡張機能をビルドすることもできます：

```bash
./build.sh
```

このスクリプトは依存関係のインストール、リント、ビルド、ZIPファイルの作成を自動的に行います。

### パッケージ化（CRX生成）

拡張機能をCRXとしてパッケージ化するには、以下のコマンドを実行します：

```bash
npm run package
```

このコマンドは、Chromeを使用してCRXファイルを生成します。CRXファイルが生成できない場合は、ZIPファイルが代替として生成されます。

## 使用方法

1. TaskVisionアカウントでログインします（初回使用時）
2. ウェブページからテキストを選択し、右クリックして「TaskVisionにタスクとして追加」を選択します
3. または、拡張機能アイコンをクリックしてタスクを手動で追加します
4. 設定ページでコンテキストメニューや通知などの動作をカスタマイズできます

## 開発

### 開発モード

```bash
npm run start
```

このコマンドは開発サーバーを起動し、変更を監視します。拡張機能を `chrome://extensions` で読み込んだ後、ファイルに変更を加えるたびに拡張機能を更新できます。

### ビルド

```bash
npm run build
```

プロダクション用のビルドを `dist` ディレクトリに作成します。

### パッケージ化

```bash
npm run package
```

CRXファイルを生成します。CI環境では、`CI=true` 環境変数を設定することでダイアログを表示せずに実行できます：

```bash
CI=true npm run package
```

### Lint

```bash
npm run lint
```

コードの品質をチェックします。

### アイコン

PWAのアイコンを使用するために、以下のコマンドを実行します：

```bash
npm run copy-icons
```

このスクリプトは、メインアプリケーションのPWAアイコンを拡張機能用にコピーします。

## ファイル構造

```
chrome-extension/
├── public/               # 静的ファイル
│   ├── manifest.json     # 拡張機能のマニフェスト
│   └── icons/            # アイコン
├── src/                  # ソースコード
│   ├── background/       # バックグラウンドスクリプト
│   ├── content/          # コンテンツスクリプト
│   ├── popup/            # ポップアップUI
│   ├── options/          # 設定ページ
│   └── utils/            # ユーティリティ関数
├── scripts/              # ビルドスクリプト
│   ├── copy-pwa-icons.js # PWAアイコンコピースクリプト
│   └── create-crx.js     # CRXパッケージ生成スクリプト
└── dist/                 # ビルドされた拡張機能
```

## 技術スタック

- **TypeScript**: 型安全な開発環境
- **React**: UIコンポーネント
- **Firebase**: 認証とデータ保存
- **Tailwind CSS**: スタイリング
- **Webpack**: ビルドツール

## CIでのビルド

GitHub Actionsを使用して自動的にビルドを行うことができます。ワークフローの定義は `.github/workflows/build.yml` にあります。

### CI環境での実行

CI環境では、以下の機能が追加されています：

- Chromeのヘッドレスインストール
- ダイアログを表示しないCRXパッケージ化
- 成果物としてdist、CRX、ZIPファイルの保存

GitHub Actionsでは以下のコマンドで手動ビルドも可能です：

```yaml
workflow_dispatch:
  inputs:
    environment:
      description: 'Build environment'
      required: true
      default: 'development'
      type: choice
      options:
        - development
        - production
```

## .gitignore設定

このディレクトリには独自の`.gitignore`ファイルが含まれており、以下のファイルをGit管理から除外しています：

- `/node_modules` - 依存関係
- `/dist` - ビルド成果物
- `/*.crx` - パッケージ化されたChrome拡張機能
- `/*.zip` - ZIPアーカイブ
- `/*.pem` - 秘密鍵

## ライセンス

MIT 