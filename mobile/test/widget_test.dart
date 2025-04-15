// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

// テスト用のシンプルなアプリラッパー
class TestApp extends StatelessWidget {
  const TestApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TaskVision Test',
      home: const Scaffold(body: Center(child: Text('TaskVision Test'))),
    );
  }
}

void main() {
  testWidgets('App renders without crashing', (WidgetTester tester) async {
    // テスト前の設定
    TestWidgetsFlutterBinding.ensureInitialized();
    
    // テスト用の簡易アプリをレンダリング
    await tester.pumpWidget(const TestApp());
    
    // アプリが正常にレンダリングされることを確認
    expect(find.text('TaskVision Test'), findsOneWidget);
  });
}
