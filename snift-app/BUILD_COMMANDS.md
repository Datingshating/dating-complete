# Quick Build Commands Reference

## Setup Commands
```bash
# Login to EAS
eas login

# Initialize EAS project
eas init

# Configure credentials
eas credentials
```

## Preview Builds (for testing)
```bash
# Android APK for testing
npm run build:android:preview
# or
npx eas build -p android --profile preview

# iOS IPA for testing
npm run build:ios:preview
# or
npx eas build -p ios --profile preview
```

## Production Builds (for app stores)
```bash
# Android AAB for Google Play
npm run build:android:production
# or
npx eas build -p android --profile production

# iOS for App Store
npm run build:ios:production
# or
npx eas build -p ios --profile production
```

## Submit to App Stores
```bash
# Submit Android to Google Play
npm run submit:android
# or
eas submit -p android

# Submit iOS to App Store
npm run submit:ios
# or
eas submit -p ios
```

## Useful Commands
```bash
# List all builds
eas build:list

# View build details
eas build:view [BUILD_ID]

# Cancel a build
eas build:cancel [BUILD_ID]

# Check build status
eas build:status
```

## App Configuration Summary
- **App Name**: Snift
- **Slug**: snift-app
- **Android Package**: com.snift.app
- **iOS Bundle ID**: com.snift.app
- **Permissions**: INTERNET, NOTIFICATIONS, VIBRATE, RECEIVE_BOOT_COMPLETED, WAKE_LOCK
