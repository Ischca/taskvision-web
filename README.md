# TaskVision

TaskVisionは、シンプルで効率的なタスク管理ツールです。このリポジトリはWeb版とChrome拡張機能を含んでいます。

## プロジェクト構造

このリポジトリは以下のディレクトリで構成されています：

- `web` - TaskVisionのWebアプリケーション（Next.js）
- `chrome-extension` - TaskVisionのChrome拡張機能
- `.github` - GitHub Actions ワークフロー設定

## 開発を始める

### 前提条件

- Node.js (18以上)
- npm (9以上)

### インストール

リポジトリをクローンします：

```bash
git clone https://github.com/your-username/taskvision.git
cd taskvision
```

### Webアプリケーション開発

Webアプリケーションの依存関係をインストールし、開発サーバーを起動します：

```bash
cd web
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

### Chrome拡張機能開発

Chrome拡張機能の依存関係をインストールし、開発サーバーを起動します：

```bash
cd chrome-extension
npm install
npm run start
```

拡張機能をブラウザにインストールするには：

1. Chromeで `chrome://extensions` を開きます
2. 「デベロッパーモード」をオンにします
3. 「パッケージ化されていない拡張機能を読み込む」をクリックし、`chrome-extension/dist` ディレクトリを選択します

### ビルド

ルートディレクトリから全てのプロジェクトをビルドするには：

```bash
npm run build
```

または個別に各ディレクトリでビルドすることもできます：

```bash
# Webアプリケーションのみをビルド
cd web
npm run build

# Chrome拡張機能のみをビルド
cd chrome-extension
npm run build
```

### Chrome拡張機能をパッケージ化

Chrome拡張機能をCRXファイルとしてパッケージ化するには：

```bash
cd chrome-extension
npm run package
```

## CI/CD

GitHub Actionsを使用して継続的インテグレーション/デプロイを行っています。設定ファイルは `.github/workflows` ディレクトリにあります。

- Webアプリケーションは、Firebaseホスティングに自動デプロイされます
- Chrome拡張機能は、ビルドとパッケージ化が自動化されています

## ライセンス

MIT