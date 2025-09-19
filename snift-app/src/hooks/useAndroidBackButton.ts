import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface UseAndroidBackButtonOptions {
  onBackPress?: () => boolean;
  showExitAlert?: boolean;
  exitAlertTitle?: string;
  exitAlertMessage?: string;
}

export const useAndroidBackButton = (options: UseAndroidBackButtonOptions = {}) => {
  const navigation = useNavigation();
  const {
    onBackPress,
    showExitAlert = true,
    exitAlertTitle = 'Exit App',
    exitAlertMessage = 'Are you sure you want to exit the app?',
  } = options;

  useEffect(() => {
    const backAction = () => {
      // If custom handler is provided, use it
      if (onBackPress) {
        return onBackPress();
      }

      // Check if we can go back in navigation stack
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }

      // If we're at the root and showExitAlert is true, show exit confirmation
      if (showExitAlert) {
        Alert.alert(
          exitAlertTitle,
          exitAlertMessage,
          [
            {
              text: 'Cancel',
              onPress: () => null,
              style: 'cancel',
            },
            {
              text: 'Exit',
              onPress: () => BackHandler.exitApp(),
              style: 'destructive',
            },
          ],
          { cancelable: false }
        );
        return true;
      }

      // Default behavior - exit app
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation, onBackPress, showExitAlert, exitAlertTitle, exitAlertMessage]);
};
