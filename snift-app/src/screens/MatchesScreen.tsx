import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MatchesStackParamList, MainTabParamList } from '../navigation/types';
import { matchesApi } from '../api/matchesApi';
import { subscriptionsApi } from '../api/subscriptionsApi';
import { MatchItem, UserPack } from '../api/types';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

type MatchesScreenNavigationProp = CompositeNavigationProp<
  NativeStackScreenProps<MatchesStackParamList, 'MatchesScreen'>['navigation'],
  BottomTabNavigationProp<MainTabParamList>
>;

type Props = {
  navigation: MatchesScreenNavigationProp;
};

const MatchesScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [userPack, setUserPack] = useState<UserPack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!user?.id) return;
    
    try {
      if (showLoading) setIsLoading(true);
      
      const [matchesData, pack] = await Promise.all([
        matchesApi.getMatches(user.id),
        subscriptionsApi.getUserPack(user.id)
      ]);
      
      setMatches(matchesData);
      setUserPack(pack);
    } catch (error) {
      console.error('Error fetching matches data:', error);
      Alert.alert('Error', 'Failed to load matches. Please try again.');
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

  const handleMatchPress = (match: MatchItem) => {
    // Navigate to chat thread with the match
    navigation.navigate('Chat', { 
      screen: 'ChatThreadScreen',
      params: { 
        chatId: match.other_user_id, 
        userName: match.name 
      }
    });
  };

  const handleViewProfile = (match: MatchItem) => {
    navigation.navigate('ProfileDetailScreen', { profileId: match.other_user_id });
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

  const renderMatchItem = ({ item }: { item: MatchItem }) => (
    <TouchableOpacity
      style={styles.matchItem}
      onPress={() => handleMatchPress(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.matchContent}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchName}>{item.name}</Text>
          <Text style={styles.matchDate}>{formatDate(item.created_at || new Date().toISOString())}</Text>
        </View>
        
        <Text style={styles.matchBio} numberOfLines={2}>
          {item.bio}
        </Text>
        
        <View style={styles.matchInterests}>
          {[item.interest_1, item.interest_2, item.interest_3].filter(Boolean).map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.chatButton]}
            onPress={() => handleMatchPress(item)}
          >
            <Text style={styles.chatButtonText}>💬 Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.profileButton]}
            onPress={() => handleViewProfile(item)}
          >
            <Text style={styles.profileButtonText}>👤 Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading your matches..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.subtitle}>People you matched with</Text>
        
        {/* Pack Status */}
        {userPack && (
          <View style={styles.packStatus}>
            <Text style={styles.packText}>
              {userPack.matches_remaining === -1 
                ? 'Unlimited matches' 
                : `${userPack.matches_remaining}/${userPack.matches_total} matches remaining`
              }
            </Text>
          </View>
        )}
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptySubtitle}>
            Start sending requests to find your perfect match!
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id}
          style={styles.matchesList}
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
  matchesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  matchItem: {
    backgroundColor: '#FAF7F3',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6DFD4',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F766E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  matchContent: {
    flex: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  matchDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  matchBio: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  matchInterests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  interestTag: {
    backgroundColor: '#E6DFD4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  chatButton: {
    backgroundColor: '#0F766E',
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  profileButtonText: {
    color: '#6B7280',
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

export default MatchesScreen;
