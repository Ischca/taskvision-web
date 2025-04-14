import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/sync_service.dart';

class SyncStatusWidget extends StatelessWidget {
  final bool mini;

  const SyncStatusWidget({
    super.key,
    this.mini = false,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<SyncService>(
      builder: (context, syncService, child) {
        final status = syncService.status;
        final statusText = syncService.getSyncStatusText();
        final statusIcon = syncService.getSyncStatusIcon();
        final statusColor = syncService.getSyncStatusColor();
        final isOffline = syncService.isOffline;

        if (mini) {
          return IconButton(
            icon: status == SyncStatus.syncing
                ? SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(statusColor),
                    ),
                  )
                : Icon(
                    statusIcon,
                    color: statusColor,
                    size: 18,
                  ),
            onPressed: isOffline || status == SyncStatus.syncing
                ? null
                : () => syncService.syncData(),
            tooltip: statusText,
            iconSize: 18,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(
              minWidth: 24,
              minHeight: 24,
            ),
          );
        }

        return Card(
          margin: const EdgeInsets.all(8),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    status == SyncStatus.syncing
                        ? SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(statusColor),
                            ),
                          )
                        : Icon(
                            statusIcon,
                            color: statusColor,
                            size: 24,
                          ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            statusText,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: statusColor,
                            ),
                          ),
                          if (syncService.errorMessage != null)
                            Text(
                              syncService.errorMessage!,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.red,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (isOffline)
                  const Text(
                    'オフラインモードでは変更がローカルに保存され、オンラインに戻ったときに同期されます。',
                    style: TextStyle(fontSize: 12),
                  )
                else if (status == SyncStatus.error)
                  const Text(
                    '同期エラーが発生しました。後ほど再試行してください。',
                    style: TextStyle(fontSize: 12),
                  ),
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: isOffline || status == SyncStatus.syncing
                      ? null
                      : () {
                          syncService.syncData();
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('同期を開始しました'),
                              duration: Duration(seconds: 2),
                            ),
                          );
                        },
                  child: const Text('今すぐ同期'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
