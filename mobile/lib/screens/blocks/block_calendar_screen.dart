import 'package:flutter/material.dart';

class BlockCalendarScreen extends StatelessWidget {
  const BlockCalendarScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('タイムブロック'),
      ),
      body: const Center(
        child: Text('タイムブロックカレンダー画面（実装予定）'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: ブロック追加画面へ遷移
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
