import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../models/block.dart';
import '../../services/block_service.dart';
import '../../routes/app_router.dart';
import 'block_form_screen.dart';
import 'block_detail_screen.dart';

class BlockCalendarScreen extends StatefulWidget {
  const BlockCalendarScreen({super.key});

  @override
  State<BlockCalendarScreen> createState() => _BlockCalendarScreenState();
}

class _BlockCalendarScreenState extends State<BlockCalendarScreen> {
  final BlockService _blockService = BlockService();
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();
  CalendarFormat _calendarFormat = CalendarFormat.week;
  String _viewType = 'calendar'; // 'calendar' or 'timeline'

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
        title: const Text('タイムブロッキング'),
        actions: [
          IconButton(
            icon: Icon(_viewType == 'calendar' ? Icons.view_day : Icons.calendar_month),
            onPressed: () {
              setState(() {
                _viewType = _viewType == 'calendar' ? 'timeline' : 'calendar';
              });
            },
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
          if (_viewType == 'calendar') _buildCalendar(),
          Expanded(
            child: _viewType == 'calendar'
                ? _buildBlocksForDay()
                : _buildTimelineView(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => BlockFormScreen(
                userId: _userId!,
                initialDate: _selectedDay,
              ),
            ),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildCalendar() {
    return TableCalendar(
      firstDay: DateTime.utc(2020, 1, 1),
      lastDay: DateTime.utc(2030, 12, 31),
      focusedDay: _focusedDay,
      calendarFormat: _calendarFormat,
      selectedDayPredicate: (day) {
        return isSameDay(_selectedDay, day);
      },
      onDaySelected: (selectedDay, focusedDay) {
        setState(() {
          _selectedDay = selectedDay;
          _focusedDay = focusedDay;
        });
      },
      onFormatChanged: (format) {
        setState(() {
          _calendarFormat = format;
        });
      },
      onPageChanged: (focusedDay) {
        _focusedDay = focusedDay;
      },
      calendarStyle: const CalendarStyle(
        todayDecoration: BoxDecoration(
          color: Colors.blue,
          shape: BoxShape.circle,
        ),
        selectedDecoration: BoxDecoration(
          color: Colors.indigo,
          shape: BoxShape.circle,
        ),
      ),
      eventLoader: (day) {
        // This would ideally be replaced with a more efficient implementation
        // that doesn't query Firestore for each day
        return [];
      },
    );
  }

  Widget _buildBlocksForDay() {
    return StreamBuilder<List<Block>>(
      stream: _blockService.getBlocksForDay(_userId!, _selectedDay),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(child: Text('エラーが発生しました: ${snapshot.error}'));
        }

        final blocks = snapshot.data ?? [];

        if (blocks.isEmpty) {
          return const Center(child: Text('この日のタイムブロックはありません'));
        }

        // Sort blocks by start time
        blocks.sort((a, b) => a.startTime.compareTo(b.startTime));

        return ListView.builder(
          itemCount: blocks.length,
          itemBuilder: (context, index) {
            final block = blocks[index];
            return _buildBlockItem(block);
          },
        );
      },
    );
  }

  Widget _buildTimelineView() {
    return StreamBuilder<List<Block>>(
      stream: _blockService.getBlocksForDay(_userId!, _selectedDay),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(child: Text('エラーが発生しました: ${snapshot.error}'));
        }

        final blocks = snapshot.data ?? [];

        // Create a timeline from 0:00 to 23:59
        return SingleChildScrollView(
          child: Column(
            children: List.generate(24, (hour) {
              // Filter blocks that overlap with this hour
              final hourBlocks = blocks.where((block) {
                final hourStart = DateTime(
                  _selectedDay.year,
                  _selectedDay.month,
                  _selectedDay.day,
                  hour,
                );
                final hourEnd = hourStart.add(const Duration(hours: 1));
                return block.startTime.isBefore(hourEnd) &&
                    block.endTime.isAfter(hourStart);
              }).toList();

              return _buildTimelineHour(hour, hourBlocks);
            }),
          ),
        );
      },
    );
  }

  Widget _buildTimelineHour(int hour, List<Block> blocks) {
    final hourText = hour.toString().padLeft(2, '0') + ':00';
    
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 60,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Text(
              hourText,
              textAlign: TextAlign.center,
            ),
          ),
        ),
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              border: Border(
                top: BorderSide(
                  color: Colors.grey.shade300,
                  width: 1,
                ),
              ),
            ),
            child: Column(
              children: [
                if (blocks.isEmpty)
                  const SizedBox(height: 60)
                else
                  ...blocks.map((block) => _buildTimelineBlock(hour, block)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTimelineBlock(int hour, Block block) {
    // Calculate the position and height of the block in the timeline
    final hourStart = DateTime(
      _selectedDay.year,
      _selectedDay.month,
      _selectedDay.day,
      hour,
    );
    final hourEnd = hourStart.add(const Duration(hours: 1));

    // Calculate the overlap with this hour
    final blockStart = block.startTime.isAfter(hourStart)
        ? block.startTime
        : hourStart;
    final blockEnd = block.endTime.isBefore(hourEnd) ? block.endTime : hourEnd;

    // Calculate the percentage of the hour that this block takes up
    final hourMinutes = 60;
    final startMinutes = blockStart.hour * 60 + blockStart.minute - hour * 60;
    final endMinutes = blockEnd.hour * 60 + blockEnd.minute - hour * 60;
    final durationMinutes = endMinutes - startMinutes;

    // Convert to percentages
    final topPercentage = startMinutes / hourMinutes;
    final heightPercentage = durationMinutes / hourMinutes;

    return Positioned(
      top: topPercentage * 60, // 60px is the height of an hour
      left: 0,
      right: 0,
      height: heightPercentage * 60,
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => BlockDetailScreen(blockId: block.id),
            ),
          );
        },
        child: Card(
          color: block.color,
          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          child: Padding(
            padding: const EdgeInsets.all(4),
            child: Text(
              block.title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBlockItem(Block block) {
    final startTime = DateFormat('HH:mm').format(block.startTime);
    final endTime = DateFormat('HH:mm').format(block.endTime);
    final duration = block.duration.inMinutes;
    final hours = duration ~/ 60;
    final minutes = duration % 60;
    final durationText = hours > 0
        ? '$hours時間${minutes > 0 ? ' $minutes分' : ''}'
        : '$minutes分';

    return Dismissible(
      key: Key(block.id),
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
              title: const Text('タイムブロックを削除'),
              content: const Text('このタイムブロックを削除してもよろしいですか？'),
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
        _blockService.deleteBlock(block.id);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('タイムブロックを削除しました'),
            action: SnackBarAction(
              label: '元に戻す',
              onPressed: () {
                _blockService.updateBlock(block.copyWith(isDeleted: false));
              },
            ),
          ),
        );
      },
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: ListTile(
          leading: Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: block.color,
              shape: BoxShape.circle,
            ),
          ),
          title: Text(block.title),
          subtitle: Text('$startTime - $endTime ($durationText)'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => BlockDetailScreen(blockId: block.id),
              ),
            );
          },
        ),
      ),
    );
  }
}
