import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/sync_service.dart';
import 'sync_settings_screen.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('設定'),
      ),
      body: ListView(
        children: [
          _buildSectionHeader(context, '同期'),
          _buildSettingItem(
            context,
            icon: Icons.sync,
            title: 'データ同期',
            subtitle: '同期設定とステータスを管理',
            trailing: Consumer<SyncService>(
              builder: (context, syncService, child) {
                return Icon(
                  syncService.getSyncStatusIcon(),
                  color: syncService.getSyncStatusColor(),
                );
              },
            ),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const SyncSettingsScreen(),
                ),
              );
            },
          ),
          _buildSectionHeader(context, 'アカウント'),
          _buildSettingItem(
            context,
            icon: Icons.person,
            title: 'プロフィール',
            subtitle: 'ユーザー情報の編集',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('この機能は現在開発中です'),
                ),
              );
            },
          ),
          _buildSettingItem(
            context,
            icon: Icons.security,
            title: 'セキュリティ',
            subtitle: 'パスワードとセキュリティ設定',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('この機能は現在開発中です'),
                ),
              );
            },
          ),
          _buildSectionHeader(context, 'アプリ設定'),
          _buildSettingItem(
            context,
            icon: Icons.notifications,
            title: '通知',
            subtitle: '通知設定の管理',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('この機能は現在開発中です'),
                ),
              );
            },
          ),
          _buildSettingItem(
            context,
            icon: Icons.color_lens,
            title: 'テーマ',
            subtitle: 'アプリの外観をカスタマイズ',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('この機能は現在開発中です'),
                ),
              );
            },
          ),
          _buildSettingItem(
            context,
            icon: Icons.language,
            title: '言語',
            subtitle: 'アプリの言語を変更',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('この機能は現在開発中です'),
                ),
              );
            },
          ),
          _buildSectionHeader(context, 'その他'),
          _buildSettingItem(
            context,
            icon: Icons.help,
            title: 'ヘルプとサポート',
            subtitle: 'よくある質問と問い合わせ',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('この機能は現在開発中です'),
                ),
              );
            },
          ),
          _buildSettingItem(
            context,
            icon: Icons.info,
            title: 'アプリについて',
            subtitle: 'バージョン情報とライセンス',
            onTap: () {
              _showAboutDialog(context);
            },
          ),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: OutlinedButton(
              onPressed: () {
                _showLogoutConfirmationDialog(context);
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
              ),
              child: const Text('ログアウト'),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Theme.of(context).colorScheme.primary,
        ),
      ),
    );
  }

  Widget _buildSettingItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    Widget? trailing,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: trailing ?? const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('TaskVisionについて'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('バージョン: 1.0.0'),
              const SizedBox(height: 8),
              const Text('タスク管理とタイムブロッキングを効率化するアプリ'),
              const SizedBox(height: 16),
              const Text(
                '© 2025 TaskVision',
                style: TextStyle(fontSize: 12),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('閉じる'),
            ),
          ],
        );
      },
    );
  }

  void _showLogoutConfirmationDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('ログアウト'),
          content: const Text('本当にログアウトしますか？'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('キャンセル'),
            ),
            TextButton(
              onPressed: () {
                // Implement logout logic here
                Navigator.of(context).pop();
                Navigator.of(context).pushReplacementNamed('/login');
              },
              child: const Text('ログアウト'),
            ),
          ],
        );
      },
    );
  }
}
