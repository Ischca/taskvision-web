import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

enum SyncStatus {
  synced,
  syncing,
  offline,
  error,
}

class SyncService with ChangeNotifier {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final Connectivity _connectivity = Connectivity();

  SyncStatus _status = SyncStatus.synced;
  String? _errorMessage;
  StreamSubscription<ConnectivityResult>? _connectivitySubscription;
  bool _isOffline = false;

  SyncStatus get status => _status;
  String? get errorMessage => _errorMessage;
  bool get isOffline => _isOffline;

  SyncService() {
    // Enable Firestore offline persistence
    _firestore.settings = const Settings(
      persistenceEnabled: true,
      cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED,
    );

    // Initialize connectivity monitoring
    _initConnectivityMonitoring();
  }

  void _initConnectivityMonitoring() {
    _connectivitySubscription = _connectivity.onConnectivityChanged.listen((ConnectivityResult result) {
      if (result == ConnectivityResult.none) {
        _isOffline = true;
        _status = SyncStatus.offline;
      } else {
        if (_isOffline) {
          // We were offline, now we're back online - trigger sync
          _isOffline = false;
          syncData();
        }
      }
      notifyListeners();
    });

    // Check initial connectivity state
    _checkConnectivity();
  }

  Future<void> _checkConnectivity() async {
    final ConnectivityResult result = await _connectivity.checkConnectivity();
    _isOffline = result == ConnectivityResult.none;
    if (_isOffline) {
      _status = SyncStatus.offline;
    }
    notifyListeners();
  }

  // Main sync method - call this to manually trigger a sync
  Future<void> syncData() async {
    if (_auth.currentUser == null) {
      _setError('ユーザーがログインしていません');
      return;
    }

    if (_isOffline) {
      _status = SyncStatus.offline;
      notifyListeners();
      return;
    }

    try {
      _status = SyncStatus.syncing;
      notifyListeners();

      // Sync tasks and blocks
      await _syncTasks();
      await _syncBlocks();

      _status = SyncStatus.synced;
      _errorMessage = null;
    } catch (e) {
      _setError('同期中にエラーが発生しました: $e');
    } finally {
      notifyListeners();
    }
  }

  Future<void> _syncTasks() async {
    // This method would handle any complex task synchronization logic
    // For now, we're relying on Firestore's built-in offline persistence
    // and automatic sync capabilities
    
    // If needed, we could implement custom conflict resolution here
    // by comparing local timestamps with server timestamps
  }

  Future<void> _syncBlocks() async {
    // Similar to _syncTasks, this would handle block-specific sync logic
    // For now, we're relying on Firestore's built-in capabilities
  }

  // Method to handle conflict resolution
  Future<void> resolveConflict<T>(String collectionPath, String docId, T localData, T serverData) async {
    // This is a placeholder for a more sophisticated conflict resolution strategy
    // In a real app, you might:
    // 1. Compare timestamps to determine which is newer
    // 2. Merge changes intelligently
    // 3. Prompt the user to choose which version to keep
    
    // For now, we'll use a simple "server wins" strategy
    await _firestore.collection(collectionPath).doc(docId).set(
      serverData as Map<String, dynamic>,
      SetOptions(merge: true),
    );
  }

  void _setError(String message) {
    _status = SyncStatus.error;
    _errorMessage = message;
    notifyListeners();
  }

  // Method to get the sync status as a user-friendly string
  String getSyncStatusText() {
    switch (_status) {
      case SyncStatus.synced:
        return '同期済み';
      case SyncStatus.syncing:
        return '同期中...';
      case SyncStatus.offline:
        return 'オフライン';
      case SyncStatus.error:
        return 'エラー: $_errorMessage';
    }
  }

  // Method to get the sync status as an icon
  IconData getSyncStatusIcon() {
    switch (_status) {
      case SyncStatus.synced:
        return Icons.cloud_done;
      case SyncStatus.syncing:
        return Icons.sync;
      case SyncStatus.offline:
        return Icons.cloud_off;
      case SyncStatus.error:
        return Icons.error_outline;
    }
  }

  // Method to get the sync status as a color
  Color getSyncStatusColor() {
    switch (_status) {
      case SyncStatus.synced:
        return Colors.green;
      case SyncStatus.syncing:
        return Colors.blue;
      case SyncStatus.offline:
        return Colors.orange;
      case SyncStatus.error:
        return Colors.red;
    }
  }

  @override
  void dispose() {
    _connectivitySubscription?.cancel();
    super.dispose();
  }
}
