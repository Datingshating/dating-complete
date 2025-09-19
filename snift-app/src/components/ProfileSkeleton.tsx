import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

const ProfileSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SkeletonLoader width={80} height={80} borderRadius={40} />
        <View style={styles.headerText}>
          <SkeletonLoader width={150} height={20} borderRadius={4} />
          <SkeletonLoader width={100} height={16} borderRadius={4} style={{ marginTop: 8 }} />
        </View>
      </View>
      
      <View style={styles.section}>
        <SkeletonLoader width={120} height={18} borderRadius={4} />
        <SkeletonLoader width="100%" height={16} borderRadius={4} style={{ marginTop: 8 }} />
        <SkeletonLoader width="80%" height={16} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
      
      <View style={styles.section}>
        <SkeletonLoader width={100} height={18} borderRadius={4} />
        <View style={styles.tags}>
          <SkeletonLoader width={60} height={24} borderRadius={12} />
          <SkeletonLoader width={80} height={24} borderRadius={12} />
          <SkeletonLoader width={70} height={24} borderRadius={12} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
});

export default ProfileSkeleton;
