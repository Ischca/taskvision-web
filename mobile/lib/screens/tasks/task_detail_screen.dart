import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/task.dart';
import '../../services/task_service.dart';
import 'task_form_screen.dart';

class TaskDetailScreen extends StatelessWidget {
  final String taskId;
  final TaskService _taskService = TaskService();

  TaskDetailScreen({super.key, required this.taskId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('タスク詳細'),
        actions: [
          StreamBuilder<Task?>(
            stream: _taskService.getTask(taskId),
            builder: (context, snapshot) {
              if (!snapshot.hasData || snapshot.data == null) {
                return const SizedBox.shrink();
              }
              
              final task = snapshot.data!;
              
              return IconButton(
                icon: const Icon(Icons.edit),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => TaskFormScreen(
                        userId: task.userId,
                        task: task,
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
      body: StreamBuilder<Task?>(
        stream: _taskService.getTask(taskId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('エラーが発生しました: ${snapshot.error}'));
          }

          if (!snapshot.hasData || snapshot.data == null) {
            return const Center(child: Text('タスクが見つかりません'));
          }

          final task = snapshot.data!;
          return _buildTaskDetails(context, task);
        },
      ),
    );
  }

  Widget _buildTaskDetails(BuildContext context, Task task) {
    final dueDate = task.dueDate != null
        ? DateFormat('yyyy年MM月dd日 HH:mm').format(task.dueDate!)
        : '期限なし';

    final createdAt = DateFormat('yyyy年MM月dd日').format(task.createdAt);

    String priorityText;
    Color priorityColor;
    switch (task.priority) {
      case TaskPriority.high:
        priorityText = '高';
        priorityColor = Colors.red;
        break;
      case TaskPriority.medium:
        priorityText = '中';
        priorityColor = Colors.orange;
        break;
      case TaskPriority.low:
        priorityText = '低';
        priorityColor = Colors.green;
        break;
    }

    String statusText;
    switch (task.status) {
      case TaskStatus.notStarted:
        statusText = '未着手';
        break;
      case TaskStatus.inProgress:
        statusText = '進行中';
        break;
      case TaskStatus.completed:
        statusText = '完了';
        break;
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          task.title,
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                      ),
                      Checkbox(
                        value: task.status == TaskStatus.completed,
                        onChanged: (value) {
                          final newStatus = value!
                              ? TaskStatus.completed
                              : TaskStatus.notStarted;
                          _taskService.updateTask(task.copyWith(status: newStatus));
                        },
                      ),
                    ],
                  ),
                  const Divider(),
                  if (task.description != null && task.description!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    const Text(
                      '説明',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(task.description!),
                    const SizedBox(height: 16),
                  ],
                  _buildInfoRow('ステータス', statusText),
                  _buildInfoRow(
                    '優先度',
                    priorityText,
                    trailing: Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: priorityColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                  _buildInfoRow('期限', dueDate),
                  _buildInfoRow('作成日', createdAt),
                  if (task.tags != null && task.tags!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    const Text(
                      'タグ',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Wrap(
                      spacing: 8,
                      runSpacing: 4,
                      children: task.tags!
                          .map((tag) => Chip(
                                label: Text(tag),
                              ))
                          .toList(),
                    ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () {
              _showDeleteConfirmationDialog(context, task);
            },
            icon: const Icon(Icons.delete),
            label: const Text('タスクを削除'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {Widget? trailing}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text(
            '$label: ',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          Expanded(child: Text(value)),
          if (trailing != null) trailing,
        ],
      ),
    );
  }

  void _showDeleteConfirmationDialog(BuildContext context, Task task) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('タスクを削除'),
          content: const Text('このタスクを削除してもよろしいですか？'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('キャンセル'),
            ),
            TextButton(
              onPressed: () {
                _taskService.deleteTask(task.id);
                Navigator.of(context).pop();
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('タスクを削除しました'),
                    action: SnackBarAction(
                      label: '元に戻す',
                      onPressed: () {
                        _taskService.updateTask(task.copyWith(isDeleted: false));
                      },
                    ),
                  ),
                );
              },
              child: const Text('削除'),
            ),
          ],
        );
      },
    );
  }
}
