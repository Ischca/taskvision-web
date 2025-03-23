#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# webディレクトリに移動して静的ビルドチェックを実行
cd web

# lint-stagedを実行（ステージングされたファイルのリントとフォーマット）
npx lint-staged

echo "✅ 全てのチェックが通過しました！" 