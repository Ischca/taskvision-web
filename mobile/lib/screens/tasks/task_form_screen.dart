import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/task.dart';
import '../../services/task_service.dart';

class TaskFormScreen extends StatefulWidget {
  final String userId;
  final Task? task;

  const TaskFormScreen({
    super.key,
    required this.userId,
    this.task,
  });

  @override
  State<TaskFormScreen> createState() => _TaskFormScreenState();
}

class _TaskFormScreenState extends State<TaskFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final TaskService _taskService = TaskService();

  DateTime? _dueDate;
  TimeOfDay? _dueTime;
  TaskPriority _priority = TaskPriority.medium;
  TaskStatus _status = TaskStatus.notStarted;
  final List<String> _selectedTags = [];
  final List<String> _availableTags = ['仕事', '個人', '買い物', '勉強', 'その他'];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.task != null) {
      _titleController.text = widget.task!.title;
      _descriptionController.text = widget.task!.description ?? '';
      _dueDate = widget.task!.dueDate;
      if (_dueDate != null) {
        _dueTime = TimeOfDay.fromDateTime(_dueDate!);
      }
      _priority = widget.task!.priority;
      _status = widget.task!.status;
      if (widget.task!.tags != null) {
        _selectedTags.addAll(widget.task!.tags!);
      }
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _dueDate ?? DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now().add(const Duration(days: 365 * 5)),
    );
    if (picked != null && picked != _dueDate) {
      setState(() {
        _dueDate = DateTime(
          picked.year,
          picked.month,
          picked.day,
          _dueTime?.hour ?? 0,
          _dueTime?.minute ?? 0,
        );
      });
    }
  }

  Future<void> _selectTime(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _dueTime ?? TimeOfDay.now(),
    );
    if (picked != null && picked != _dueTime) {
      setState(() {
        _dueTime = picked;
        if (_dueDate != null) {
          _dueDate = DateTime(
            _dueDate!.year,
            _dueDate!.month,
            _dueDate!.day,
            picked.hour,
            picked.minute,
          );
        } else {
          final now = DateTime.now();
          _dueDate = DateTime(
            now.year,
            now.month,
            now.day,
            picked.hour,
            picked.minute,
          );
        }
      });
    }
  }

  Future<void> _saveTask() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      try {
        final task = Task(
          id: widget.task?.id,
          title: _titleController.text.trim(),
          description: _descriptionController.text.trim(),
          createdAt: widget.task?.createdAt,
          dueDate: _dueDate,
          priority: _priority,
          status: _status,
          userId: widget.userId,
          tags: _selectedTags.isEmpty ? null : _selectedTags,
        );

        if (widget.task == null) {
          await _taskService.addTask(task);
        } else {
          await _taskService.updateTask(task);
        }

        if (mounted) {
          Navigator.pop(context);
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('エラーが発生しました: $e'),
            backgroundColor: Colors.red,
          ),
        );
      } finally {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.task != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'タスクを編集' : 'タスクを作成'),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'タイトル',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'タイトルを入力してください';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: '説明',
                  border: OutlineInputBorder(),
                  alignLabelWithHint: true,
                ),
                maxLines: 5,
              ),
              const SizedBox(height: 16),
              _buildDueDateField(),
              const SizedBox(height: 16),
              _buildPriorityField(),
              const SizedBox(height: 16),
              _buildStatusField(),
              const SizedBox(height: 16),
              _buildTagsField(),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _saveTask,
                  child: _isLoading
                      ? const CircularProgressIndicator()
                      : Text(isEditing ? '更新' : '作成'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDueDateField() {
    final dateFormat = DateFormat('yyyy/MM/dd');
    final timeFormat = DateFormat('HH:mm');
    final dueDateText = _dueDate != null
        ? '${dateFormat.format(_dueDate!)} ${timeFormat.format(_dueDate!)}'
        : '期限なし';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('期限'),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(dueDateText),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.calendar_today),
              onPressed: () => _selectDate(context),
            ),
            IconButton(
              icon: const Icon(Icons.access_time),
              onPressed: () => _selectTime(context),
            ),
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                setState(() {
                  _dueDate = null;
                  _dueTime = null;
                });
              },
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPriorityField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('優先度'),
        const SizedBox(height: 8),
        SegmentedButton<TaskPriority>(
          segments: const [
            ButtonSegment<TaskPriority>(
              value: TaskPriority.low,
              label: Text('低'),
              icon: Icon(Icons.arrow_downward),
            ),
            ButtonSegment<TaskPriority>(
              value: TaskPriority.medium,
              label: Text('中'),
              icon: Icon(Icons.remove),
            ),
            ButtonSegment<TaskPriority>(
              value: TaskPriority.high,
              label: Text('高'),
              icon: Icon(Icons.arrow_upward),
            ),
          ],
          selected: {_priority},
          onSelectionChanged: (Set<TaskPriority> newSelection) {
            setState(() {
              _priority = newSelection.first;
            });
          },
        ),
      ],
    );
  }

  Widget _buildStatusField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('ステータス'),
        const SizedBox(height: 8),
        SegmentedButton<TaskStatus>(
          segments: const [
            ButtonSegment<TaskStatus>(
              value: TaskStatus.notStarted,
              label: Text('未着手'),
              icon: Icon(Icons.not_started),
            ),
            ButtonSegment<TaskStatus>(
              value: TaskStatus.inProgress,
              label: Text('進行中'),
              icon: Icon(Icons.play_arrow),
            ),
            ButtonSegment<TaskStatus>(
              value: TaskStatus.completed,
              label: Text('完了'),
              icon: Icon(Icons.check),
            ),
          ],
          selected: {_status},
          onSelectionChanged: (Set<TaskStatus> newSelection) {
            setState(() {
              _status = newSelection.first;
            });
          },
        ),
      ],
    );
  }

  Widget _buildTagsField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('タグ'),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 4,
          children: _availableTags.map((tag) {
            final isSelected = _selectedTags.contains(tag);
            return FilterChip(
              label: Text(tag),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  if (selected) {
                    _selectedTags.add(tag);
                  } else {
                    _selectedTags.remove(tag);
                  }
                });
              },
            );
          }).toList(),
        ),
        const SizedBox(height: 8),
        TextButton.icon(
          onPressed: _showAddTagDialog,
          icon: const Icon(Icons.add),
          label: const Text('カスタムタグを追加'),
        ),
      ],
    );
  }

  void _showAddTagDialog() {
    final textController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('カスタムタグを追加'),
          content: TextField(
            controller: textController,
            decoration: const InputDecoration(
              labelText: 'タグ名',
            ),
            autofocus: true,
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('キャンセル'),
            ),
            TextButton(
              onPressed: () {
                final tagName = textController.text.trim();
                if (tagName.isNotEmpty) {
                  setState(() {
                    if (!_availableTags.contains(tagName)) {
                      _availableTags.add(tagName);
                    }
                    if (!_selectedTags.contains(tagName)) {
                      _selectedTags.add(tagName);
                    }
                  });
                }
                Navigator.pop(context);
              },
              child: const Text('追加'),
            ),
          ],
        );
      },
    );
  }
}
