import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MatchesStackParamList, MainTabParamList } from '../navigation/types';
import { matchesApi } from '../api/matchesApi';
import { subscriptionsApi } from '../api/subscriptionsApi';
import { MatchItem, UserPack } from '../api/types';
import { useAuth } from '../hooks/useAuth';
import { useAndroidBackButton } from '../hooks/useAndroidBackButton';
import { useNetInfo } from '../hooks/useNetInfo';
import LoadingSpinner from '../components/LoadingSpinner';
import OptimizedFlatList from '../components/OptimizedFlatList';
import ListSkeleton from '../components/ListSkeleton';
import { cacheManager, CACHE_KEYS } from '../utils/cache';
import { apiCall } from '../api/enhancedApiClient';

type MatchesScreenNavigationProp = CompositeNavigationProp<
  NativeStackScreenProps<MatchesStackParamList, 'MatchesScreen'>['navigation'],
  BottomTabNavigationProp<MainTabParamList>
>;

type Props = {
  navigation: MatchesScreenNavigationProp;
};

const MatchesScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { isOffline } = useNetInfo();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle Android back button
  useAndroidBackButton({
    onBackPress: () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    },
  });

  // Fetch matches with React Query and caching
  const {
    data: matches = [],
    isLoading: isLoadingMatches,
    error: matchesError,
    refetch: refetchMatches,
  } = useQuery({
    queryKey: ['matches', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID not available');
      
      return apiCall(
        () => matchesApi.getMatches(user.id),
        {
          errorMessage: 'Failed to load matches',
          onError: (error) => {
            console.error('Matches fetch error:', error);
          },
        }
      );
    },
    enabled: !!user?.id && !isOffline,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  // Fetch user pack with React Query and caching
  const {
    data: userPack = null,
    isLoading: isLoadingPack,
    error: packError,
  } = useQuery({
    queryKey: ['userPack', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID not available');
      
      return apiCall(
        () => subscriptionsApi.getUserPack(user.id),
        {
          errorMessage: 'Failed to load subscription info',
        }
      );
    },
    enabled: !!user?.id && !isOffline,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const isLoading = isLoadingMatches || isLoadingPack;
  const hasError = matchesError || packError;

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchMatches(),
        queryClient.invalidateQueries({ queryKey: ['userPack', user?.id || ''] }),
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchMatches, queryClient, user?.id]);

  // Navigation handlers
  const handleMatchPress = useCallback((match: MatchItem) => {
    navigation.navigate('Chat', { 
      screen: 'ChatThreadScreen',
      params: { 
        chatId: match.other_user_id, 
        userName: match.name 
      }
    });
  }, [navigation]);

  const handleViewProfile = useCallback((match: MatchItem) => {
    if (match.other_user_id) {
      navigation.navigate('ProfileDetailScreen', { profileId: match.other_user_id });
    }
  }, [navigation]);

  // Utility functions
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  }, []);

  // Render match item with memoization
  const renderMatchItem = useCallback(({ item }: { item: MatchItem }) => (
    <TouchableOpacity
      style={styles.matchItem}
      onPress={() => handleMatchPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.matchContent}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchName}>{item.name}</Text>
          <Text style={styles.matchTime}>{item.created_at ? formatDate(item.created_at) : 'Recently'}</Text>
        </View>
        
        <Text style={styles.matchAge} numberOfLines={1}>
          {item.age ? `${item.age} years old` : 'Age not specified'}
        </Text>
        
        {item.bio && (
          <Text style={styles.matchBio} numberOfLines={2}>
            {item.bio}
          </Text>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => handleViewProfile(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.profileButtonText}>View</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ), [handleMatchPress, handleViewProfile, formatDate]);

  // Show loading skeleton
  if (isLoading && matches.length === 0) {
    return (
      <View style={styles.container}>
        <ListSkeleton itemCount={5} itemHeight={100} />
      </View>
    );
  }

  // Show error state
  if (hasError && matches.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Unable to load matches</Text>
        <Text style={styles.errorMessage}>
          {isOffline ? 'Please check your internet connection' : 'Something went wrong. Please try again.'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userPack && (
        <View style={styles.packInfo}>
          <Text style={styles.packText}>
            {userPack.pack_name} • {userPack.matches_remaining} matches left
          </Text>
        </View>
      )}
      
      <OptimizedFlatList
        data={matches}
        renderItem={renderMatchItem}
        keyExtractor={(item) => `match-${item.other_user_id}`}
        itemHeight={100}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#8A4B2A']}
            tintColor="#8A4B2A"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptyMessage}>
              Keep swiping to find your perfect match!
            </Text>
          </View>
        }
        contentContainerStyle={matches.length === 0 ? styles.emptyListContainer : undefined}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  packInfo: {
    backgroundColor: '#8A4B2A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  packText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8A4B2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  matchContent: {
    flex: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  matchTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  matchAge: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  matchBio: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  profileButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  profileButtonText: {
    color: '#8A4B2A',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#8A4B2A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default MatchesScreen;
