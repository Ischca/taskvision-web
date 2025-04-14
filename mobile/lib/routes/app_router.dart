import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/auth_bloc.dart';
import '../screens/home_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/tasks/task_list_screen.dart';
import '../screens/blocks/block_calendar_screen.dart';
import '../screens/settings/settings_screen.dart';

class AppRouter {
  static const String home = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String tasks = '/tasks';
  static const String blocks = '/blocks';
  static const String settings = '/settings';

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
      case tasks:
        return MaterialPageRoute(
          builder: (_) => const TaskListScreen(),
        );
      case blocks:
        return MaterialPageRoute(
          builder: (_) => const BlockCalendarScreen(),
        );
      case settings:
        return MaterialPageRoute(
          builder: (_) => const SettingsScreen(),
        );
      default:
        return MaterialPageRoute(
          builder: (_) => const Scaffold(
            body: Center(
              child: Text('ページが見つかりません'),
            ),
          ),
        );
    }
  }
}
