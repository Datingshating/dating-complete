import React, { useCallback, useMemo } from 'react';
import { FlatList, FlatListProps, ListRenderItem } from 'react-native';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'getItemLayout' | 'keyExtractor'> {
  data: T[];
  renderItem: ListRenderItem<T>;
  itemHeight?: number;
  keyExtractor?: (item: T, index: number) => string;
  estimatedItemSize?: number;
}

function OptimizedFlatList<T>({
  data,
  renderItem,
  itemHeight,
  keyExtractor,
  estimatedItemSize = 80,
  ...props
}: OptimizedFlatListProps<T>) {
  // Optimized key extractor
  const optimizedKeyExtractor = useCallback(
    (item: T, index: number) => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      
      // Default key extractor - try to use id field if available
      if (typeof item === 'object' && item !== null && 'id' in item) {
        return String((item as any).id);
      }
      
      return `item-${index}`;
    },
    [keyExtractor]
  );

  // Optimized getItemLayout for fixed height items
  const getItemLayout = useMemo(() => {
    if (itemHeight) {
      return (data: ArrayLike<T> | null | undefined, index: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      });
    }
    return undefined;
  }, [itemHeight]);

  // Memoized render item to prevent unnecessary re-renders
  const memoizedRenderItem = useCallback<ListRenderItem<T>>(
    (info) => renderItem(info),
    [renderItem]
  );

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={optimizedKeyExtractor}
      getItemLayout={getItemLayout}
      // Performance optimizations
      windowSize={10} // Render 10 screens worth of items
      initialNumToRender={10} // Render 10 items initially
      maxToRenderPerBatch={5} // Render 5 items per batch
      updateCellsBatchingPeriod={50} // Batch updates every 50ms
      removeClippedSubviews={true} // Remove off-screen views
      // Memory optimizations
      onEndReachedThreshold={0.5} // Trigger onEndReached when 50% from bottom
      // Scroll performance
      scrollEventThrottle={16} // 60fps scroll events
      {...props}
    />
  );
}

export default OptimizedFlatList;
