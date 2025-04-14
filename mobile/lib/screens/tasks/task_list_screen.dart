import 'package:flutter/material.dart';

class TaskListScreen extends StatelessWidget {
  const TaskListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('タスク一覧'),
      ),
      body: const Center(
        child: Text('タスク一覧画面（実装予定）'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: タスク追加画面へ遷移
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
