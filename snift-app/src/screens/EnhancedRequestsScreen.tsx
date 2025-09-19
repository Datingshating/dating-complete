import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { RequestsStackParamList, MainTabParamList } from '../navigation/types';
import { requestsApi } from '../api/requestsApi';
import { subscriptionsApi } from '../api/subscriptionsApi';
import { ConnectionRequest, UserPack } from '../api/types';
import { useAuth } from '../hooks/useAuth';
import { useAndroidBackButton } from '../hooks/useAndroidBackButton';
import { useNetInfo } from '../hooks/useNetInfo';
import LoadingSpinner from '../components/LoadingSpinner';
import OptimizedFlatList from '../components/OptimizedFlatList';
import ListSkeleton from '../components/ListSkeleton';
import { apiCall } from '../api/enhancedApiClient';

type RequestsScreenNavigationProp = CompositeNavigationProp<
  NativeStackScreenProps<RequestsStackParamList, 'RequestsScreen'>['navigation'],
  BottomTabNavigationProp<MainTabParamList>
>;

type Props = {
  navigation: RequestsScreenNavigationProp;
};

interface RequestWithType extends ConnectionRequest {
  type: 'incoming' | 'outgoing';
}

const RequestsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { isOffline } = useNetInfo();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

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

  // Fetch incoming requests
  const {
    data: incomingRequests = [],
    isLoading: isLoadingIncoming,
    error: incomingError,
    refetch: refetchIncoming,
  } = useQuery({
    queryKey: ['incomingRequests', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID not available');
      
      return apiCall(
        () => requestsApi.getIncomingRequests(user.id),
        {
          errorMessage: 'Failed to load incoming requests',
        }
      );
    },
    enabled: !!user?.id && !isOffline,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch outgoing requests
  const {
    data: outgoingRequests = [],
    isLoading: isLoadingOutgoing,
    error: outgoingError,
    refetch: refetchOutgoing,
  } = useQuery({
    queryKey: ['outgoingRequests', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID not available');
      
      return apiCall(
        () => requestsApi.getOutgoingRequests(user.id),
        {
          errorMessage: 'Failed to load outgoing requests',
        }
      );
    },
    enabled: !!user?.id && !isOffline,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user pack
  const {
    data: userPack = null,
    isLoading: isLoadingPack,
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

  // Accept request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return apiCall(
        () => requestsApi.acceptRequest(requestId),
        {
          errorMessage: 'Failed to accept request',
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomingRequests', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['matches', user?.id] });
      Alert.alert('Success', 'Request accepted! You now have a new match.');
    },
    onError: (error) => {
      console.error('Accept request error:', error);
    },
  });

  // Reject request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return apiCall(
        () => requestsApi.declineRequest(requestId),
        {
          errorMessage: 'Failed to reject request',
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomingRequests', user?.id] });
    },
    onError: (error) => {
      console.error('Reject request error:', error);
    },
  });

  const isLoading = isLoadingIncoming || isLoadingOutgoing || isLoadingPack;
  const hasError = incomingError || outgoingError;

  // Handle refresh
  const onRefresh = useCallback(async () => {
      await Promise.all([
        refetchIncoming(),
        refetchOutgoing(),
        queryClient.invalidateQueries({ queryKey: ['userPack', user?.id || ''] }),
      ]);
  }, [refetchIncoming, refetchOutgoing, queryClient, user?.id]);

  // Navigation handlers
  const handleRequestPress = useCallback((request: ConnectionRequest) => {
    navigation.navigate('RequestDetailScreen', { requestId: request.id });
  }, [navigation]);

  const handleViewProfile = useCallback((request: ConnectionRequest) => {
    const profileId = request.from_user_id || request.to_user_id;
    if (profileId) {
      navigation.navigate('ProfileDetailScreen', { profileId });
    }
  }, [navigation]);

  // Action handlers
  const handleAcceptRequest = useCallback((requestId: string) => {
    Alert.alert(
      'Accept Request',
      'Are you sure you want to accept this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept', onPress: () => acceptRequestMutation.mutate(requestId) },
      ]
    );
  }, [acceptRequestMutation]);

  const handleRejectRequest = useCallback((requestId: string) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => rejectRequestMutation.mutate(requestId) },
      ]
    );
  }, [rejectRequestMutation]);

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

  // Prepare data with type information
  const currentData = activeTab === 'incoming' 
    ? incomingRequests.map(req => ({ ...req, type: 'incoming' as const }))
    : outgoingRequests.map(req => ({ ...req, type: 'outgoing' as const }));

  // Render request item
  const renderRequestItem = useCallback(({ item }: { item: RequestWithType }) => (
    <TouchableOpacity
      style={styles.requestItem}
      onPress={() => handleRequestPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.name || 'U').charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.requestContent}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestName}>{item.name || 'Unknown'}</Text>
          <Text style={styles.requestTime}>{formatDate(item.created_at)}</Text>
        </View>
        
        <Text style={styles.requestAge} numberOfLines={1}>
          {item.location || 'Location not specified'}
        </Text>
        
        {item.bio && (
          <Text style={styles.requestBio} numberOfLines={2}>
            {item.bio}
          </Text>
        )}
      </View>
      
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => handleViewProfile(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.profileButtonText}>View</Text>
        </TouchableOpacity>
        
        {item.type === 'incoming' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptRequest(item.id)}
              disabled={acceptRequestMutation.isPending}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectRequest(item.id)}
              disabled={rejectRequestMutation.isPending}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), [
    handleRequestPress, 
    handleViewProfile, 
    handleAcceptRequest, 
    handleRejectRequest, 
    formatDate,
    acceptRequestMutation.isPending,
    rejectRequestMutation.isPending,
  ]);

  // Show loading skeleton
  if (isLoading && currentData.length === 0) {
    return (
      <View style={styles.container}>
        <ListSkeleton itemCount={5} itemHeight={120} />
      </View>
    );
  }

  // Show error state
  if (hasError && currentData.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Unable to load requests</Text>
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
      
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'incoming' && styles.activeTab]}
          onPress={() => setActiveTab('incoming')}
        >
          <Text style={[styles.tabText, activeTab === 'incoming' && styles.activeTabText]}>
            Incoming ({incomingRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'outgoing' && styles.activeTab]}
          onPress={() => setActiveTab('outgoing')}
        >
          <Text style={[styles.tabText, activeTab === 'outgoing' && styles.activeTabText]}>
            Outgoing ({outgoingRequests.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      <OptimizedFlatList
        data={currentData}
        renderItem={renderRequestItem}
        keyExtractor={(item) => `request-${item.type}-${item.id}`}
        itemHeight={120}
        onRefresh={onRefresh}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No {activeTab} requests
            </Text>
            <Text style={styles.emptyMessage}>
              {activeTab === 'incoming' 
                ? 'No one has sent you a request yet.' 
                : 'You haven\'t sent any requests yet.'}
            </Text>
          </View>
        }
        contentContainerStyle={currentData.length === 0 ? styles.emptyListContainer : undefined}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#8A4B2A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  requestItem: {
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
  requestContent: {
    flex: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  requestTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  requestAge: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  requestBio: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  requestActions: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  profileButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  profileButtonText: {
    color: '#8A4B2A',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
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

export default RequestsScreen;
