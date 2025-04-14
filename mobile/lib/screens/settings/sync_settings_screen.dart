import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/sync_service.dart';
import '../../widgets/sync_status_widget.dart';

class SyncSettingsScreen extends StatelessWidget {
  const SyncSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('同期設定'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SyncStatusWidget(),
            const SizedBox(height: 24),
            const Text(
              '同期設定',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            _buildSyncSettingCard(
              context,
              title: 'オフラインモード',
              description: 'オフラインモードでは、インターネット接続がなくてもアプリを使用できます。変更はデバイスに保存され、オンラインに戻ったときに同期されます。',
              icon: Icons.cloud_off,
              trailing: Consumer<SyncService>(
                builder: (context, syncService, child) {
                  return Text(
                    syncService.isOffline ? 'オン' : 'オフ',
                    style: TextStyle(
                      color: syncService.isOffline ? Colors.orange : Colors.green,
                      fontWeight: FontWeight.bold,
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            _buildSyncSettingCard(
              context,
              title: '自動同期',
              description: 'アプリが起動したとき、またはオンラインに戻ったときに自動的にデータを同期します。',
              icon: Icons.sync,
              trailing: Switch(
                value: true, // This would be connected to a real setting
                onChanged: (value) {
                  // This would update a real setting
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('この機能は現在開発中です'),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              '同期ステータス',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            _buildSyncStatusCard(context),
            const SizedBox(height: 24),
            const Text(
              'トラブルシューティング',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            _buildTroubleshootingCard(context),
          ],
        ),
      ),
    );
  }

  Widget _buildSyncSettingCard(
    BuildContext context, {
    required String title,
    required String description,
    required IconData icon,
    required Widget trailing,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, size: 24),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: const TextStyle(fontSize: 12),
                  ),
                ],
              ),
            ),
            trailing,
          ],
        ),
      ),
    );
  }

  Widget _buildSyncStatusCard(BuildContext context) {
    return Consumer<SyncService>(
      builder: (context, syncService, child) {
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    syncService.status == SyncStatus.syncing
                        ? SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                  syncService.getSyncStatusColor()),
                            ),
                          )
                        : Icon(
                            syncService.getSyncStatusIcon(),
                            color: syncService.getSyncStatusColor(),
                            size: 24,
                          ),
                    const SizedBox(width: 16),
                    Text(
                      syncService.getSyncStatusText(),
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: syncService.getSyncStatusColor(),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: syncService.isOffline ||
                          syncService.status == SyncStatus.syncing
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
                  icon: const Icon(Icons.sync),
                  label: const Text('今すぐ同期'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTroubleshootingCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '同期の問題が発生した場合',
              style: TextStyle(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '1. インターネット接続を確認してください。\n'
              '2. アプリを再起動してみてください。\n'
              '3. それでも問題が解決しない場合は、以下のボタンをタップしてデータをリセットしてください。',
              style: TextStyle(fontSize: 12),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () {
                _showResetConfirmationDialog(context);
              },
              icon: const Icon(Icons.refresh),
              label: const Text('同期状態をリセット'),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showResetConfirmationDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('同期状態をリセット'),
          content: const Text(
            '同期状態をリセットすると、現在のオフラインデータが失われる可能性があります。続行しますか？',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('キャンセル'),
            ),
            TextButton(
              onPressed: () {
                // This would reset the sync state
                final syncService = Provider.of<SyncService>(context, listen: false);
                syncService.syncData();
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('同期状態をリセットしました'),
                  ),
                );
              },
              child: const Text('リセット'),
              style: TextButton.styleFrom(
                foregroundColor: Colors.red,
              ),
            ),
          ],
        );
      },
    );
  }
}
