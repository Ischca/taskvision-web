#!/bin/bash

# TaskVision Flutter プロジェクト初期化スクリプト
# ---------------------------------------------

echo "TaskVision Flutter プロジェクト初期化を開始します..."

# 現在のディレクトリを確認
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Flutterがインストールされているか確認
if ! command -v flutter &> /dev/null; then
    echo "エラー: Flutterがインストールされていません。"
    echo "https://flutter.dev/docs/get-started/install からインストールしてください。"
    exit 1
fi

# Flutter SDKバージョン確認
FLUTTER_VERSION=$(flutter --version | head -n 1)
echo "検出されたFlutterバージョン: $FLUTTER_VERSION"

# プロジェクト作成
echo "Flutterプロジェクトを作成しています..."
flutter create \
    --org com.taskvision \
    --project-name taskvision \
    --platforms=android,ios \
    --description "TaskVision - タスク管理とタイムブロッキングを効率化するモバイルアプリ" \
    .

# ディレクトリ構造作成
echo "ディレクトリ構造を作成しています..."
mkdir -p lib/{api,blocs,models,screens,services,utils,widgets}
mkdir -p assets/{images,fonts,icons}

# 必要なパッケージをpubspec.yamlに追加
cat > pubspec.yaml << 'EOF'
name: taskvision
description: TaskVision - タスク管理とタイムブロッキングを効率化するモバイルアプリ

publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  
  # Firebase
  firebase_core: ^2.15.0
  firebase_auth: ^4.6.3
  cloud_firestore: ^4.8.1
  firebase_messaging: ^14.6.3
  
  # State Management
  flutter_bloc: ^8.1.3
  provider: ^6.0.5
  
  # UI Components
  cupertino_icons: ^1.0.5
  flutter_svg: ^2.0.6
  google_fonts: ^4.0.4
  intl: ^0.18.0
  
  # Storage
  shared_preferences: ^2.1.2
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  
  # Utils
  uuid: ^3.0.7
  path_provider: ^2.0.15
  url_launcher: ^6.1.12
  image_picker: ^0.8.8
  
  # Auth
  local_auth: ^2.1.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.1
  build_runner: ^2.4.5
  hive_generator: ^2.0.0
  flutter_launcher_icons: ^0.13.1
  flutter_native_splash: ^2.3.1

flutter:
  uses-material-design: true
  
  assets:
    - assets/images/
    - assets/icons/
  
  fonts:
    - family: NotoSansJP
      fonts:
        - asset: assets/fonts/NotoSansJP-Regular.otf
        - asset: assets/fonts/NotoSansJP-Bold.otf
          weight: 700
        - asset: assets/fonts/NotoSansJP-Medium.otf
          weight: 500

flutter_icons:
  android: "launcher_icon"
  ios: true
  image_path: "assets/icons/app_icon.png"
  adaptive_icon_background: "#ffffff"
  adaptive_icon_foreground: "assets/icons/app_icon_foreground.png"

flutter_native_splash:
  color: "#4F46E5"
  image: assets/icons/splash_icon.png
  android: true
  ios: true
EOF

# サンプルのメインファイル作成
cat > lib/main.dart << 'EOF'
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

void main() {
  runApp(const TaskVisionApp());
}

class TaskVisionApp extends StatelessWidget {
  const TaskVisionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TaskVision',
      theme: ThemeData(
        primarySwatch: Colors.indigo,
        useMaterial3: true,
        fontFamily: 'NotoSansJP',
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.indigo,
        useMaterial3: true,
        fontFamily: 'NotoSansJP',
      ),
      themeMode: ThemeMode.system,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('ja', ''),
        Locale('en', ''),
      ],
      locale: const Locale('ja', ''),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('TaskVision'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.check_circle_outline,
              size: 100,
              color: Colors.indigo,
            ),
            const SizedBox(height: 24),
            const Text(
              'TaskVision',
              style: TextStyle(
                fontSize: 28, 
                fontWeight: FontWeight.bold
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'タスク管理とタイムブロッキングを効率化するアプリ',
              style: TextStyle(fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: () {},
              child: const Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: 24, 
                  vertical: 12
                ),
                child: Text('はじめる'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
EOF

# .gitignoreファイル作成
cat > .gitignore << 'EOF'
# Miscellaneous
*.class
*.log
*.pyc
*.swp
.DS_Store
.atom/
.buildlog/
.history
.svn/
migrate_working_dir/

# IntelliJ related
*.iml
*.ipr
*.iws
.idea/

# The .vscode folder contains launch configuration and tasks you configure in
# VS Code which you may wish to be included in version control, so this line
# is commented out by default.
#.vscode/

# Flutter/Dart/Pub related
**/doc/api/
**/ios/Flutter/.last_build_id
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
.pub-cache/
.pub/
/build/

# Symbolication related
app.*.symbols

# Obfuscation related
app.*.map.json

# Android Studio will place build artifacts here
/android/app/debug
/android/app/profile
/android/app/release

# iOS/XCode related
**/ios/**/*.mode1v3
**/ios/**/*.mode2v3
**/ios/**/*.moved-aside
**/ios/**/*.pbxuser
**/ios/**/*.perspectivev3
**/ios/**/*sync/
**/ios/**/.sconsign.dblite
**/ios/**/.tags*
**/ios/**/.vagrant/
**/ios/**/DerivedData/
**/ios/**/Icon?
**/ios/**/Pods/
**/ios/**/.symlinks/
**/ios/**/profile
**/ios/**/xcuserdata
**/ios/.generated/
**/ios/Flutter/App.framework
**/ios/Flutter/Flutter.framework
**/ios/Flutter/Generated.xcconfig
**/ios/Flutter/app.flx
**/ios/Flutter/app.zip
**/ios/Flutter/flutter_assets/
**/ios/ServiceDefinitions.json
**/ios/Runner/GeneratedPluginRegistrant.*

# Web related
**/web/favicon.png
**/web/manifest.json

# Firebase
google-services.json
GoogleService-Info.plist
firebase_options.dart

# Local configuration files
.env
EOF

# 必要なパッケージをインストール
echo "依存パッケージをインストールしています..."
flutter pub get

echo "プロジェクト初期化が完了しました！"
echo "以下のコマンドでアプリを実行できます："
echo "cd $(pwd) && flutter run" 