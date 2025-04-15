import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/block.dart';
import '../../services/block_service.dart';
import '../../services/task_service.dart';
import '../../models/task.dart';

class BlockFormScreen extends StatefulWidget {
  final String userId;
  final Block? block;
  final DateTime? initialDate;

  const BlockFormScreen({
    super.key,
    required this.userId,
    this.block,
    this.initialDate,
  });

  @override
  State<BlockFormScreen> createState() => _BlockFormScreenState();
}

class _BlockFormScreenState extends State<BlockFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final BlockService _blockService = BlockService();
  final TaskService _taskService = TaskService();

  DateTime _startDate = DateTime.now();
  TimeOfDay _startTime = TimeOfDay.now();
  DateTime _endDate = DateTime.now();
  TimeOfDay _endTime = TimeOfDay.now();
  Color _selectedColor = Colors.blue;
  String? _selectedTaskId;
  bool _isRecurring = false;
  RecurrenceFrequency _recurrenceFrequency = RecurrenceFrequency.daily;
  int _recurrenceInterval = 1;
  DateTime? _recurrenceUntil;
  int? _recurrenceCount;
  List<int> _selectedDaysOfWeek = [];
  List<int> _selectedDaysOfMonth = [];
  List<int> _selectedMonthsOfYear = [];
  bool _isLoading = false;

  final List<Color> _availableColors = [
    Colors.red,
    Colors.pink,
    Colors.purple,
    Colors.deepPurple,
    Colors.indigo,
    Colors.blue,
    Colors.lightBlue,
    Colors.cyan,
    Colors.teal,
    Colors.green,
    Colors.lightGreen,
    Colors.lime,
    Colors.yellow,
    Colors.amber,
    Colors.orange,
    Colors.deepOrange,
    Colors.brown,
    Colors.grey,
    Colors.blueGrey,
  ];

  @override
  void initState() {
    super.initState();
    
    // Initialize with existing block data if editing
    if (widget.block != null) {
      _titleController.text = widget.block!.title;
      _descriptionController.text = widget.block!.description ?? '';
      
      // Handle nullable startTime
      if (widget.block!.startTime != null) {
        _startDate = widget.block!.startTime!;
        _startTime = TimeOfDay.fromDateTime(widget.block!.startTime!);
      }
      
      // Handle nullable endTime
      if (widget.block!.endTime != null) {
        _endDate = widget.block!.endTime!;
        _endTime = TimeOfDay.fromDateTime(widget.block!.endTime!);
      }
      
      // Handle nullable color
      if (widget.block!.color != null) {
        _selectedColor = widget.block!.color!;
      }
      
      _selectedTaskId = widget.block!.taskId;
      _isRecurring = widget.block!.isRecurring;
      
      if (widget.block!.recurrenceRule != null) {
        final rule = widget.block!.recurrenceRule!;
        _recurrenceFrequency = rule.frequency;
        _recurrenceInterval = rule.interval;
        _recurrenceUntil = rule.until;
        _recurrenceCount = rule.count;
        _selectedDaysOfWeek = rule.byDayOfWeek ?? [];
        _selectedDaysOfMonth = rule.byDayOfMonth ?? [];
        _selectedMonthsOfYear = rule.byMonthOfYear ?? [];
      }
    } 
    // Initialize with provided date if creating new block
    else if (widget.initialDate != null) {
      _startDate = widget.initialDate!;
      _startTime = TimeOfDay(hour: _startDate.hour, minute: 0);
      
      // Set end time to 1 hour after start time
      final endDateTime = _startDate.add(const Duration(hours: 1));
      _endDate = endDateTime;
      _endTime = TimeOfDay(hour: endDateTime.hour, minute: 0);
    } 
    // Default initialization for new block
    else {
      // Round start time to nearest hour
      final now = DateTime.now();
      _startDate = DateTime(now.year, now.month, now.day);
      _startTime = TimeOfDay(hour: now.hour, minute: 0);
      
      // Set end time to 1 hour after start time
      final endDateTime = now.add(const Duration(hours: 1));
      _endDate = DateTime(endDateTime.year, endDateTime.month, endDateTime.day);
      _endTime = TimeOfDay(hour: endDateTime.hour, minute: 0);
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  // Combine date and time into a single DateTime object
  // This method assumes non-null parameters as it's only called with validated data
  DateTime _combineDateAndTime(DateTime date, TimeOfDay time) {
    return DateTime(
      date.year,
      date.month,
      date.day,
      time.hour,
      time.minute,
    );
  }

  Future<void> _selectStartDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _startDate,
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now().add(const Duration(days: 365 * 5)),
    );
    if (picked != null && picked != _startDate) {
      setState(() {
        _startDate = picked;
        // If end date is before start date, update it
        if (_combineDateAndTime(_endDate, _endTime)
            .isBefore(_combineDateAndTime(_startDate, _startTime))) {
          _endDate = _startDate;
        }
      });
    }
  }

  Future<void> _selectStartTime(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _startTime,
    );
    if (picked != null && picked != _startTime) {
      setState(() {
        _startTime = picked;
        // If end time is before start time on the same day, update it
        if (_startDate.year == _endDate.year &&
            _startDate.month == _endDate.month &&
            _startDate.day == _endDate.day &&
            (_endTime.hour < _startTime.hour ||
                (_endTime.hour == _startTime.hour &&
                    _endTime.minute <= _startTime.minute))) {
          _endTime = TimeOfDay(
            hour: (_startTime.hour + 1) % 24,
            minute: _startTime.minute,
          );
        }
      });
    }
  }

  Future<void> _selectEndDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _endDate,
      firstDate: _startDate,
      lastDate: DateTime.now().add(const Duration(days: 365 * 5)),
    );
    if (picked != null && picked != _endDate) {
      setState(() {
        _endDate = picked;
      });
    }
  }

  Future<void> _selectEndTime(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _endTime,
    );
    if (picked != null && picked != _endTime) {
      setState(() {
        _endTime = picked;
        // If end time is before start time on the same day, update start time
        if (_startDate.year == _endDate.year &&
            _startDate.month == _endDate.month &&
            _startDate.day == _endDate.day &&
            (_endTime.hour < _startTime.hour ||
                (_endTime.hour == _startTime.hour &&
                    _endTime.minute <= _startTime.minute))) {
          _startTime = TimeOfDay(
            hour: (_endTime.hour - 1) >= 0 ? (_endTime.hour - 1) : 23,
            minute: _endTime.minute,
          );
        }
      });
    }
  }

  Future<void> _selectRecurrenceUntil(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _recurrenceUntil ?? DateTime.now().add(const Duration(days: 30)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365 * 5)),
    );
    if (picked != null) {
      setState(() {
        _recurrenceUntil = picked;
        _recurrenceCount = null; // Clear count when until is set
      });
    }
  }

  Future<void> _saveBlock() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      try {
        final startDateTime = _combineDateAndTime(_startDate, _startTime);
        final endDateTime = _combineDateAndTime(_endDate, _endTime);

        // Create recurrence rule if recurring
        RecurrenceRule? recurrenceRule;
        if (_isRecurring) {
          recurrenceRule = RecurrenceRule(
            frequency: _recurrenceFrequency,
            interval: _recurrenceInterval,
            byDayOfWeek: _selectedDaysOfWeek.isNotEmpty ? _selectedDaysOfWeek : null,
            byDayOfMonth: _selectedDaysOfMonth.isNotEmpty ? _selectedDaysOfMonth : null,
            byMonthOfYear: _selectedMonthsOfYear.isNotEmpty ? _selectedMonthsOfYear : null,
            until: _recurrenceUntil,
            count: _recurrenceCount,
          );
        }

        // Create block with properly handled nullable fields
        final block = Block(
          id: widget.block?.id,
          title: _titleController.text.trim(),
          description: _descriptionController.text.trim().isNotEmpty
              ? _descriptionController.text.trim()
              : null,
          // These fields are defined as nullable in Block model
          startTime: startDateTime, // Non-null at this point due to form validation
          endTime: endDateTime, // Non-null at this point due to form validation
          color: _selectedColor, // Non-null due to default initialization
          userId: widget.userId,
          taskId: _selectedTaskId,
          isRecurring: _isRecurring,
          recurrenceRule: recurrenceRule,
        );

        // Check for overlapping blocks
        final hasOverlap = await _blockService.hasOverlappingBlocks(widget.userId, block);
        if (hasOverlap) {
          if (mounted) {
            final proceed = await _showOverlapWarningDialog();
            if (!proceed) {
              setState(() {
                _isLoading = false;
              });
              return;
            }
          }
        }

        if (widget.block == null) {
          await _blockService.addBlock(block);
        } else {
          await _blockService.updateBlock(block);
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

  Future<bool> _showOverlapWarningDialog() async {
    return await showDialog<bool>(
          context: context,
          builder: (context) {
            return AlertDialog(
              title: const Text('時間の重複'),
              content: const Text('この時間帯には既に他のタイムブロックが存在します。それでも保存しますか？'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('キャンセル'),
                ),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('保存'),
                ),
              ],
            );
          },
        ) ??
        false;
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.block != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'タイムブロックを編集' : 'タイムブロックを作成'),
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
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              _buildTimeSelectionFields(),
              const SizedBox(height: 16),
              _buildColorSelection(),
              const SizedBox(height: 16),
              _buildTaskSelection(),
              const SizedBox(height: 16),
              _buildRecurrenceOptions(),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _saveBlock,
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

  Widget _buildTimeSelectionFields() {
    final dateFormat = DateFormat('yyyy/MM/dd');
    final timeFormat = DateFormat('HH:mm');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('開始日時', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: InkWell(
                onTap: () => _selectStartDate(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(dateFormat.format(_startDate)),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: InkWell(
                onTap: () => _selectStartTime(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(timeFormat.format(
                      _combineDateAndTime(_startDate, _startTime))),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        const Text('終了日時', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: InkWell(
                onTap: () => _selectEndDate(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(dateFormat.format(_endDate)),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: InkWell(
                onTap: () => _selectEndTime(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                      timeFormat.format(_combineDateAndTime(_endDate, _endTime))),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          '所要時間: ${_calculateDuration()}',
          style: const TextStyle(fontStyle: FontStyle.italic),
        ),
      ],
    );
  }

  String _calculateDuration() {
    final start = _combineDateAndTime(_startDate, _startTime);
    final end = _combineDateAndTime(_endDate, _endTime);
    final duration = end.difference(start);
    final hours = duration.inHours;
    final minutes = duration.inMinutes % 60;
    return hours > 0
        ? '$hours時間${minutes > 0 ? ' $minutes分' : ''}'
        : '$minutes分';
  }

  Widget _buildColorSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('色', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _availableColors.map((color) {
            return GestureDetector(
              onTap: () {
                setState(() {
                  _selectedColor = color;
                });
              },
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: _selectedColor == color
                        ? Colors.black
                        : Colors.transparent,
                    width: 2,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildTaskSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('関連タスク', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        StreamBuilder<List<Task>>(
          stream: _taskService.getTasks(widget.userId),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }

            if (snapshot.hasError) {
              return Text('エラーが発生しました: ${snapshot.error}');
            }

            final tasks = snapshot.data ?? [];
            
            if (tasks.isEmpty) {
              return const Text('タスクがありません');
            }

            return DropdownButtonFormField<String?>(
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: 'タスクを選択',
              ),
              value: _selectedTaskId,
              items: [
                const DropdownMenuItem<String?>(
                  value: null,
                  child: Text('なし'),
                ),
                ...tasks.map((task) {
                  return DropdownMenuItem<String?>(
                    value: task.id,
                    child: Text(task.title),
                  );
                }).toList(),
              ],
              onChanged: (value) {
                setState(() {
                  _selectedTaskId = value;
                });
              },
            );
          },
        ),
      ],
    );
  }

  Widget _buildRecurrenceOptions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Checkbox(
              value: _isRecurring,
              onChanged: (value) {
                setState(() {
                  _isRecurring = value ?? false;
                });
              },
            ),
            const Text('繰り返し', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        if (_isRecurring) ...[
          const SizedBox(height: 8),
          DropdownButtonFormField<RecurrenceFrequency>(
            decoration: const InputDecoration(
              labelText: '頻度',
              border: OutlineInputBorder(),
            ),
            value: _recurrenceFrequency,
            items: RecurrenceFrequency.values.map((frequency) {
              String label;
              switch (frequency) {
                case RecurrenceFrequency.daily:
                  label = '毎日';
                  break;
                case RecurrenceFrequency.weekly:
                  label = '毎週';
                  break;
                case RecurrenceFrequency.monthly:
                  label = '毎月';
                  break;
                case RecurrenceFrequency.yearly:
                  label = '毎年';
                  break;
              }
              return DropdownMenuItem<RecurrenceFrequency>(
                value: frequency,
                child: Text(label),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                _recurrenceFrequency = value!;
                // Reset specific options when frequency changes
                _selectedDaysOfWeek = [];
                _selectedDaysOfMonth = [];
                _selectedMonthsOfYear = [];
              });
            },
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  decoration: const InputDecoration(
                    labelText: '間隔',
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.number,
                  initialValue: _recurrenceInterval.toString(),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return '間隔を入力してください';
                    }
                    final interval = int.tryParse(value);
                    if (interval == null || interval < 1) {
                      return '1以上の数値を入力してください';
                    }
                    return null;
                  },
                  onChanged: (value) {
                    final interval = int.tryParse(value);
                    if (interval != null && interval > 0) {
                      setState(() {
                        _recurrenceInterval = interval;
                      });
                    }
                  },
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildRecurrenceEndOptions(),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (_recurrenceFrequency == RecurrenceFrequency.weekly)
            _buildWeekdaySelector(),
          if (_recurrenceFrequency == RecurrenceFrequency.monthly)
            _buildMonthDaySelector(),
          if (_recurrenceFrequency == RecurrenceFrequency.yearly)
            _buildMonthSelector(),
        ],
      ],
    );
  }

  Widget _buildRecurrenceEndOptions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('終了', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            Radio<bool>(
              value: true,
              groupValue: _recurrenceUntil != null,
              onChanged: (value) {
                setState(() {
                  if (value!) {
                    _recurrenceUntil = DateTime.now().add(const Duration(days: 30));
                    _recurrenceCount = null;
                  }
                });
              },
            ),
            const Text('日付指定'),
          ],
        ),
        if (_recurrenceUntil != null)
          InkWell(
            onTap: () => _selectRecurrenceUntil(context),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(DateFormat('yyyy/MM/dd').format(_recurrenceUntil!)),
            ),
          ),
        Row(
          children: [
            Radio<bool>(
              value: true,
              groupValue: _recurrenceCount != null,
              onChanged: (value) {
                setState(() {
                  if (value!) {
                    _recurrenceCount = 10;
                    _recurrenceUntil = null;
                  }
                });
              },
            ),
            const Text('回数指定'),
          ],
        ),
        if (_recurrenceCount != null)
          TextFormField(
            decoration: const InputDecoration(
              labelText: '回数',
              border: OutlineInputBorder(),
            ),
            keyboardType: TextInputType.number,
            initialValue: _recurrenceCount.toString(),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return '回数を入力してください';
              }
              final count = int.tryParse(value);
              if (count == null || count < 1) {
                return '1以上の数値を入力してください';
              }
              return null;
            },
            onChanged: (value) {
              final count = int.tryParse(value);
              if (count != null && count > 0) {
                setState(() {
                  _recurrenceCount = count;
                });
              }
            },
          ),
      ],
    );
  }

  Widget _buildWeekdaySelector() {
    final weekdays = [
      {'value': 1, 'label': '月'},
      {'value': 2, 'label': '火'},
      {'value': 3, 'label': '水'},
      {'value': 4, 'label': '木'},
      {'value': 5, 'label': '金'},
      {'value': 6, 'label': '土'},
      {'value': 7, 'label': '日'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('曜日を選択', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 4,
          children: weekdays.map((day) {
            final dayValue = day['value'] as int;
            final isSelected = _selectedDaysOfWeek.contains(dayValue);
            return FilterChip(
              label: Text(day['label'] as String),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  if (selected) {
                    _selectedDaysOfWeek.add(dayValue);
                  } else {
                    _selectedDaysOfWeek.remove(dayValue);
                  }
                });
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildMonthDaySelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('日にちを選択', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 4,
          children: List.generate(31, (index) {
            final day = index + 1;
            final isSelected = _selectedDaysOfMonth.contains(day);
            return FilterChip(
              label: Text('$day'),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  if (selected) {
                    _selectedDaysOfMonth.add(day);
                  } else {
                    _selectedDaysOfMonth.remove(day);
                  }
                });
              },
            );
          }),
        ),
      ],
    );
  }

  Widget _buildMonthSelector() {
    final months = [
      {'value': 1, 'label': '1月'},
      {'value': 2, 'label': '2月'},
      {'value': 3, 'label': '3月'},
      {'value': 4, 'label': '4月'},
      {'value': 5, 'label': '5月'},
      {'value': 6, 'label': '6月'},
      {'value': 7, 'label': '7月'},
      {'value': 8, 'label': '8月'},
      {'value': 9, 'label': '9月'},
      {'value': 10, 'label': '10月'},
      {'value': 11, 'label': '11月'},
      {'value': 12, 'label': '12月'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('月を選択', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 4,
          children: months.map((month) {
            final monthValue = month['value'] as int;
            final isSelected = _selectedMonthsOfYear.contains(monthValue);
            return FilterChip(
              label: Text(month['label'] as String),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  if (selected) {
                    _selectedMonthsOfYear.add(monthValue);
                  } else {
                    _selectedMonthsOfYear.remove(monthValue);
                  }
                });
              },
            );
          }).toList(),
        ),
      ],
    );
  }
}
