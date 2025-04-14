import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../services/notification_service.dart';

// Events
abstract class NotificationEvent extends Equatable {
  const NotificationEvent();

  @override
  List<Object?> get props => [];
}

class NotificationInitialized extends NotificationEvent {
  const NotificationInitialized();
}

class NotificationPermissionRequested extends NotificationEvent {
  const NotificationPermissionRequested();
}

class NotificationReceived extends NotificationEvent {
  final String title;
  final String body;
  final Map<String, dynamic>? data;

  const NotificationReceived({
    required this.title,
    required this.body,
    this.data,
  });

  @override
  List<Object?> get props => [title, body, data];
}

class NotificationTokenUpdated extends NotificationEvent {
  final String token;

  const NotificationTokenUpdated({required this.token});

  @override
  List<Object?> get props => [token];
}

// States
abstract class NotificationState extends Equatable {
  const NotificationState();

  @override
  List<Object?> get props => [];
}

class NotificationInitial extends NotificationState {
  const NotificationInitial();
}

class NotificationPermissionLoading extends NotificationState {
  const NotificationPermissionLoading();
}

class NotificationPermissionGranted extends NotificationState {
  final String? token;

  const NotificationPermissionGranted({this.token});

  @override
  List<Object?> get props => [token];
}

class NotificationPermissionDenied extends NotificationState {
  const NotificationPermissionDenied();
}

class NotificationDisplayed extends NotificationState {
  final String title;
  final String body;
  final Map<String, dynamic>? data;

  const NotificationDisplayed({
    required this.title,
    required this.body,
    this.data,
  });

  @override
  List<Object?> get props => [title, body, data];
}

// Bloc
class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final NotificationService _notificationService;

  NotificationBloc({required NotificationService notificationService})
      : _notificationService = notificationService,
        super(const NotificationInitial()) {
    on<NotificationInitialized>(_onNotificationInitialized);
    on<NotificationPermissionRequested>(_onNotificationPermissionRequested);
    on<NotificationReceived>(_onNotificationReceived);
    on<NotificationTokenUpdated>(_onNotificationTokenUpdated);
  }

  Future<void> _onNotificationInitialized(
      NotificationInitialized event, Emitter<NotificationState> emit) async {
    await _notificationService.initialize();
  }

  Future<void> _onNotificationPermissionRequested(
      NotificationPermissionRequested event,
      Emitter<NotificationState> emit) async {
    emit(const NotificationPermissionLoading());

    final hasPermission = await _notificationService.requestPermission();

    if (hasPermission) {
      emit(NotificationPermissionGranted(token: _notificationService.token));
    } else {
      emit(const NotificationPermissionDenied());
    }
  }

  void _onNotificationReceived(
      NotificationReceived event, Emitter<NotificationState> emit) {
    emit(NotificationDisplayed(
      title: event.title,
      body: event.body,
      data: event.data,
    ));
  }

  void _onNotificationTokenUpdated(
      NotificationTokenUpdated event, Emitter<NotificationState> emit) {
    if (state is NotificationPermissionGranted) {
      emit(NotificationPermissionGranted(token: event.token));
    }
  }
}
