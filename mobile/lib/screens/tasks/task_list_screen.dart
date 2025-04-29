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
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                'assets/images/banner.png',
                width: 200,
              ),
              const SizedBox(height: 24),
              const Text(
                'TaskVisionへようこそ',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'NotoSansJP',
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'タスク管理を始めるにはログインしてください',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                  fontFamily: 'NotoSansJP',
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () {
                  Navigator.pushNamed(context, AppRouter.login);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4F46E5),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('ログイン'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('タスク一覧'),
        backgroundColor: const Color(0xFF4F46E5),
        foregroundColor: Colors.white,
        elevation: 0,
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
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TaskFormScreen(userId: _userId!),
            ),
          );
        },
        backgroundColor: const Color(0xFF4F46E5),
        icon: const Icon(Icons.add),
        label: const Text('新規タスク'),
      ),
    );
  }

  Widget _buildFilterChips() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          children: [
            _buildChip('すべて', 'all', Icons.list),
            const SizedBox(width: 12),
            _buildChip('今日', 'today', Icons.today),
            const SizedBox(width: 12),
            _buildChip('期限切れ', 'overdue', Icons.warning_amber),
            const SizedBox(width: 12),
            _buildChip('高優先度', 'high', Icons.priority_high),
            const SizedBox(width: 12),
            _buildChip('完了', 'completed', Icons.check_circle),
          ],
        ),
      ),
    );
  }

  Widget _buildChip(String label, String value, IconData icon) {
    final isSelected = _filterType == value;
    
    return FilterChip(
      label: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: isSelected ? Colors.white : Colors.grey.shade700,
          ),
          const SizedBox(width: 4),
          Text(label),
        ],
      ),
      selected: isSelected,
      showCheckmark: false,
      backgroundColor: Colors.grey.shade100,
      selectedColor: const Color(0xFF4F46E5),
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : Colors.grey.shade800,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(
          color: isSelected ? Colors.transparent : Colors.grey.shade300,
          width: 1,
        ),
      ),
      onSelected: (selected) {
        setState(() {
          _filterType = value;
          _selectedTag = null;
        });
      },
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
          return const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF4F46E5)),
            ),
          );
        }

        if (snapshot.hasError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.error_outline,
                  color: Colors.red,
                  size: 48,
                ),
                const SizedBox(height: 16),
                Text(
                  'エラーが発生しました',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  '${snapshot.error}',
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        final tasks = snapshot.data ?? [];

        if (tasks.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  _getEmptyStateIcon(),
                  color: Colors.grey.shade400,
                  size: 64,
                ),
                const SizedBox(height: 16),
                Text(
                  _getEmptyStateMessage(),
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.grey.shade600,
                    fontFamily: 'NotoSansJP',
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                if (_filterType != 'all')
                  OutlinedButton.icon(
                    onPressed: () {
                      setState(() {
                        _filterType = 'all';
                        _selectedTag = null;
                      });
                    },
                    icon: const Icon(Icons.refresh),
                    label: const Text('すべてのタスクを表示'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF4F46E5),
                      side: const BorderSide(color: Color(0xFF4F46E5)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                  ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: tasks.length,
          itemBuilder: (context, index) {
            final task = tasks[index];
            return _buildTaskItem(task);
          },
        );
      },
    );
  }

  IconData _getEmptyStateIcon() {
    switch (_filterType) {
      case 'today':
        return Icons.event_available;
      case 'overdue':
        return Icons.event_busy;
      case 'high':
        return Icons.priority_high;
      case 'completed':
        return Icons.check_circle_outline;
      case 'tag':
        return Icons.label_outline;
      case 'all':
      default:
        return Icons.task_alt;
    }
  }

  String _getEmptyStateMessage() {
    switch (_filterType) {
      case 'today':
        return '今日のタスクはありません';
      case 'overdue':
        return '期限切れのタスクはありません';
      case 'high':
        return '高優先度のタスクはありません';
      case 'completed':
        return '完了したタスクはありません';
      case 'tag':
        return '$_selectedTag タグのタスクはありません';
      case 'all':
      default:
        return 'タスクがありません\n新しいタスクを追加しましょう';
    }
  }

  Widget _buildTaskItem(Task task) {
    final dueDate = task.dueDate != null
        ? DateFormat('yyyy/MM/dd').format(task.dueDate!)
        : '期限なし';

    Color priorityColor;
    IconData priorityIcon;
    
    switch (task.priority) {
      case TaskPriority.high:
        priorityColor = Colors.red.shade700;
        priorityIcon = Icons.priority_high;
        break;
      case TaskPriority.medium:
        priorityColor = Colors.orange.shade700;
        priorityIcon = Icons.flag;
        break;
      case TaskPriority.low:
        priorityColor = Colors.green.shade700;
        priorityIcon = Icons.low_priority;
        break;
    }

    final bool isOverdue = task.isOverdue();
    final bool isDueToday = task.isDueToday();

    return Dismissible(
      key: Key(task.id),
      background: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: Colors.red.shade700,
          borderRadius: BorderRadius.circular(12),
        ),
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 24),
        child: const Icon(
          Icons.delete_outline,
          color: Colors.white,
          size: 28,
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
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('キャンセル'),
                ),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.red,
                  ),
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
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
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
        margin: const EdgeInsets.symmetric(vertical: 8),
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: task.status == TaskStatus.completed
                ? Colors.grey.shade200
                : isOverdue
                    ? Colors.red.shade100
                    : isDueToday
                        ? Colors.orange.shade100
                        : Colors.transparent,
            width: 1,
          ),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => TaskDetailScreen(taskId: task.id),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Checkbox
                    Transform.scale(
                      scale: 1.2,
                      child: Checkbox(
                        value: task.status == TaskStatus.completed,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                        activeColor: const Color(0xFF4F46E5),
                        onChanged: (value) {
                          final newStatus =
                              value! ? TaskStatus.completed : TaskStatus.notStarted;
                          _taskService.updateTask(task.copyWith(status: newStatus));
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Task content
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            task.title,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              decoration: task.status == TaskStatus.completed
                                  ? TextDecoration.lineThrough
                                  : null,
                              color: task.status == TaskStatus.completed
                                  ? Colors.grey
                                  : Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(
                                Icons.event,
                                size: 14,
                                color: isOverdue
                                    ? Colors.red
                                    : isDueToday
                                        ? Colors.orange
                                        : Colors.grey.shade600,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                dueDate,
                                style: TextStyle(
                                  fontSize: 14,
                                  color: isOverdue
                                      ? Colors.red
                                      : isDueToday
                                          ? Colors.orange
                                          : Colors.grey.shade600,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Icon(
                                priorityIcon,
                                size: 14,
                                color: priorityColor,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                _getPriorityText(task.priority),
                                style: TextStyle(
                                  fontSize: 14,
                                  color: priorityColor,
                                ),
                              ),
                            ],
                          ),
                          if (task.description != null && task.description!.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text(
                                task.description!,
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey.shade700,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          if (task.tags != null && task.tags!.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Wrap(
                                spacing: 6,
                                runSpacing: 6,
                                children: task.tags!
                                    .map((tag) => Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 4,
                                          ),
                                          decoration: BoxDecoration(
                                            color: Colors.grey.shade100,
                                            borderRadius: BorderRadius.circular(12),
                                            border: Border.all(
                                              color: Colors.grey.shade300,
                                            ),
                                          ),
                                          child: Text(
                                            tag,
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey.shade800,
                                            ),
                                          ),
                                        ))
                                    .toList(),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _getPriorityText(TaskPriority priority) {
    switch (priority) {
      case TaskPriority.high:
        return '高';
      case TaskPriority.medium:
        return '中';
      case TaskPriority.low:
        return '低';
    }
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('タスクをフィルタリング'),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildFilterOption('すべてのタスク', 'all', Icons.list),
                _buildFilterOption('今日のタスク', 'today', Icons.today),
                _buildFilterOption('期限切れのタスク', 'overdue', Icons.warning_amber),
                _buildFilterOption('高優先度のタスク', 'high', Icons.priority_high),
                _buildFilterOption('完了したタスク', 'completed', Icons.check_circle),
                const Divider(height: 32),
                const Padding(
                  padding: EdgeInsets.only(left: 16, bottom: 8),
                  child: Text(
                    'タグでフィルタリング',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _availableTags
                      .map(
                        (tag) => FilterChip(
                          label: Text(tag),
                          selected: _filterType == 'tag' && _selectedTag == tag,
                          selectedColor: const Color(0xFF4F46E5).withOpacity(0.2),
                          checkmarkColor: const Color(0xFF4F46E5),
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

  Widget _buildFilterOption(String title, String value, IconData icon) {
    return ListTile(
      title: Text(title),
      leading: Radio<String>(
        value: value,
        groupValue: _filterType,
        activeColor: const Color(0xFF4F46E5),
        onChanged: (value) {
          setState(() {
            _filterType = value!;
            _selectedTag = null;
          });
          Navigator.pop(context);
        },
      ),
      trailing: Icon(icon, color: Colors.grey.shade600),
    );
  }
}
