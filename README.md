# TaskVision - タスク管理アプリ

TaskVisionは、タイムブロッキングを活用した効率的なタスク管理のためのWebアプリケーションです。日々のタスクをブロックで管理し、生産性を向上させることを目的としています。

## 主な機能

### 認証・ユーザー管理機能
- メールアドレス/パスワードによるログイン
- Google認証によるログイン
- 新規ユーザー登録
- パスワード再設定
- ユーザープロフィール編集
- アカウント削除

### タスク管理機能
- ドラッグ＆ドロップでのタスク管理
- タイムブロックへのタスク割り当て
- タスクの完了/未完了の切り替え
- カレンダービューでのタスク表示
- リマインダー機能
- 繰り返しタスクの設定

### その他の機能
- ダークモード/ライトモードの切り替え
- レスポンシブデザイン（モバイル対応）
- PWA対応（インストール可能なアプリとして利用可能）

## 技術スタック

- フロントエンド: Next.js, React, TypeScript, TailwindCSS
- バックエンド: Firebase (Authentication, Firestore)
- デプロイ: Vercel

## ローカル開発環境のセットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/your-username/taskvision-app.git
cd taskvision-app
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
`.env.local`ファイルを作成し、Firebaseの設定を記述：
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

4. 開発サーバーを起動
```bash
npm run dev
```

5. ブラウザでアクセス
`http://localhost:3000`でアプリケーションにアクセスできます。

## 本番環境へのデプロイ

このアプリケーションはVercelを使用して簡単にデプロイできます：

1. [Vercel](https://vercel.com)にアカウントを作成
2. GitHubリポジトリを連携
3. 環境変数を設定
4. デプロイボタンをクリック

## ライセンス

MIT License