import 'dart:async';
import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class NotificationService with ChangeNotifier {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  
  bool _isInitialized = false;
  bool _hasPermission = false;
  String? _token;
  
  bool get isInitialized => _isInitialized;
  bool get hasPermission => _hasPermission;
  String? get token => _token;
  
  // Initialize the notification service
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    // Initialize timezone data
    tz.initializeTimeZones();
    
    // Configure local notifications
    const AndroidInitializationSettings androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );
    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    
    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );
    
    // Configure FCM for foreground notifications
    await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );
    
    // Handle incoming messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);
    
    // Check if we have a stored token
    await _loadSavedToken();
    
    _isInitialized = true;
    notifyListeners();
  }
  
  // Request notification permissions
  Future<bool> requestPermission() async {
    if (Platform.isIOS) {
      final settings = await _firebaseMessaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );
      
      _hasPermission = settings.authorizationStatus == AuthorizationStatus.authorized ||
                       settings.authorizationStatus == AuthorizationStatus.provisional;
    } else {
      // On Android, permissions are granted by default for FCM
      _hasPermission = true;
      
      // For local notifications on Android 13+, we need to request permission
      if (Platform.isAndroid) {
        final AndroidFlutterLocalNotificationsPlugin? androidPlugin = 
            _localNotifications.resolvePlatformSpecificImplementation<
                AndroidFlutterLocalNotificationsPlugin>();
                
        if (androidPlugin != null) {
          await androidPlugin.requestPermission();
        }
      }
    }
    
    if (_hasPermission) {
      await _getToken();
    }
    
    notifyListeners();
    return _hasPermission;
  }
  
  // Get the FCM token and save it
  Future<String?> _getToken() async {
    _token = await _firebaseMessaging.getToken();
    if (_token != null) {
      await _saveToken(_token!);
    }
    return _token;
  }
  
  // Save token to SharedPreferences and Firestore
  Future<void> _saveToken(String token) async {
    // Save locally
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('fcm_token', token);
    
    // Save to Firestore if user is logged in
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser != null) {
      await _firestore.collection('users').doc(currentUser.uid).update({
        'fcmTokens': FieldValue.arrayUnion([token]),
        'lastTokenUpdate': FieldValue.serverTimestamp(),
      });
    }
  }
  
  // Load saved token from SharedPreferences
  Future<void> _loadSavedToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('fcm_token');
    
    // If we have a saved token, refresh it
    if (_token != null) {
      _getToken();
    }
  }
  
  // Handle foreground messages
  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    // Show a local notification for foreground messages
    await _showLocalNotification(
      id: message.hashCode,
      title: message.notification?.title ?? 'TaskVision',
      body: message.notification?.body ?? '',
      payload: message.data.toString(),
    );
  }
  
  // Handle when a notification is tapped
  void _onNotificationTapped(NotificationResponse response) {
    // Parse the payload and navigate accordingly
    if (response.payload != null) {
      // This would be implemented to navigate to the appropriate screen
      // based on the notification payload
    }
  }
  
  // Handle when app is opened from a notification
  void _handleMessageOpenedApp(RemoteMessage message) {
    // This would be implemented to navigate to the appropriate screen
    // based on the notification payload
  }
  
  // Show a local notification
  Future<void> _showLocalNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'task_notification_channel',
      'タスク通知',
      channelDescription: 'タスクの期限や更新に関する通知',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
    );
    
    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );
    
    const NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await _localNotifications.show(
      id,
      title,
      body,
      details,
      payload: payload,
    );
  }
  
  // Public method to show a local notification
  Future<void> showLocalNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    await _showLocalNotification(
      id: id,
      title: title,
      body: body,
      payload: payload,
    );
  }
  
  // Schedule a local notification
  Future<void> scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
  }) async {
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'task_reminder_channel',
      'タスクリマインダー',
      channelDescription: 'タスクの期限リマインダー通知',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
    );
    
    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );
    
    const NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await _localNotifications.zonedSchedule(
      id,
      title,
      body,
      tz.TZDateTime.from(scheduledDate, tz.local),
      details,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
      payload: payload,
    );
  }
  
  // Cancel a specific notification
  Future<void> cancelNotification(int id) async {
    await _localNotifications.cancel(id);
  }
  
  // Cancel all notifications
  Future<void> cancelAllNotifications() async {
    await _localNotifications.cancelAll();
  }
  
  // Update token when user logs in
  Future<void> updateTokenForUser(String userId) async {
    if (_token != null) {
      await _firestore.collection('users').doc(userId).update({
        'fcmTokens': FieldValue.arrayUnion([_token!]),
        'lastTokenUpdate': FieldValue.serverTimestamp(),
      });
    } else {
      // If we don't have a token yet, get one and save it
      await _getToken();
      if (_token != null) {
        await _firestore.collection('users').doc(userId).update({
          'fcmTokens': FieldValue.arrayUnion([_token!]),
          'lastTokenUpdate': FieldValue.serverTimestamp(),
        });
      }
    }
  }
  
  // Remove token when user logs out
  Future<void> removeTokenForUser(String userId) async {
    if (_token != null) {
      await _firestore.collection('users').doc(userId).update({
        'fcmTokens': FieldValue.arrayRemove([_token!]),
        'lastTokenUpdate': FieldValue.serverTimestamp(),
      });
    }
  }
}
