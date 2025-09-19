import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface ListSkeletonProps {
  itemCount?: number;
  itemHeight?: number;
}

const ListSkeleton: React.FC<ListSkeletonProps> = ({ 
  itemCount = 5, 
  itemHeight = 80 
}) => {
  const renderSkeletonItem = () => (
    <View style={[styles.item, { height: itemHeight }]}>
      <SkeletonLoader width={50} height={50} borderRadius={25} />
      <View style={styles.itemContent}>
        <SkeletonLoader width="70%" height={16} borderRadius={4} />
        <SkeletonLoader width="50%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
      </View>
      <SkeletonLoader width={60} height={30} borderRadius={15} />
    </View>
  );

  const data = Array.from({ length: itemCount }, (_, index) => ({ id: index }));

  return (
    <FlatList
      data={data}
      renderItem={renderSkeletonItem}
      keyExtractor={(item) => `skeleton-${item.id}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
});

export default ListSkeleton;
