import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetInfo } from '../hooks/useNetInfo';

interface OfflineBannerProps {
  style?: any;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ style }) => {
  const { isOffline } = useNetInfo();

  if (!isOffline) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={styles.icon}>📡</Text>
        <Text style={styles.text}>No Internet Connection</Text>
        <Text style={styles.subtext}>Check your connection and try again</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#B91C1C',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  subtext: {
    color: '#FECACA',
    fontSize: 12,
    marginLeft: 4,
  },
});

export default OfflineBanner;
