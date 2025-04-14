import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:provider/provider.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'firebase/firebase_options.dart';
import 'services/notification_service.dart';
import 'services/sync_service.dart';
import 'blocs/notification_bloc.dart';
import 'blocs/auth_bloc.dart';
import 'routes/app_router.dart';
import 'widgets/sync_status_indicator.dart';

// バックグラウンド通知を処理するハンドラー
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // バックグラウンド通知の処理
  print('バックグラウンド通知を受信: ${message.messageId}');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Firebaseの初期化
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  // FCMのバックグラウンドハンドラーを設定
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  
  // タイムゾーンデータの初期化（ローカル通知のスケジューリング用）
  tz.initializeTimeZones();
  
  runApp(const TaskVisionApp());
}

class TaskVisionApp extends StatelessWidget {
  const TaskVisionApp({super.key});

  @override
  Widget build(BuildContext context) {
    // 通知サービスのインスタンスを作成
    final notificationService = NotificationService();
    
    return MultiProvider(
      providers: [
        // 通知サービスをProviderとして提供
        ChangeNotifierProvider<NotificationService>.value(value: notificationService),
        
        // 通知BLoCをProviderとして提供
        BlocProvider<NotificationBloc>(
          create: (_) => NotificationBloc(notificationService: notificationService)
            ..add(const NotificationInitialized()),
        ),
        
        // 同期サービスをProviderとして提供
        ChangeNotifierProvider(create: (_) => SyncService()),
        
        // 認証BLoCをProviderとして提供
        BlocProvider<AuthBloc>(create: (_) => AuthBloc()),
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

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    
    // 通知権限をリクエスト
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final notificationBloc = BlocProvider.of<NotificationBloc>(context);
      notificationBloc.add(const NotificationPermissionRequested());
    });
  }

  @override
  Widget build(BuildContext context) {
    final authBloc = BlocProvider.of<AuthBloc>(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('TaskVision'),
        actions: [
          // 通知アイコン
          BlocBuilder<NotificationBloc, NotificationState>(
            builder: (context, state) {
              return IconButton(
                icon: Icon(
                  state is NotificationPermissionGranted
                      ? Icons.notifications_active
                      : Icons.notifications_off,
                  color: state is NotificationPermissionGranted
                      ? Colors.green
                      : Colors.grey,
                ),
                onPressed: () {
                  Navigator.pushNamed(context, AppRouter.notificationSettings);
                },
                tooltip: state is NotificationPermissionGranted
                    ? '通知設定'
                    : '通知を有効にする',
              );
            },
          ),
          // 同期ステータスインジケーター
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 8),
            child: SyncStatusIndicator(
              showText: false,
              iconSize: 20,
            ),
          ),
          // 設定アイコン
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
