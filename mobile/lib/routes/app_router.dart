import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/auth_bloc.dart';
import '../screens/home_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/auth/password_reset_screen.dart';
import '../screens/tasks/task_list_screen.dart';
import '../screens/tasks/task_detail_screen.dart';
import '../screens/tasks/task_form_screen.dart';
import '../screens/blocks/block_calendar_screen.dart';
import '../screens/blocks/block_detail_screen.dart';
import '../screens/blocks/block_form_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../screens/settings/notification_settings_screen.dart';

class AppRouter {
  // Route names
  static const String home = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String passwordReset = '/password-reset';
  static const String tasks = '/tasks';
  static const String taskDetail = '/tasks/detail';
  static const String taskForm = '/tasks/form';
  static const String blocks = '/blocks';
  static const String blockDetail = '/blocks/detail';
  static const String blockForm = '/blocks/form';
  static const String settings = '/settings';
  static const String notificationSettings = '/notification-settings';

  // Route generator
  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case home:
        return MaterialPageRoute(
          builder: (_) => BlocBuilder<AuthBloc, AuthState>(
            builder: (context, state) {
              if (state is Authenticated) {
                return const TaskListScreen();
              }
              return const HomeScreen();
            },
          ),
        );
      case login:
        return MaterialPageRoute(
          builder: (_) => const LoginScreen(),
        );
      case register:
        return MaterialPageRoute(
          builder: (_) => const RegisterScreen(),
        );
      case passwordReset:
        return MaterialPageRoute(
          builder: (_) => const PasswordResetScreen(),
        );
      case tasks:
        return MaterialPageRoute(
          builder: (_) => const TaskListScreen(),
        );
      case taskDetail:
        final args = settings.arguments as Map<String, dynamic>?;
        final taskId = args?['taskId'] as String?;
        if (taskId == null) {
          return _errorRoute('タスクIDが必要です');
        }
        return MaterialPageRoute(
          builder: (_) => TaskDetailScreen(taskId: taskId),
        );
      case taskForm:
        final args = settings.arguments as Map<String, dynamic>?;
        final userId = args?['userId'] as String?;
        final task = args?['task'];
        if (userId == null) {
          return _errorRoute('ユーザーIDが必要です');
        }
        return MaterialPageRoute(
          builder: (_) => TaskFormScreen(userId: userId, task: task),
        );
      case blocks:
        return MaterialPageRoute(
          builder: (_) => const BlockCalendarScreen(),
        );
      case blockDetail:
        final args = settings.arguments as Map<String, dynamic>?;
        final blockId = args?['blockId'] as String?;
        if (blockId == null) {
          return _errorRoute('ブロックIDが必要です');
        }
        return MaterialPageRoute(
          builder: (_) => BlockDetailScreen(blockId: blockId),
        );
      case blockForm:
        final args = settings.arguments as Map<String, dynamic>?;
        final userId = args?['userId'] as String?;
        final block = args?['block'];
        final initialDate = args?['initialDate'] as DateTime?;
        if (userId == null) {
          return _errorRoute('ユーザーIDが必要です');
        }
        return MaterialPageRoute(
          builder: (_) => BlockFormScreen(
            userId: userId,
            block: block,
            initialDate: initialDate,
          ),
        );
      case settings:
        return MaterialPageRoute(
          builder: (_) => const SettingsScreen(),
        );
      case notificationSettings:
        return MaterialPageRoute(
          builder: (_) => const NotificationSettingsScreen(),
        );
      default:
        return _errorRoute('指定されたルートが見つかりません: ${settings.name}');
    }
  }

  // Error route
  static Route<dynamic> _errorRoute(String message) {
    return MaterialPageRoute(
      builder: (_) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('エラー'),
          ),
          body: Center(
            child: Text(message),
          ),
        );
      },
    );
  }
}
