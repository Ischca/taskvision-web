# 静的ビルド互換性ガイドライン

## 概要

本プロジェクトは静的ビルド（`output: export`）を使用しているため、サーバーサイドレンダリング（SSR）に依存する機能は使用できません。このドキュメントでは、静的ビルドの互換性を維持するためのルールとベストプラクティスを説明します。

## 基本ルール

1. **`"use client"`ディレクティブと`generateStaticParams`の分離**

   - クライアントコンポーネント（`"use client"`）と`generateStaticParams`関数は同じファイルに置けません
   - 動的ルート（`[param]`）には必ず`generateStaticParams`関数が必要です
   - 動的ルートには共通の静的パラメータ生成関数（`@/lib/staticParams`）を使用してください

2. **サーバーサイド機能の禁止事項**

   - `getServerSideProps`の使用禁止
   - サーバーアクション（`'use server'`）の使用禁止
   - APIルートの使用制限（静的なAPIのみ使用可）

3. **クライアントサイドでのデータフェッチング**
   - すべてのデータフェッチングはクライアントサイドで行う必要があります
   - ユーザー認証や状態管理はクライアントサイドのみで行ってください

## 動的ルートの使用方法

動的ルート（例：`[locale]`、`[id]`など）を使用する場合：

```typescript
// [locale]/page.tsx (クライアントコンポーネント)
"use client";

// ... コンポーネントコード ...
```

```typescript
// lib/staticParams.ts (静的パラメータの生成)
import { locales } from "@/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

```typescript
// [locale]/layout.tsx
// レイアウトファイルから静的パラメータをエクスポート
export { generateStaticParams } from "@/lib/staticParams";
```

## トラブルシューティング

| ビルドエラー                                                                     | 解決策                                                               |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `Page cannot use both "use client" and export function "generateStaticParams()"` | `generateStaticParams`を別ファイルに移動し、レイアウトからインポート |
| `Page is missing "generateStaticParams()"`                                       | 動的ルートに`generateStaticParams`関数を追加                         |
| `Cannot use XXX with "output: export"`                                           | SSR機能を使用しない実装に変更                                        |

## コミット前チェック

コミット前に静的ビルドの互換性チェックが実行されます：

```bash
npm run check-static-build
```

このコマンドを手動で実行して、コミット前に問題を検出することができます。
