# TaskVision モバイルアプリ（Flutter版）

TaskVisionのFlutterを使用したモバイルアプリケーション。タスク管理とタイムブロッキングを効率化するアプリのiOS/Android対応版です。

## 機能概要

- **タスク管理**: タスクの作成、編集、削除、ステータス変更
- **タイムブロッキング**: 一日のスケジュール管理と時間割り当て
- **プッシュ通知**: タスクの期限やタイムブロック開始の通知
- **オフライン対応**: インターネット接続がない状態でも基本機能を利用可能
- **クラウド同期**: ウェブ版やChrome拡張機能と同期
- **モバイル特有機能**: カメラ統合、音声入力、生体認証など

## 開発環境

- Flutter: 3.x
- Dart: 3.x
- 対応プラットフォーム: iOS 13+, Android 7.0+
- Firebase連携: Firestore, Auth, Cloud Messaging

## プロジェクト構造

```
mobile/
├── android/          # Android固有のファイル
├── ios/              # iOS固有のファイル
├── lib/              # Dartコード
│   ├── api/          # APIクライアント
│   ├── blocs/        # 状態管理（BLoCパターン）
│   ├── models/       # データモデル
│   ├── screens/      # 画面UI
│   ├── services/     # サービス層
│   ├── utils/        # ユーティリティ
│   ├── widgets/      # 再利用可能なウィジェット
│   └── main.dart     # エントリーポイント
├── test/             # テストコード
├── pubspec.yaml      # 依存関係
└── README.md         # このファイル
```

## セットアップ手順

### 前提条件

- [Flutter SDK](https://flutter.dev/docs/get-started/install)がインストール済み
- [Android Studio](https://developer.android.com/studio)または[Xcode](https://developer.apple.com/xcode/)がインストール済み
- Firebase CLIがインストール済み

### 開発環境構築

1. リポジトリをクローン：
   ```bash
   git clone https://github.com/your-repo/taskvision-app.git
   cd taskvision-app/mobile
   ```

2. 依存関係をインストール：
   ```bash
   flutter pub get
   ```

3. iOSセットアップ（macOSのみ）：
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. デバイスまたはエミュレーターでアプリを実行：
   ```bash
   open -a Simulator
   flutter run
   ```

## ビルド手順

### Android APK生成

```bash
flutter build apk --release
```

### iOS IPAを生成（macOSのみ）

```bash
flutter build ios --release
```

## 開発ガイドライン

- コード規約: [Effective Dart](https://dart.dev/guides/language/effective-dart)に従う
- コミットメッセージ: [Conventional Commits](https://www.conventionalcommits.org/)形式を使用
- ブランチ戦略: GitHub Flowに基づく

## リリース計画

詳細なリリース計画は[TASKS.md](./TASKS.md)を参照してください。

## ライセンス

本プロジェクトは独自ライセンスの下で提供されています。詳細はルートディレクトリのLICENSEファイルを参照してください。 