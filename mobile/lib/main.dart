import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:provider/provider.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'firebase/firebase_options.dart';
import 'blocs/app_bloc.dart';
import 'blocs/auth_bloc.dart';
import 'blocs/notification_bloc.dart';
import 'routes/app_router.dart';
import 'services/firebase_service.dart';
import 'services/sync_service.dart';
import 'services/notification_service.dart';
import 'services/auth_service.dart';
import 'theme/app_theme.dart';

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
    final firebaseService = FirebaseService();
    final syncService = SyncService();
    final notificationService = NotificationService();
    
    return MultiProvider(
      providers: [
        // 通知サービスをProviderとして提供
        ChangeNotifierProvider<NotificationService>.value(value: notificationService),
        
        // 同期サービスをProviderとして提供
        ChangeNotifierProvider<SyncService>.value(value: syncService),
        
        // BLoCプロバイダー
        BlocProvider<AppBloc>(
          create: (context) => AppBloc()..add(AppStarted()),
        ),
        
        BlocProvider<AuthBloc>(
          create: (context) => AuthBloc(authService: AuthService(), firebaseService: firebaseService)
            ..add(AuthCheckRequested()),
        ),
        
        // 通知BLoCをProviderとして提供
        BlocProvider<NotificationBloc>(
          create: (_) => NotificationBloc(notificationService: notificationService)
            ..add(const NotificationInitialized()),
        ),
      ],
      child: BlocBuilder<AppBloc, AppState>(
        builder: (context, state) {
          return MaterialApp(
            title: 'TaskVision',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: state.isDarkMode ? ThemeMode.dark : ThemeMode.light,
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const [
              Locale('ja', ''),
              Locale('en', ''),
            ],
            locale: Locale(state.locale, ''),
            onGenerateRoute: AppRouter.onGenerateRoute,
            initialRoute: AppRouter.home,
          );
        },
      ),
    );
  }
}
