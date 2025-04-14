import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'firebase/firebase_options.dart';
import 'services/sync_service.dart';
import 'blocs/auth_bloc.dart';
import 'routes/app_router.dart';
import 'widgets/sync_status_indicator.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const TaskVisionApp());
}

class TaskVisionApp extends StatelessWidget {
  const TaskVisionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => SyncService()),
        BlocProvider(create: (_) => AuthBloc()),
      ],
      child: MaterialApp(
        title: 'TaskVision',
        theme: ThemeData(
          primarySwatch: Colors.indigo,
          useMaterial3: true,
          fontFamily: 'NotoSansJP',
        ),
        darkTheme: ThemeData(
          brightness: Brightness.dark,
          primarySwatch: Colors.indigo,
          useMaterial3: true,
          fontFamily: 'NotoSansJP',
        ),
        themeMode: ThemeMode.system,
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('ja', ''),
          Locale('en', ''),
        ],
        locale: const Locale('ja', ''),
        onGenerateRoute: AppRouter.generateRoute,
        initialRoute: AppRouter.home,
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authBloc = BlocProvider.of<AuthBloc>(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('TaskVision'),
        actions: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: SyncStatusIndicator(
              showText: false,
              iconSize: 20,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.pushNamed(context, AppRouter.settings);
            },
          ),
        ],
      ),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is AuthLoadingState) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is AuthAuthenticatedState) {
            return _buildMainContent(context);
          } else {
            return _buildWelcomeContent(context);
          }
        },
      ),
    );
  }
  
  Widget _buildMainContent(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'ようこそ、TaskVisionへ！',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildFeatureButton(
                      context,
                      Icons.task_alt,
                      'タスク管理',
                      () => Navigator.pushNamed(context, AppRouter.taskList),
                    ),
                    const SizedBox(width: 16),
                    _buildFeatureButton(
                      context,
                      Icons.calendar_month,
                      'タイムブロッキング',
                      () => Navigator.pushNamed(context, AppRouter.blockCalendar),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        Consumer<SyncService>(
          builder: (context, syncService, child) {
            if (syncService.status == SyncStatus.offline) {
              return Container(
                color: Colors.orange.shade100,
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                child: Row(
                  children: [
                    const Icon(Icons.cloud_off, color: Colors.orange),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'オフラインモードです。変更はオンラインに戻ったときに同期されます。',
                        style: TextStyle(fontSize: 12),
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.pushNamed(context, AppRouter.settings);
                      },
                      child: const Text('詳細'),
                    ),
                  ],
                ),
              );
            }
            return const SizedBox.shrink();
          },
        ),
      ],
    );
  }
  
  Widget _buildWelcomeContent(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.check_circle_outline,
            size: 100,
            color: Colors.indigo,
          ),
          const SizedBox(height: 24),
          const Text(
            'TaskVision',
            style: TextStyle(
              fontSize: 28, 
              fontWeight: FontWeight.bold
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'タスク管理とタイムブロッキングを効率化するアプリ',
            style: TextStyle(fontSize: 16),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 48),
          ElevatedButton(
            onPressed: () {
              Navigator.pushNamed(context, AppRouter.login);
            },
            child: const Padding(
              padding: EdgeInsets.symmetric(
                horizontal: 24, 
                vertical: 12
              ),
              child: Text('はじめる'),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildFeatureButton(
    BuildContext context,
    IconData icon,
    String label,
    VoidCallback onPressed,
  ) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(
          horizontal: 24,
          vertical: 16,
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 48),
          const SizedBox(height: 8),
          Text(label),
        ],
      ),
    );
  }
}
