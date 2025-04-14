import 'package:flutter/material.dart';

class AppColors {
  static const primary = Color(0xFF4F46E5);
  static const secondary = Color(0xFF6366F1);
  static const background = Color(0xFFF9FAFB);
  static const surface = Colors.white;
  static const error = Color(0xFFEF4444);
  static const onPrimary = Colors.white;
  static const onSecondary = Colors.white;
  static const onBackground = Color(0xFF1F2937);
  static const onSurface = Color(0xFF1F2937);
  static const onError = Colors.white;
}

class AppConfig {
  static const appName = 'TaskVision';
  static const appVersion = '1.0.0';
  static const supportEmail = 'support@taskvision.app';
}

class ApiEndpoints {
  static const baseUrl = 'https://api.taskvision.app';
  static const tasks = '/tasks';
  static const blocks = '/blocks';
  static const auth = '/auth';
}
