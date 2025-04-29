// File: lib/firebase/firebase_options.dart
// Firebase configuration options for TaskVision mobile app
// Development configuration for local testing

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for macos - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  // Configuration for Android
  // Development configuration for local testing
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDevelopmentKeyForAndroidPlatform12345',
    appId: '1:123456789012:android:1234567890123456789012',
    messagingSenderId: '123456789012',
    projectId: 'taskvision-dev',
    storageBucket: 'taskvision-dev.appspot.com',
  );

  // Configuration for iOS
  // Development configuration for local testing
  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyDevelopmentKeyForIOSPlatform123456789',
    appId: '1:123456789012:ios:1234567890123456789012',
    messagingSenderId: '123456789012',
    projectId: 'taskvision-dev',
    storageBucket: 'taskvision-dev.appspot.com',
    iosClientId: '123456789012-zyxwvutsrqponmlkjihgfedcba654321.apps.googleusercontent.com',
    iosBundleId: 'com.taskvision.taskvision',
  );

  // Configuration for Web
  // Development configuration for local testing
  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyDevelopmentKeyForWebPlatform1234567890',
    appId: '1:123456789012:web:1234567890123456789012',
    messagingSenderId: '123456789012',
    projectId: 'taskvision-dev',
    storageBucket: 'taskvision-dev.appspot.com',
    authDomain: 'taskvision-dev.firebaseapp.com',
  );
}
