import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'firebase/firebase_options.dart';
import 'blocs/app_bloc.dart';
import 'blocs/auth_bloc.dart';
import 'routes/app_router.dart';
import 'services/firebase_service.dart';
import 'screens/home_screen.dart';
import 'theme/app_theme.dart';

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
    final firebaseService = FirebaseService();

    return MultiBlocProvider(
      providers: [
        BlocProvider<AppBloc>(
          create: (context) => AppBloc()..add(AppStarted()),
        ),
        BlocProvider<AuthBloc>(
          create: (context) => AuthBloc(firebaseService: firebaseService)
            ..add(AuthCheckRequested()),
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
