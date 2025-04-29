# TaskVision Flutter Docker Development Environment

このDockerコンテナは、TaskVisionモバイルアプリの開発環境を提供します。Flutter SDKとAndroid SDKが含まれており、誰でも簡単に開発環境を構築できます。

## 前提条件

- Docker
- Docker Compose
- Gitリポジトリのクローン

## 使い方

### 環境のセットアップ

1. リポジトリをクローンします：

```bash
git clone https://github.com/Ischca/taskvision-web.git
cd taskvision-web
```

2. Dockerイメージをビルドします：

```bash
cd .docker/flutter
docker-compose build
```

### コンテナの起動

```bash
docker-compose up -d
```

### コンテナ内でのコマンド実行

```bash
docker-compose exec flutter bash
```

これにより、Flutterコマンドが利用可能なBashシェルが起動します。

### アプリの実行

コンテナ内で以下のコマンドを実行します：

```bash
cd /workspace
flutter pub get
flutter run
```

### エミュレータの設定

コンテナ内で以下のコマンドを実行してエミュレータを作成します：

```bash
avdmanager create avd -n flutter_emulator -k "system-images;android-33;google_apis;x86_64"
```

エミュレータを起動するには：

```bash
emulator -avd flutter_emulator -no-audio -no-window
```

### コンテナの停止

```bash
docker-compose down
```

## トラブルシューティング

### GUI関連の問題（Linux）

Linuxでエミュレータのウィンドウを表示するには、ホストマシンでX11を設定する必要があります：

```bash
xhost +local:docker
```

### ボリュームのパーミッション問題

ファイルのパーミッション問題が発生した場合は、以下のコマンドを実行します：

```bash
sudo chown -R $USER:$USER mobile
```

## 注意事項

- このDockerコンテナは開発環境専用です。本番環境では使用しないでください。
- Firebaseの設定ファイルは含まれていません。実際の開発には、Firebase Consoleから取得した設定ファイルが必要です。
