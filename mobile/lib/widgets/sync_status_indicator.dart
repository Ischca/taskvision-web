import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/sync_service.dart';

class SyncStatusIndicator extends StatelessWidget {
  final bool showText;
  final bool showIcon;
  final double iconSize;
  final TextStyle? textStyle;

  const SyncStatusIndicator({
    super.key,
    this.showText = true,
    this.showIcon = true,
    this.iconSize = 16.0,
    this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<SyncService>(
      builder: (context, syncService, child) {
        final status = syncService.status;
        final statusText = syncService.getSyncStatusText();
        final statusIcon = syncService.getSyncStatusIcon();
        final statusColor = syncService.getSyncStatusColor();

        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (showIcon)
              status == SyncStatus.syncing
                  ? SizedBox(
                      width: iconSize,
                      height: iconSize,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(statusColor),
                      ),
                    )
                  : Icon(
                      statusIcon,
                      color: statusColor,
                      size: iconSize,
                    ),
            if (showIcon && showText) const SizedBox(width: 4),
            if (showText)
              Text(
                statusText,
                style: textStyle ??
                    TextStyle(
                      fontSize: 12,
                      color: statusColor,
                    ),
              ),
          ],
        );
      },
    );
  }
}

class SyncStatusButton extends StatelessWidget {
  const SyncStatusButton({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<SyncService>(
      builder: (context, syncService, child) {
        final status = syncService.status;
        final isOffline = syncService.isOffline;
        final statusColor = syncService.getSyncStatusColor();

        return IconButton(
          icon: status == SyncStatus.syncing
              ? SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(statusColor),
                  ),
                )
              : Icon(
                  syncService.getSyncStatusIcon(),
                  color: statusColor,
                ),
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
          tooltip: isOffline
              ? 'オフラインモード'
              : status == SyncStatus.syncing
                  ? '同期中...'
                  : '同期する',
        );
      },
    );
  }
}
