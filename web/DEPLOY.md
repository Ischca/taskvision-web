# TaskVision Firebase Functionsデプロイ手順

このプロジェクトは、Firebase Functionsを使用してNext.jsアプリケーションをSSRモードで実行します。

## Firebase Functionsを選択した理由

- Next.js 15のSSR機能をFirebase上で実行できる
- バックエンドとフロントエンドを同一プラットフォーム上で管理できる
- 認証やデータベースとの連携が容易
- プロジェクト全体を一元管理できる

## デプロイ準備

1. Firebase CLIのインストール

   ```
   npm install -g firebase-tools
   ```

2. Firebaseへのログイン

   ```
   firebase login
   ```

3. 開発環境でのテスト
   ```
   cd web
   npm run build  # Next.jsアプリをビルド
   npm run serve  # Firebaseエミュレーターを起動
   ```

## デプロイ手順

1. Next.jsアプリケーションのビルド

   ```
   cd web
   npm run build
   ```

2. Firebase Functionsとホスティングのデプロイ

   ```
   npm run deploy
   ```

   または個別にデプロイする場合:

   ```
   npm run deploy:functions  # Functionsのみデプロイ
   npm run deploy:hosting    # ホスティングのみデプロイ
   ```

## 環境変数の設定

Firebase Functionsで環境変数を使用するには:

1. Firebase CLIを使用して設定

   ```
   firebase functions:config:set someservice.key="THE API KEY" someservice.id="THE CLIENT ID"
   ```

2. 環境変数をローカルで使用するには `.runtimeconfig.json` を作成
   ```
   firebase functions:config:get > .runtimeconfig.json
   ```

## CI/CDの設定

GitHub Actionsを使用してデプロイを自動化:

1. ワークフローが `main` ブランチへのプッシュ時に実行されます
2. アプリケーションのビルドと自動デプロイが行われます
3. Chrome拡張機能は別途ビルドされGitHubリリースとして公開されます

## トラブルシューティング

1. ビルドエラー

   - `npm run build` で発生するエラーを確認
   - 依存関係の問題は `npm ci` を実行して解決することが多い

2. デプロイエラー

   - Functionsのログを確認: `firebase functions:log`
   - メモリ不足の場合はプランのアップグレードを検討

3. パフォーマンス問題
   - Cold startの遅延がある場合は、常時稼働オプションを検討
   - キャッシュの設定を見直す
