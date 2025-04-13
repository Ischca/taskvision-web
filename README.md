# TaskVision

<!-- Dummy change for verification PR -->


TaskVisionは、シンプルで効率的なタスク管理ツールです。このリポジトリはWeb版とChrome拡張機能を含んでいます。

## プロジェクト構造

このリポジトリは以下のディレクトリで構成されるモノレポです：

- `web` - TaskVisionのWebアプリケーション（Next.js）- **モノレポのルート**
- `chrome-extension` - TaskVisionのChrome拡張機能
- `shared` - 共有コンポーネントとユーティリティ
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

Webディレクトリに移動して依存関係をインストールします：

```bash
cd web
npm install
```

これにより、webアプリケーション、Chrome拡張機能、および共有パッケージの依存関係が一度にインストールされます。

### Webアプリケーション開発

Webアプリケーションの開発サーバーを起動します：

```bash
cd web
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

#### 静的ビルドの互換性

このプロジェクトは静的ビルド（`output: export`）を使用し、サーバーサイドレンダリング（SSR）を使用しません。変更を加える前に以下のガイドラインを確認してください：

- 動的ルート（`[param]`）には`generateStaticParams`が必要です
- `"use client"`と`generateStaticParams`は同じファイルで使用できません
- SSR機能（`getServerSideProps`、サーバーアクション）は使用できません
- すべてのデータフェッチングはクライアントサイドで行います

詳細なガイドラインは `web/docs/static-build-rules.md` を参照してください。

### Chrome拡張機能開発

Chrome拡張機能の開発サーバーを起動します：

```bash
cd chrome-extension
npm run start
```

拡張機能をブラウザにインストールするには：

1. Chromeで `chrome://extensions` を開きます
2. 「デベロッパーモード」をオンにします
3. 「パッケージ化されていない拡張機能を読み込む」をクリックし、`chrome-extension/dist` ディレクトリを選択します

### ビルド

webディレクトリからビルドします：

```bash
cd web
npm run build
```

Chrome拡張機能のみをビルドするには：

```bash
cd chrome-extension
npm run build
```

### Firebase App Hosting

このプロジェクトはFirebase App Hostingを使用しています。App Hostingの設定は `web/apphosting.yaml` にあります。

デプロイするには：

```bash
cd web
npm run deploy
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

## バージョン管理とリリースルール

TaskVisionプロジェクトでは、以下のバージョン管理とリリースのルールを採用しています：

### Chrome拡張機能のバージョン管理

1. **手動バージョン更新**: 
   - リリース前に `chrome-extension/package.json` の `version` フィールドを手動で更新してください
   - セマンティックバージョニング（major.minor.patch）に従ってください
   - 例: `1.0.0` → `1.0.1`（パッチ更新）、`1.0.0` → `1.1.0`（マイナー更新）

2. **バージョン更新のタイミング**:
   - 機能追加時: マイナーバージョンを上げる（`1.0.0` → `1.1.0`）
   - バグ修正時: パッチバージョンを上げる（`1.0.0` → `1.0.1`）
   - 互換性のない変更時: メジャーバージョンを上げる（`1.0.0` → `2.0.0`）

3. **リリース前の確認事項**:
   - プルリクエストをマージする前に、バージョンが更新されていることを確認してください
   - 同じバージョン番号で複数回リリースすると、GitHubのタグが競合します

### コマンドライン操作例

バージョンを手動で更新するコマンド例:

```bash
cd chrome-extension

# パッチバージョンを上げる (1.0.0 → 1.0.1)
npm version patch --no-git-tag-version

# マイナーバージョンを上げる (1.0.0 → 1.1.0) 
npm version minor --no-git-tag-version

# メジャーバージョンを上げる (1.0.0 → 2.0.0)
npm version major --no-git-tag-version
```

その後、変更をコミットしてプッシュしてください:

```bash
git add chrome-extension/package.json
git commit -m "バージョンを x.y.z に更新"
git push
```

## ライセンス

MIT
