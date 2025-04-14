import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import '../../blocs/app_bloc.dart';
import '../../blocs/auth_bloc.dart';
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
          
          _buildSectionHeader(context, 'アプリ設定'),
          
          // テーマ設定
          BlocBuilder<AppBloc, AppState>(
            builder: (context, state) {
              return _buildSettingItem(
                context,
                icon: Icons.color_lens,
                title: 'テーマ',
                subtitle: 'アプリの外観をカスタマイズ',
                trailing: Switch(
                  value: state.isDarkMode,
                  onChanged: (value) {
                    context.read<AppBloc>().add(ThemeChanged(value));
                  },
                ),
                onTap: () {},
              );
            },
          ),
          
          // 言語設定
          BlocBuilder<AppBloc, AppState>(
            builder: (context, state) {
              return _buildSettingItem(
                context,
                icon: Icons.language,
                title: '言語',
                subtitle: state.locale == 'ja' ? '日本語' : 'English',
                onTap: () {
                  showDialog(
                    context: context,
                    builder: (context) {
                      return AlertDialog(
                        title: const Text('言語を選択'),
                        content: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            ListTile(
                              title: const Text('日本語'),
                              onTap: () {
                                context.read<AppBloc>().add(const LocaleChanged('ja'));
                                Navigator.pop(context);
                              },
                            ),
                            ListTile(
                              title: const Text('English'),
                              onTap: () {
                                context.read<AppBloc>().add(const LocaleChanged('en'));
                                Navigator.pop(context);
                              },
                            ),
                          ],
                        ),
                      );
                    },
                  );
                },
              );
            },
          ),
          
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
          
          // アカウント情報
          BlocBuilder<AuthBloc, AuthState>(
            builder: (context, state) {
              if (state is Authenticated) {
                return _buildSettingItem(
                  context,
                  icon: Icons.account_circle,
                  title: 'アカウント',
                  subtitle: state.user.email ?? '',
                  onTap: () {},
                );
              }
              return const SizedBox.shrink();
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
          
          // ログアウトボタン
          BlocBuilder<AuthBloc, AuthState>(
            builder: (context, state) {
              if (state is Authenticated) {
                return Padding(
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
                );
              }
              return const SizedBox.shrink();
            },
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
                context.read<AuthBloc>().add(SignOutRequested());
                Navigator.of(context).pop();
              },
              child: const Text('ログアウト'),
            ),
          ],
        );
      },
    );
  }
}
