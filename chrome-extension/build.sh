#!/bin/bash

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}TaskVision Chrome拡張機能 ビルドスクリプト${NC}"
echo -e "${YELLOW}=======================================${NC}"

# npm がインストールされているか確認
if ! command -v npm &> /dev/null; then
  echo -e "${RED}エラー: npm がインストールされていません。Node.jsとnpmをインストールしてください。${NC}"
  exit 1
fi

# 必要なディレクトリに移動
cd "$(dirname "$0")" || exit

# 依存関係をインストール
echo -e "${GREEN}依存関係をインストールしています...${NC}"
npm install

# リンター実行
echo -e "${GREEN}コードをリントしています...${NC}"
npm run lint

# リンター結果が成功したか確認
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}警告: リントエラーが検出されました。修正してから再度実行することをお勧めします。${NC}"
  read -p "続行しますか？ (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}ビルドをキャンセルしました。${NC}"
    exit 1
  fi
fi

# ビルド実行
echo -e "${GREEN}拡張機能をビルドしています...${NC}"
npm run build

# ビルド結果が成功したか確認
if [ $? -ne 0 ]; then
  echo -e "${RED}エラー: ビルドに失敗しました。${NC}"
  exit 1
fi

# ZIPファイルの作成
echo -e "${GREEN}ZIPファイルを作成しています...${NC}"
cd dist || exit
zip -r ../taskvision-chrome-extension.zip *
cd ..

# 結果表示
echo -e "${GREEN}ビルドが完了しました！${NC}"
echo -e "以下のファイルが作成されました:"
echo -e " - ${YELLOW}dist/${NC} ディレクトリ: 拡張機能のファイル"
echo -e " - ${YELLOW}taskvision-chrome-extension.zip${NC}: Chromeウェブストアにアップロード可能なZIPファイル"
echo
echo -e "${GREEN}インストール方法:${NC}"
echo -e "1. Chromeで ${YELLOW}chrome://extensions/${NC} を開きます"
echo -e "2. 「デベロッパーモード」を有効にします"
echo -e "3. 「パッケージ化されていない拡張機能を読み込む」をクリックします"
echo -e "4. ${YELLOW}dist/${NC} ディレクトリを選択します"

exit 0 