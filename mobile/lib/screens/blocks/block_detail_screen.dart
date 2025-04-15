import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/block.dart';
import '../../services/block_service.dart';
import 'block_form_screen.dart';

class BlockDetailScreen extends StatelessWidget {
  final String blockId;
  final BlockService _blockService = BlockService();

  BlockDetailScreen({super.key, required this.blockId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('タイムブロック詳細'),
        actions: [
          StreamBuilder<Block?>(
            stream: _blockService.getBlock(blockId),
            builder: (context, snapshot) {
              if (!snapshot.hasData || snapshot.data == null) {
                return const SizedBox.shrink();
              }
              
              final block = snapshot.data!;
              
              return IconButton(
                icon: const Icon(Icons.edit),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => BlockFormScreen(
                        userId: block.userId,
                        block: block,
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
      body: StreamBuilder<Block?>(
        stream: _blockService.getBlock(blockId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('エラーが発生しました: ${snapshot.error}'));
          }

          if (!snapshot.hasData || snapshot.data == null) {
            return const Center(child: Text('タイムブロックが見つかりません'));
          }

          final block = snapshot.data!;
          return _buildBlockDetails(context, block);
        },
      ),
    );
  }

  Widget _buildBlockDetails(BuildContext context, Block block) {
    final startTime = block.startTime != null 
        ? DateFormat('yyyy年MM月dd日 HH:mm').format(block.startTime!)
        : "未設定";
    final endTime = block.endTime != null 
        ? DateFormat('yyyy年MM月dd日 HH:mm').format(block.endTime!)
        : "未設定";
    final duration = block.startTime != null && block.endTime != null
        ? block.endTime!.difference(block.startTime!).inMinutes
        : 0;
    final hours = duration ~/ 60;
    final minutes = duration % 60;
    final durationText = hours > 0
        ? '$hours時間${minutes > 0 ? ' $minutes分' : ''}'
        : '$minutes分';

    String? recurrenceText;
    if (block.isRecurring && block.recurrenceRule != null) {
      final rule = block.recurrenceRule!;
      String frequency;
      switch (rule.frequency) {
        case RecurrenceFrequency.daily:
          frequency = '毎日';
          break;
        case RecurrenceFrequency.weekly:
          frequency = '毎週';
          break;
        case RecurrenceFrequency.monthly:
          frequency = '毎月';
          break;
        case RecurrenceFrequency.yearly:
          frequency = '毎年';
          break;
      }
      
      if (rule.interval > 1) {
        frequency = '$frequency (${rule.interval}回ごと)';
      }
      
      recurrenceText = frequency;
      
      if (rule.until != null) {
        final untilDate = DateFormat('yyyy年MM月dd日').format(rule.until!);
        recurrenceText = '$recurrenceText ($untilDateまで)';
      } else if (rule.count != null) {
        recurrenceText = '$recurrenceText (${rule.count}回)';
      }
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
                      Container(
                        width: 16,
                        height: 16,
                        decoration: BoxDecoration(
                          color: block.color ?? Colors.grey,
                          shape: BoxShape.circle,
                        ),
                        margin: const EdgeInsets.only(right: 8),
                      ),
                      Expanded(
                        child: Text(
                          block.title,
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                      ),
                    ],
                  ),
                  const Divider(),
                  if (block.description != null && block.description!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    const Text(
                      '説明',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(block.description!),
                    const SizedBox(height: 16),
                  ],
                  _buildInfoRow('開始時間', startTime),
                  _buildInfoRow('終了時間', endTime),
                  _buildInfoRow('所要時間', durationText),
                  if (block.taskId != null) _buildInfoRow('関連タスク', block.taskId!),
                  if (recurrenceText != null) _buildInfoRow('繰り返し', recurrenceText),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () {
              _showDeleteConfirmationDialog(context, block);
            },
            icon: const Icon(Icons.delete),
            label: const Text('タイムブロックを削除'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$label: ',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  void _showDeleteConfirmationDialog(BuildContext context, Block block) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('タイムブロックを削除'),
          content: const Text('このタイムブロックを削除してもよろしいですか？'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('キャンセル'),
            ),
            TextButton(
              onPressed: () {
                _blockService.deleteBlock(block.id);
                Navigator.of(context).pop();
                Navigator.of(context).pop();
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
              child: const Text('削除'),
            ),
          ],
        );
      },
    );
  }
}
