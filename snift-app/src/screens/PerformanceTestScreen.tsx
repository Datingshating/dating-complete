import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAndroidBackButton } from '../hooks/useAndroidBackButton';
import OptimizedFlatList from '../components/OptimizedFlatList';
import ListSkeleton from '../components/ListSkeleton';
import { generateTestData, performanceMonitor, logMemoryUsage } from '../utils/performanceTest';
import { TestItem } from '../utils/performanceTest';

const PerformanceTestScreen: React.FC = () => {
  const [itemCount, setItemCount] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<TestItem[]>([]);

  // Handle Android back button
  useAndroidBackButton();

  // Generate test data
  const generateData = useCallback(async (count: number) => {
    setIsGenerating(true);
    logMemoryUsage('Before generation');
    
    const endTiming = performanceMonitor.startTiming('Data Generation');
    
    // Simulate some async work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newData = generateTestData(count);
    setData(newData);
    
    endTiming();
    logMemoryUsage('After generation');
    
    setIsGenerating(false);
  }, []);

  // Handle item count change
  const handleItemCountChange = useCallback((count: number) => {
    setItemCount(count);
    generateData(count);
  }, [generateData]);

  // Render test item
  const renderTestItem = useCallback(({ item }: { item: TestItem }) => {
    const endTiming = performanceMonitor.startTiming('Render Item');
    
    const result = (
      <View style={styles.testItem}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemAge}>{item.age} years old</Text>
          </View>
          
          <Text style={styles.itemBio} numberOfLines={2}>
            {item.bio}
          </Text>
          
          <Text style={styles.itemId}>
            ID: {item.id}
          </Text>
        </View>
      </View>
    );
    
    endTiming();
    return result;
  }, []);

  // Memoized key extractor
  const keyExtractor = useCallback((item: TestItem) => item.id, []);

  // Performance metrics
  const metrics = useMemo(() => performanceMonitor.getMetrics(), [data]);

  // Show loading skeleton
  if (isGenerating) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Performance Test</Text>
          <Text style={styles.subtitle}>Generating {itemCount} items...</Text>
        </View>
        <ListSkeleton itemCount={10} itemHeight={80} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Test</Text>
        <Text style={styles.subtitle}>
          Testing with {data.length} items
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Text style={styles.controlLabel}>Item Count:</Text>
        <View style={styles.buttonRow}>
          {[50, 100, 200, 500, 1000].map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.countButton,
                itemCount === count && styles.activeCountButton,
              ]}
              onPress={() => handleItemCountChange(count)}
            >
              <Text
                style={[
                  styles.countButtonText,
                  itemCount === count && styles.activeCountButtonText,
                ]}
              >
                {count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Performance Metrics */}
      {Object.keys(metrics).length > 0 && (
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>Performance Metrics:</Text>
          {Object.entries(metrics).map(([label, metric]) => (
            <Text key={label} style={styles.metricText}>
              {label}: {metric.average.toFixed(2)}ms avg ({metric.count} samples)
            </Text>
          ))}
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => performanceMonitor.clearMetrics()}
          >
            <Text style={styles.clearButtonText}>Clear Metrics</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Test List */}
      <View style={styles.listContainer}>
        <OptimizedFlatList
          data={data}
          renderItem={renderTestItem}
          keyExtractor={keyExtractor}
          itemHeight={80}
          showsVerticalScrollIndicator={true}
          onEndReached={() => {
            console.log('📜 Reached end of list');
          }}
          onEndReachedThreshold={0.5}
        />
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Optimization Tips:</Text>
        <Text style={styles.tipText}>• Use getItemLayout for fixed heights</Text>
        <Text style={styles.tipText}>• Set windowSize to 10-15</Text>
        <Text style={styles.tipText}>• Use removeClippedSubviews</Text>
        <Text style={styles.tipText}>• Memoize renderItem components</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#8A4B2A',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#F3F4F6',
    marginTop: 4,
  },
  controls: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeCountButton: {
    backgroundColor: '#8A4B2A',
    borderColor: '#8A4B2A',
  },
  countButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeCountButtonText: {
    color: '#FFFFFF',
  },
  metricsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  metricText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  clearButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginVertical: 2,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8A4B2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemAge: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemBio: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 4,
  },
  itemId: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
});

export default PerformanceTestScreen;
