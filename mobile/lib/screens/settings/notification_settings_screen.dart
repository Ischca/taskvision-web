import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../blocs/notification_bloc.dart';
import '../../services/notification_service.dart';

class NotificationSettingsScreen extends StatelessWidget {
  const NotificationSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('通知設定'),
      ),
      body: BlocBuilder<NotificationBloc, NotificationState>(
        builder: (context, state) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildPermissionSection(context, state),
                const SizedBox(height: 24),
                _buildNotificationTypesSection(context),
                const SizedBox(height: 24),
                _buildReminderSettingsSection(context),
                const SizedBox(height: 24),
                _buildTestNotificationSection(context),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildPermissionSection(BuildContext context, NotificationState state) {
    final notificationBloc = BlocProvider.of<NotificationBloc>(context);
    final hasPermission = state is NotificationPermissionGranted;
    final isLoading = state is NotificationPermissionLoading;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  hasPermission ? Icons.notifications_active : Icons.notifications_off,
                  color: hasPermission ? Colors.green : Colors.red,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '通知権限',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        hasPermission
                            ? '通知権限が許可されています'
                            : '通知権限が許可されていません',
                        style: TextStyle(
                          color: hasPermission ? Colors.green : Colors.red,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'タスクの期限や更新に関する通知を受け取るには、通知権限を許可してください。',
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isLoading
                    ? null
                    : () {
                        notificationBloc.add(
                          const NotificationPermissionRequested(),
                        );
                      },
                child: isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                        ),
                      )
                    : Text(
                        hasPermission ? '権限を再確認' : '通知を許可',
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationTypesSection(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '通知タイプ',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            _buildNotificationTypeSwitch(
              context,
              '期限通知',
              '期限が近づいているタスクの通知',
              true,
              (value) {},
            ),
            const Divider(),
            _buildNotificationTypeSwitch(
              context,
              'タスク更新通知',
              'タスクが更新された時の通知',
              true,
              (value) {},
            ),
            const Divider(),
            _buildNotificationTypeSwitch(
              context,
              'リマインダー通知',
              '設定したリマインダーの通知',
              true,
              (value) {},
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationTypeSwitch(
    BuildContext context,
    String title,
    String subtitle,
    bool value,
    Function(bool) onChanged,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
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
                  subtitle,
                  style: const TextStyle(
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

  Widget _buildReminderSettingsSection(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'リマインダー設定',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            _buildReminderTimingOption(
              context,
              '期限の30分前',
              true,
              (value) {},
            ),
            const Divider(),
            _buildReminderTimingOption(
              context,
              '期限の1時間前',
              true,
              (value) {},
            ),
            const Divider(),
            _buildReminderTimingOption(
              context,
              '期限の1日前',
              false,
              (value) {},
            ),
            const Divider(),
            _buildReminderTimingOption(
              context,
              '期限の2日前',
              false,
              (value) {},
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReminderTimingOption(
    BuildContext context,
    String title,
    bool value,
    Function(bool) onChanged,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: Text(title),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

  Widget _buildTestNotificationSection(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'テスト通知',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            const Text(
              'テスト通知を送信して、通知が正しく機能しているか確認できます。',
              style: TextStyle(fontSize: 12),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  final notificationService = context.read<NotificationService>();
                  notificationService.initialize().then((_) {
                    notificationService.requestPermission().then((hasPermission) {
                      if (hasPermission) {
                        notificationService._showLocalNotification(
                          id: 0,
                          title: 'テスト通知',
                          body: 'これはテスト通知です。通知が正しく機能しています。',
                        );
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('テスト通知を送信しました'),
                          ),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('通知権限が許可されていません'),
                          ),
                        );
                      }
                    });
                  });
                },
                child: const Text('テスト通知を送信'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
