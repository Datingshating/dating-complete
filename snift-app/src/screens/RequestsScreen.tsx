import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RequestsStackParamList, MainTabParamList } from '../navigation/types';
import { requestsApi } from '../api/requestsApi';
import { subscriptionsApi } from '../api/subscriptionsApi';
import { ConnectionRequest, UserPack } from '../api/types';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

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
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
  const [userPack, setUserPack] = useState<UserPack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

  const fetchData = useCallback(async (showLoading = true) => {
    if (!user?.id) return;
    
    try {
      if (showLoading) setIsLoading(true);
      
      const [incoming, outgoing, pack] = await Promise.all([
        requestsApi.getIncomingRequests(user.id),
        requestsApi.getOutgoingRequests(user.id),
        subscriptionsApi.getUserPack(user.id)
      ]);
      
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
      setUserPack(pack);
    } catch (error) {
      console.error('Error fetching requests data:', error);
      Alert.alert('Error', 'Failed to load requests. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await requestsApi.acceptRequest(requestId);
      
      if (response.error) {
        if (response.errorCode === 'MATCHES_LIMIT_REACHED') {
          Alert.alert(
            "You've reached your matches limit",
            `Your plan allows up to ${response.total} matches. Upgrade to continue.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'View Packs', onPress: () => navigation.navigate('Profile', { screen: 'PacksScreen' }) }
            ]
          );
        } else if (response.errorCode === 'MATCHES_LIMIT_REACHED_SENDER') {
          Alert.alert(
            'Cannot accept request',
            'The sender has reached their matches limit. Ask them to upgrade.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Error', response.error);
        }
        return;
      }
      
      Alert.alert('Success', 'Accepted — a match has been created! You can now chat with this person.');
      await fetchData(false);
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept request. Please try again.');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const response = await requestsApi.declineRequest(requestId);
      
      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }
      
      await fetchData(false);
    } catch (error) {
      console.error('Error declining request:', error);
      Alert.alert('Error', 'Failed to decline request. Please try again.');
    }
  };

  const handleWithdrawRequest = async (requestId: string) => {
    try {
      const response = await requestsApi.withdrawRequest(requestId);
      
      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }
      
      await fetchData(false);
    } catch (error) {
      console.error('Error withdrawing request:', error);
      Alert.alert('Error', 'Failed to withdraw request. Please try again.');
    }
  };

  const handleViewProfile = async (request: ConnectionRequest) => {
    const userId = request.from_user_id || request.to_user_id;
    if (userId) {
      navigation.navigate('ProfileDetailScreen', { profileId: userId });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderRequestItem = ({ item }: { item: RequestWithType }) => (
    <TouchableOpacity
      style={styles.requestItem}
      onPress={() => handleViewProfile(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.name || 'U').charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.requestContent}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestName}>{item.name || 'Unknown User'}</Text>
          <View style={styles.requestInfo}>
            <Text style={styles.requestDate}>{formatDate(item.created_at)}</Text>
            <View style={[
              styles.typeBadge,
              item.type === 'incoming' ? styles.incomingBadge : styles.outgoingBadge
            ]}>
              <Text style={[
                styles.typeText,
                item.type === 'incoming' ? styles.incomingText : styles.outgoingText
              ]}>
                {item.type === 'incoming' ? 'Incoming' : 'Outgoing'}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.requestMessage} numberOfLines={2}>
          {item.message || 'No message'}
        </Text>
        
        {item.type === 'incoming' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptRequest(item.id)}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleDeclineRequest(item.id)}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {item.type === 'outgoing' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.withdrawButton]}
              onPress={() => handleWithdrawRequest(item.id)}
            >
              <Text style={styles.withdrawButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const currentRequests = activeTab === 'incoming' ? incomingRequests : outgoingRequests;
  const requestsWithType: RequestWithType[] = currentRequests.map(req => ({
    ...req,
    type: activeTab
  }));

  if (isLoading) {
    return <LoadingSpinner message="Loading connection requests..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Requests</Text>
        <Text style={styles.subtitle}>Connection requests</Text>
        
        {/* Pack Status */}
        {userPack && (
          <View style={styles.packStatus}>
            <Text style={styles.packText}>
              {userPack.requests_remaining === -1 
                ? 'Unlimited requests' 
                : `${userPack.requests_remaining}/${userPack.requests_total} requests remaining`
              }
            </Text>
          </View>
        )}
      </View>

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

      {requestsWithType.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            {activeTab === 'incoming' ? 'No pending requests' : 'No outgoing requests'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'incoming' 
              ? 'When someone sends you a request, it will appear here.'
              : 'Requests you send will appear here.'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={requestsWithType}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          style={styles.requestsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3EC',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  packStatus: {
    backgroundColor: '#FAF7F3',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6DFD4',
  },
  packText: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FAF7F3',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E6DFD4',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0F766E',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  requestsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  requestItem: {
    backgroundColor: '#FAF7F3',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6DFD4',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0F766E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  requestContent: {
    flex: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  requestInfo: {
    alignItems: 'flex-end',
  },
  requestDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  incomingBadge: {
    backgroundColor: '#DCFCE7',
  },
  outgoingBadge: {
    backgroundColor: '#FEF3C7',
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  incomingText: {
    color: '#166534',
  },
  outgoingText: {
    color: '#92400E',
  },
  requestMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#0F766E',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  declineButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  withdrawButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  withdrawButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RequestsScreen;
