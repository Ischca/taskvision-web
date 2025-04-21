# Firebase Configuration

This directory contains Firebase configuration files for the TaskVision mobile app. These files are not committed to the repository for security reasons.

## Required Files

The following files are required for Firebase integration:

- `google-services.json` - Android configuration
- `GoogleService-Info.plist` - iOS configuration

## CI/CD Setup

In the CI/CD pipeline, these files are generated from GitHub Secrets:

- `FIREBASE_ANDROID_JSON` - Base64 encoded `google-services.json`
- `FIREBASE_IOS_PLIST` - Base64 encoded `GoogleService-Info.plist`
- `FIREBASE_PROJECT_ID` - Firebase project ID

### Setting up GitHub Secrets

1. Get the Firebase configuration files from the Firebase console:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings > Your Apps
   - Download the configuration files for Android and iOS

2. Encode the configuration files to Base64:
   ```bash
   # For Android
   cat google-services.json | base64 > android-base64.txt
   
   # For iOS
   base64 GoogleService-Info.plist > ios-base64.txt
   ```

3. Add the encoded content as GitHub Secrets:
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `FIREBASE_ANDROID_JSON`: Content of android-base64.txt
     - `FIREBASE_IOS_PLIST`: Content of ios-base64.txt
     - `FIREBASE_PROJECT_ID`: Your Firebase project ID (e.g., "taskvision-12345")

## Local Development Setup

For local development, you need to:

1. Obtain the Firebase configuration files from the Firebase console
2. Place them in this directory
3. Run the FlutterFire CLI to generate the `firebase_options.dart` file:

```bash
# Install FlutterFire CLI
dart pub global activate flutterfire_cli

# Generate firebase_options.dart
flutterfire configure \
  --project <YOUR_PROJECT_ID> \
  --out=lib/firebase/firebase_options.dart \
  --platforms=android,ios
```

## Security Notes

- Never commit these files to the repository
- Always use GitHub Secrets for CI/CD
- Keep your Firebase project ID and configuration secure
- The `firebase_options.dart` file should not contain actual API keys in the repository
- In CI environments, these files are generated from secrets
