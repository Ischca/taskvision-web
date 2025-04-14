import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

// Events
abstract class AppEvent extends Equatable {
  const AppEvent();

  @override
  List<Object> get props => [];
}

class AppStarted extends AppEvent {}

class ThemeChanged extends AppEvent {
  final bool isDarkMode;

  const ThemeChanged(this.isDarkMode);

  @override
  List<Object> get props => [isDarkMode];
}

class LocaleChanged extends AppEvent {
  final String locale;

  const LocaleChanged(this.locale);

  @override
  List<Object> get props => [locale];
}

// States
abstract class AppState extends Equatable {
  final bool isDarkMode;
  final String locale;

  const AppState({
    required this.isDarkMode,
    required this.locale,
  });

  @override
  List<Object> get props => [isDarkMode, locale];
}

class AppInitial extends AppState {
  const AppInitial() : super(isDarkMode: false, locale: 'ja');
}

class AppReady extends AppState {
  const AppReady({
    required bool isDarkMode,
    required String locale,
  }) : super(isDarkMode: isDarkMode, locale: locale);
}

// BLoC
class AppBloc extends Bloc<AppEvent, AppState> {
  AppBloc() : super(const AppInitial()) {
    on<AppStarted>(_onAppStarted);
    on<ThemeChanged>(_onThemeChanged);
    on<LocaleChanged>(_onLocaleChanged);
  }

  void _onAppStarted(AppStarted event, Emitter<AppState> emit) {
    // Load saved preferences
    final isDarkMode = false; // TODO: Load from SharedPreferences
    final locale = 'ja'; // TODO: Load from SharedPreferences
    
    emit(AppReady(isDarkMode: isDarkMode, locale: locale));
  }

  void _onThemeChanged(ThemeChanged event, Emitter<AppState> emit) {
    // Save preference
    // TODO: Save to SharedPreferences
    
    emit(AppReady(isDarkMode: event.isDarkMode, locale: state.locale));
  }

  void _onLocaleChanged(LocaleChanged event, Emitter<AppState> emit) {
    // Save preference
    // TODO: Save to SharedPreferences
    
    emit(AppReady(isDarkMode: state.isDarkMode, locale: event.locale));
  }
}
