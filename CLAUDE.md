# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

TaskVisionは、タスク管理とタイムブロッキングを融合した個人向け生産性向上ツール。モノレポ構成で、Next.js Webアプリ、Chrome拡張機能、共有TypeScriptライブラリ、Flutterモバイルアプリを含む。デフォルトロケールは `ja`（日本語）。

## プロダクトの思想と哲学

### コアコンセプト: 「あとでやる」を無くす

TaskVisionは単なるTodoリストではない。タスクが大量にあり締め切りもバラバラな人が、「今なにをやるべきか？」を考えずに即座にタスクを開始できる状態を作るためのツール。そのために「何をやるか」（タスク）と「いつやるか」（タイムブロック）を一体的に管理し、事前の整理フェーズで「あとで」を「いつ」に変換しておく。実行時には迷わない。これが根本思想。参考プロダクトとしてSunsamaが近い。

### 整理を促す仕組み（デイリープランニング）

TaskVisionの核心機能として、ユーザーにタスク整理を習慣化させるガイド付きプランニング機能がある（一部未実装・構想段階を含む）:

- **デイリープランニング（構想中）**: 寝る前に翌朝のタスクを整理することを促す専用UI。タスク一覧から翌日の（一番最初の）タイムブロックへ振り分ける体験をガイドする。あまり重くせず、習慣的にできるようにする。タイムブロック単位でのプランニングも検討中
- **未割り当てタスクの可視化（実装済）**: ブロックに振り分けられていないタスクを「未割り当てタスク」セクションとして常に表示し、整理されていないタスクの存在をユーザーに意識させる
- **ドラッグ&ドロップによる振り分け（実装済）**: 未割り当てタスクをタイムブロックへ直感的に割り当てられるUIで、整理のハードルを下げる
- **期限切れ検知・優先度提案（実装済）**: 先送りされたタスクの可視化や、ソースに基づく優先度の自動提案でタスク整理を補助する

### 設計原則

- **シンプルさの徹底**: 余計な機能で画面を複雑にしない。最小限のクリックで目的の機能にアクセスできる直感的なUI/UXを追求する
- **個人最適化が最優先**: まず個人ユーザーの体験を完璧にし、その上でチーム機能を段階的に拡張する（チーム機能は将来計画）
- **情報の散在を防ぐ**: Chrome拡張・Slack・メール等あらゆる情報源からタスクを一箇所に集約する統合型アプローチ
- **オフラインでも使える**: PWA対応、モバイルのオフラインキャッシュなど、接続状態に依存しない設計

### ターゲットユーザー

1. **知識労働者**（最優先）— 多様なタスクを管理するプロフェッショナル、リモートワーカー
2. **個人事業主・フリーランサー** — 複数プロジェクトを同時管理する自営業者
3. **学生・研究者** — 締め切りや課題を管理する必要がある人

### ビジネスモデル

フリーミアム型サブスクリプション:
- **無料プラン**: 基本タスク管理、1日3タイムブロックまで、基本リマインダー
- **プロプラン（¥880/月）**: 無制限タイムブロック、高度なリマインダー、複数デバイス同期、Chrome拡張フル機能
- **チームプラン（将来）**: プロ全機能 + チーム共有・ダッシュボード・管理者機能

### 開発ロードマップの方針

段階的リリース戦略を採用。個人向けコア機能の完成度を先に高め、その後に外部連携→チーム機能→AI支援→エンタープライズと拡張していく:

1. **現在**: コアタスク管理 + タイムブロッキング + Chrome拡張 + PWA + モバイル
2. **短期**: 高度な繰り返しタスク、Slack/メール連携（API Routes依存のため現在凍結中→ホスティング移行後に実装）
3. **中期**: チーム機能、API公開、テンプレートマーケットプレイス
4. **長期**: AI支援（タスク最適化・自然言語入力）、エンタープライズ機能

### 競合との差別化ポイント

Todoist・Asana・TickTick等の競合に対する独自の強み:
- タスク管理とタイムブロッキングの統合（他社はどちらか片方に偏りがち）
- Chrome拡張によるWebからの即座なタスクキャプチャ
- 将来的にSlack/メールからの自動タスク生成で情報散在を解消

## モノレポ構成

- `web/` — Next.js 16 Webアプリケーション（npm workspacesのルート）
- `chrome-extension/` — Manifest V3 Chrome拡張機能（React 18, Webpack）
- `shared/` — 共有TypeScript型定義・ユーティリティ（日付/タスクヘルパー）
- `mobile/` — Flutter/Dartモバイルアプリ（BLoCパターン、独立したビルドシステム）

**npm workspacesは `web/package.json` で設定されている。** `web/` で `npm install` を実行すると、web・chrome-extension・sharedの依存関係が一括インストールされる。

## よく使うコマンド

Webアプリのコマンドは `web/` ディレクトリで実行：

```bash
cd web
npm install          # 全ワークスペースの依存関係をインストール
npm run dev          # 開発サーバー起動 (http://localhost:3000)
npm run build        # 本番ビルド（standalone出力）
npm run lint         # ESLint実行
npm run lint:fix     # ESLint自動修正付き
npm run serve        # Firebaseエミュレータ (auth:9099, firestore:8080, hosting:5000, functions:5001)
npm run deploy       # Firebaseデプロイ（全体）
```

Chrome拡張機能のコマンドは `chrome-extension/` で実行：

```bash
cd chrome-extension
npm run start        # Webpack開発ウォッチ
npm run build        # 本番ビルド（dist/へ出力）
npm run package      # CRX/ZIPパッケージ作成
```

共有ライブラリ：

```bash
cd shared
npm run build        # TypeScriptをdist/へコンパイル
```

**テストフレームワークは未設定。** どのパッケージにもテストスクリプト・テストランナーは存在しない。

## アーキテクチャ

### Webアプリ (`web/src/`)

- **フレームワーク:** Next.js 16 (App Router), React 19, TypeScript 5
- **出力モード:** `standalone`（静的エクスポートではなく、Firebase App Hosting/Cloud Runでのサーバーサイドレンダリング）
- **スタイリング:** TailwindCSS 3 + shadcn/ui（new-yorkスタイル、CSS変数）
- **i18n:** next-intl v4、URLベースのロケールルーティング (`/[locale]/...`)。ロケール: `en`, `ja`。デフォルト: `ja`。タイムゾーン: `Asia/Tokyo`。メッセージファイル: `src/messages/{locale}.json`
- **認証:** Firebase Authentication（メール/パスワード + Google OAuth）、React Context (`AuthProvider.tsx`) で管理
- **データベース:** Cloud Firestore。コレクション: `tasks`, `blocks`, `reminders`。全ドキュメントはユーザースコープ（`userId`フィールド、`firestore.rules`で制御）
- **PWA:** next-pwa + Workboxサービスワーカー、オフライン対応、インストールプロンプト

### ルーティング

ルートは `[locale]` 動的セグメントを使用: `src/app/[locale]/page.tsx`（ダッシュボード）、`login/`, `signup/`, `calendar/`, `blocks/manage/`, `profile/`

### コアデータモデル (`web/src/types.ts`)

- **Block** — タイムブロック。`startTime`/`endTime`（HH:MM形式）、`order`フィールドで順序管理
- **Task** — コアエンティティ。`blockId`（nullable）、`date`（YYYY-MM-DD）、`status`（open/done）、オプションで `deadline`, `repeatSettings`, `reminderSettings`, `source`（manual/slack/email/chrome_extension）
- **RepeatSettings** — 繰り返しルール（daily/weekdays/weekly/monthly/custom）、例外設定あり
- **Reminder** — ブロック開始/終了またはデッドライン通知

### パスエイリアス

`@/*` → `./src/*`、`taskvision-shared` → `../shared`（`web/tsconfig.json` で設定）

### Chrome拡張機能

Manifest V3。サービスワーカー、ポップアップUI、オプションページ、コンテントスクリプト。Firebase認証とFirestoreをデータ層として使用。i18nはi18next（next-intlではない）。

### 共有パッケージ

日付ユーティリティ（`formatDate`, `parseDate`, `isDatePast`, `isToday`, `getDaysDiff`）とタスクユーティリティ（`getSourceLabel`, `isTaskOverdue`, `suggestPriority`, `completeTask`, `reopenTask`）をエクスポート。Webアプリが使用する前に `shared/` で `npm run build` が必要。

## Firebase

- **プロジェクト:** `taskvision-3f130`
- **サービス:** Firestore, Auth, Cloud Functions, Hosting
- **App Hosting設定:** `web/apphosting.yaml`（Cloud Run、APIキーはシークレット管理）
- **Firestoreルール:** `web/firestore.rules` — 全コレクションで認証必須、ユーザースコープアクセス
- **Cloud Functions:** `web/functions/index.js` — Next.jsをラップするHTTP関数

## 環境変数

`web/.env.example` を参照。Firebase設定用の `NEXT_PUBLIC_FIREBASE_*` 変数が必須。Slack/Email連携や暗号化用の追加変数あり。

## コード品質

- **Pre-commitフック**（Husky）: lint-staged（ESLint修正 + Prettier）がステージされた `.{js,jsx,ts,tsx,json,md}` ファイルに対して実行される
- **ESLint設定:** `web/eslint.config.mjs`（フラットコンフィグ、緩めのルール — 未使用変数と `any` 型は許容）
- **TypeScriptビルドエラーは無視される**（`next.config.js` の `ignoreBuildErrors: true`）

## Chrome拡張機能のバージョン管理

`chrome-extension/package.json` のバージョンはPRマージ前に手動更新が必要。セマンティックバージョニングに従う。CIが `v{version}` タグ付きのGitHub Releaseを自動作成する。

## 開発ルール

禁止: 本質的な解決を行わずバイパスする行為
