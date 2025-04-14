import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../services/sync_service.dart';

// Events
abstract class SyncEvent extends Equatable {
  const SyncEvent();

  @override
  List<Object?> get props => [];
}

class SyncStarted extends SyncEvent {
  const SyncStarted();
}

class SyncRequested extends SyncEvent {
  const SyncRequested();
}

class SyncStatusChanged extends SyncEvent {
  final SyncStatus status;
  final String? errorMessage;

  const SyncStatusChanged({
    required this.status,
    this.errorMessage,
  });

  @override
  List<Object?> get props => [status, errorMessage];
}

class ConnectivityChanged extends SyncEvent {
  final bool isOffline;

  const ConnectivityChanged({required this.isOffline});

  @override
  List<Object?> get props => [isOffline];
}

// States
abstract class SyncState extends Equatable {
  const SyncState();

  @override
  List<Object?> get props => [];
}

class SyncInitial extends SyncState {
  const SyncInitial();
}

class SyncInProgress extends SyncState {
  const SyncInProgress();
}

class SyncSuccess extends SyncState {
  final DateTime lastSyncTime;

  const SyncSuccess({required this.lastSyncTime});

  @override
  List<Object?> get props => [lastSyncTime];
}

class SyncFailure extends SyncState {
  final String errorMessage;

  const SyncFailure({required this.errorMessage});

  @override
  List<Object?> get props => [errorMessage];
}

class SyncOffline extends SyncState {
  const SyncOffline();
}

// Bloc
class SyncBloc extends Bloc<SyncEvent, SyncState> {
  final SyncService _syncService;
  late StreamSubscription<SyncStatus> _syncStatusSubscription;

  SyncBloc({required SyncService syncService})
      : _syncService = syncService,
        super(const SyncInitial()) {
    on<SyncStarted>(_onSyncStarted);
    on<SyncRequested>(_onSyncRequested);
    on<SyncStatusChanged>(_onSyncStatusChanged);
    on<ConnectivityChanged>(_onConnectivityChanged);

    // Listen to sync status changes
    _syncStatusSubscription = Stream.periodic(const Duration(seconds: 1))
        .asyncMap((_) => _syncService.status)
        .distinct()
        .listen((status) {
      add(SyncStatusChanged(
        status: status,
        errorMessage: _syncService.errorMessage,
      ));
    });
  }

  void _onSyncStarted(SyncStarted event, Emitter<SyncState> emit) {
    if (_syncService.isOffline) {
      emit(const SyncOffline());
    } else {
      _syncService.syncData();
      emit(const SyncInProgress());
    }
  }

  void _onSyncRequested(SyncRequested event, Emitter<SyncState> emit) {
    if (_syncService.isOffline) {
      emit(const SyncOffline());
    } else {
      _syncService.syncData();
      emit(const SyncInProgress());
    }
  }

  void _onSyncStatusChanged(SyncStatusChanged event, Emitter<SyncState> emit) {
    switch (event.status) {
      case SyncStatus.syncing:
        emit(const SyncInProgress());
        break;
      case SyncStatus.synced:
        emit(SyncSuccess(lastSyncTime: DateTime.now()));
        break;
      case SyncStatus.error:
        emit(SyncFailure(
            errorMessage: event.errorMessage ?? '不明なエラーが発生しました'));
        break;
      case SyncStatus.offline:
        emit(const SyncOffline());
        break;
    }
  }

  void _onConnectivityChanged(
      ConnectivityChanged event, Emitter<SyncState> emit) {
    if (event.isOffline) {
      emit(const SyncOffline());
    } else if (state is SyncOffline) {
      // If we were offline and now we're online, trigger a sync
      _syncService.syncData();
      emit(const SyncInProgress());
    }
  }

  @override
  Future<void> close() {
    _syncStatusSubscription.cancel();
    return super.close();
  }
}
