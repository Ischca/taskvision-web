import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../blocs/app_bloc.dart';
import '../../blocs/auth_bloc.dart';

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
          // テーマ設定
          BlocBuilder<AppBloc, AppState>(
            builder: (context, state) {
              return SwitchListTile(
                title: const Text('ダークモード'),
                value: state.isDarkMode,
                onChanged: (value) {
                  context.read<AppBloc>().add(ThemeChanged(value));
                },
              );
            },
          ),
          
          // 言語設定
          BlocBuilder<AppBloc, AppState>(
            builder: (context, state) {
              return ListTile(
                title: const Text('言語'),
                subtitle: Text(state.locale == 'ja' ? '日本語' : 'English'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
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
          
          const Divider(),
          
          // アカウント設定
          BlocBuilder<AuthBloc, AuthState>(
            builder: (context, state) {
              if (state is Authenticated) {
                return Column(
                  children: [
                    ListTile(
                      title: const Text('アカウント'),
                      subtitle: Text(state.user.email ?? ''),
                    ),
                    ListTile(
                      title: const Text('ログアウト'),
                      leading: const Icon(Icons.logout),
                      onTap: () {
                        context.read<AuthBloc>().add(SignOutRequested());
                      },
                    ),
                  ],
                );
              }
              return const SizedBox.shrink();
            },
          ),
          
          const Divider(),
          
          // アプリ情報
          ListTile(
            title: const Text('アプリについて'),
            onTap: () {
              showAboutDialog(
                context: context,
                applicationName: 'TaskVision',
                applicationVersion: '1.0.0',
                applicationLegalese: '© 2025 TaskVision',
              );
            },
          ),
        ],
      ),
    );
  }
}
