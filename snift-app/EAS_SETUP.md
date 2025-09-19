# EAS Build Setup for Snift App

This guide will help you set up EAS (Expo Application Services) builds for the Snift mobile app.

## Prerequisites

1. **EAS CLI installed** ✅ (Already installed globally)
2. **Expo account** - You'll need to create one at [expo.dev](https://expo.dev)
3. **Apple Developer Account** (for iOS builds)
4. **Google Play Console Account** (for Android production builds)

## Initial Setup

### 1. Login to EAS
```bash
eas login
```
Follow the prompts to authenticate with your Expo account.

### 2. Initialize EAS Project
```bash
eas init
```
This will:
- Create a project on EAS
- Update your `app.json` with the correct project ID
- Set up the project for builds

### 3. Configure Credentials

#### For iOS (Required for any iOS build):
```bash
eas credentials
```
Select iOS and follow the setup wizard. You'll need:
- Apple Developer Account
- App Store Connect access
- Distribution certificate
- Provisioning profile

#### For Android (Required for production builds):
```bash
eas credentials
```
Select Android and follow the setup wizard. You'll need:
- Google Play Console account
- Keystore for signing

## Build Configuration

The app is configured with the following settings:

### App Configuration (`app.json`)
- **Name**: Snift
- **Slug**: snift-app
- **Android Package**: com.snift.app
- **iOS Bundle ID**: com.snift.app
- **Permissions**: INTERNET, NOTIFICATIONS, VIBRATE, RECEIVE_BOOT_COMPLETED, WAKE_LOCK

### Build Profiles (`eas.json`)
- **development**: For development builds with dev client
- **preview**: For internal testing (APK for Android, IPA for iOS)
- **production**: For app store releases

## Building for Testing

### Android Preview Build (APK)
```bash
npm run build:android:preview
# or
npx eas build -p android --profile preview
```

This creates an APK file that can be:
- Downloaded and installed directly on Android devices
- Shared with testers via email or file sharing
- Uploaded to Firebase App Distribution or similar services

### iOS Preview Build (IPA)
```bash
npm run build:ios:preview
# or
npx eas build -p ios --profile preview
```

This creates an IPA file that can be:
- Installed via TestFlight (recommended)
- Installed via Xcode (for development devices)
- Shared with testers through TestFlight

## Production Builds

### Android Production
```bash
npm run build:android:production
# or
npx eas build -p android --profile production
```

### iOS Production
```bash
npm run build:ios:production
# or
npx eas build -p ios --profile production
```

## Submitting to App Stores

### Android (Google Play)
```bash
npm run submit:android
# or
eas submit -p android
```

### iOS (App Store)
```bash
npm run submit:ios
# or
eas submit -p ios
```

## Build Status and Downloads

After starting a build, you can:
1. Monitor progress at [expo.dev](https://expo.dev)
2. Download builds from the EAS dashboard
3. Get build URLs via CLI: `eas build:list`

## Troubleshooting

### Common Issues

1. **Build fails with credential errors**
   - Run `eas credentials` to set up proper certificates
   - Ensure your Apple Developer/Google Play accounts are active

2. **iOS build fails with provisioning profile issues**
   - Check that your bundle ID matches in Apple Developer Console
   - Ensure provisioning profiles are up to date

3. **Android build fails with keystore issues**
   - Run `eas credentials` to set up Android keystore
   - Ensure package name matches in Google Play Console

### Getting Help
- EAS Documentation: [docs.expo.dev/eas](https://docs.expo.dev/eas/)
- EAS CLI Help: `eas --help`
- Specific command help: `eas build --help`

## Next Steps

1. **Login to EAS**: `eas login`
2. **Initialize project**: `eas init`
3. **Set up credentials**: `eas credentials`
4. **Build preview**: `npm run build:android:preview` or `npm run build:ios:preview`
5. **Test the builds** on physical devices
6. **Set up TestFlight** (iOS) or **Firebase App Distribution** (Android) for easy testing

## Security Notes

- Never commit credentials or keystores to version control
- Use EAS credentials management for all signing
- Keep your Apple Developer and Google Play accounts secure
- Regularly rotate certificates and keys
