import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:intl/intl.dart';
import '../../models/task.dart';
import '../../services/task_service.dart';
import '../../routes/app_router.dart';
import 'task_detail_screen.dart';
import 'task_form_screen.dart';

class TaskListScreen extends StatefulWidget {
  const TaskListScreen({super.key});

  @override
  State<TaskListScreen> createState() => _TaskListScreenState();
}

class _TaskListScreenState extends State<TaskListScreen> {
  final TaskService _taskService = TaskService();
  String _filterType = 'all';
  String? _selectedTag;
  final List<String> _availableTags = ['仕事', '個人', '買い物', '勉強', 'その他'];

  String? get _userId => FirebaseAuth.instance.currentUser?.uid;

  @override
  Widget build(BuildContext context) {
    if (_userId == null) {
      return const Scaffold(
        body: Center(
          child: Text('ログインしてください'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('タスク一覧'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.pushNamed(context, AppRouter.settings);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilterChips(),
          Expanded(
            child: _buildTaskList(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TaskFormScreen(userId: _userId!),
            ),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildFilterChips() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      child: Row(
        children: [
          FilterChip(
            label: const Text('すべて'),
            selected: _filterType == 'all',
            onSelected: (selected) {
              setState(() {
                _filterType = 'all';
                _selectedTag = null;
              });
            },
          ),
          const SizedBox(width: 8),
          FilterChip(
            label: const Text('今日'),
            selected: _filterType == 'today',
            onSelected: (selected) {
              setState(() {
                _filterType = 'today';
                _selectedTag = null;
              });
            },
          ),
          const SizedBox(width: 8),
          FilterChip(
            label: const Text('期限切れ'),
            selected: _filterType == 'overdue',
            onSelected: (selected) {
              setState(() {
                _filterType = 'overdue';
                _selectedTag = null;
              });
            },
          ),
          const SizedBox(width: 8),
          FilterChip(
            label: const Text('高優先度'),
            selected: _filterType == 'high',
            onSelected: (selected) {
              setState(() {
                _filterType = 'high';
                _selectedTag = null;
              });
            },
          ),
          const SizedBox(width: 8),
          FilterChip(
            label: const Text('完了'),
            selected: _filterType == 'completed',
            onSelected: (selected) {
              setState(() {
                _filterType = 'completed';
                _selectedTag = null;
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildTaskList() {
    Stream<List<Task>> tasksStream;

    if (_userId == null) {
      return const Center(child: Text('ログインしてください'));
    }

    switch (_filterType) {
      case 'today':
        tasksStream = _taskService.getTasksDueToday(_userId!);
        break;
      case 'overdue':
        tasksStream = _taskService.getOverdueTasks(_userId!);
        break;
      case 'high':
        tasksStream = _taskService.getTasksByPriority(_userId!, TaskPriority.high);
        break;
      case 'completed':
        tasksStream = _taskService.getTasksByStatus(_userId!, TaskStatus.completed);
        break;
      case 'tag':
        if (_selectedTag != null) {
          tasksStream = _taskService.getTasksByTag(_userId!, _selectedTag!);
        } else {
          tasksStream = _taskService.getTasks(_userId!);
        }
        break;
      case 'all':
      default:
        tasksStream = _taskService.getTasks(_userId!);
        break;
    }

    return StreamBuilder<List<Task>>(
      stream: tasksStream,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(child: Text('エラーが発生しました: ${snapshot.error}'));
        }

        final tasks = snapshot.data ?? [];

        if (tasks.isEmpty) {
          return const Center(child: Text('タスクがありません'));
        }

        return ListView.builder(
          itemCount: tasks.length,
          itemBuilder: (context, index) {
            final task = tasks[index];
            return _buildTaskItem(task);
          },
        );
      },
    );
  }

  Widget _buildTaskItem(Task task) {
    final dueDate = task.dueDate != null
        ? DateFormat('yyyy/MM/dd').format(task.dueDate!)
        : '期限なし';

    Color priorityColor;
    switch (task.priority) {
      case TaskPriority.high:
        priorityColor = Colors.red;
        break;
      case TaskPriority.medium:
        priorityColor = Colors.orange;
        break;
      case TaskPriority.low:
        priorityColor = Colors.green;
        break;
    }

    return Dismissible(
      key: Key(task.id),
      background: Container(
        color: Colors.red,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        child: const Icon(
          Icons.delete,
          color: Colors.white,
        ),
      ),
      direction: DismissDirection.endToStart,
      confirmDismiss: (direction) async {
        return await showDialog(
          context: context,
          builder: (context) {
            return AlertDialog(
              title: const Text('タスクを削除'),
              content: const Text('このタスクを削除してもよろしいですか？'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('キャンセル'),
                ),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('削除'),
                ),
              ],
            );
          },
        );
      },
      onDismissed: (direction) {
        _taskService.deleteTask(task.id);
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
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: ListTile(
          leading: Checkbox(
            value: task.status == TaskStatus.completed,
            onChanged: (value) {
              final newStatus =
                  value! ? TaskStatus.completed : TaskStatus.notStarted;
              _taskService.updateTask(task.copyWith(status: newStatus));
            },
          ),
          title: Text(
            task.title,
            style: TextStyle(
              decoration: task.status == TaskStatus.completed
                  ? TextDecoration.lineThrough
                  : null,
            ),
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('期限: $dueDate'),
              if (task.tags != null && task.tags!.isNotEmpty)
                Wrap(
                  spacing: 4,
                  children: task.tags!
                      .map((tag) => Chip(
                            label: Text(tag),
                            labelStyle: const TextStyle(fontSize: 10),
                            padding: EdgeInsets.zero,
                            materialTapTargetSize:
                                MaterialTapTargetSize.shrinkWrap,
                          ))
                      .toList(),
                ),
            ],
          ),
          trailing: Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: priorityColor,
              shape: BoxShape.circle,
            ),
          ),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => TaskDetailScreen(taskId: task.id),
              ),
            );
          },
        ),
      ),
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('タスクをフィルタリング'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                title: const Text('すべてのタスク'),
                leading: Radio<String>(
                  value: 'all',
                  groupValue: _filterType,
                  onChanged: (value) {
                    setState(() {
                      _filterType = value!;
                      _selectedTag = null;
                    });
                    Navigator.pop(context);
                  },
                ),
              ),
              ListTile(
                title: const Text('今日のタスク'),
                leading: Radio<String>(
                  value: 'today',
                  groupValue: _filterType,
                  onChanged: (value) {
                    setState(() {
                      _filterType = value!;
                      _selectedTag = null;
                    });
                    Navigator.pop(context);
                  },
                ),
              ),
              ListTile(
                title: const Text('期限切れのタスク'),
                leading: Radio<String>(
                  value: 'overdue',
                  groupValue: _filterType,
                  onChanged: (value) {
                    setState(() {
                      _filterType = value!;
                      _selectedTag = null;
                    });
                    Navigator.pop(context);
                  },
                ),
              ),
              ListTile(
                title: const Text('高優先度のタスク'),
                leading: Radio<String>(
                  value: 'high',
                  groupValue: _filterType,
                  onChanged: (value) {
                    setState(() {
                      _filterType = value!;
                      _selectedTag = null;
                    });
                    Navigator.pop(context);
                  },
                ),
              ),
              ListTile(
                title: const Text('完了したタスク'),
                leading: Radio<String>(
                  value: 'completed',
                  groupValue: _filterType,
                  onChanged: (value) {
                    setState(() {
                      _filterType = value!;
                      _selectedTag = null;
                    });
                    Navigator.pop(context);
                  },
                ),
              ),
              const Divider(),
              const Text('タグでフィルタリング'),
              Wrap(
                spacing: 8,
                children: _availableTags
                    .map(
                      (tag) => FilterChip(
                        label: Text(tag),
                        selected: _filterType == 'tag' && _selectedTag == tag,
                        onSelected: (selected) {
                          setState(() {
                            _filterType = 'tag';
                            _selectedTag = tag;
                          });
                          Navigator.pop(context);
                        },
                      ),
                    )
                    .toList(),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('キャンセル'),
            ),
          ],
        );
      },
    );
  }
}
