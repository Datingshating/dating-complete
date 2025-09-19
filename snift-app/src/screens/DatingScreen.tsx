import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatingStackParamList } from '../navigation/types';
import { useAuth } from '../hooks/useAuth';
import { discoveryApi, DiscoveryFilters } from '../api/discoveryApi';
import { Profile } from '../api/types';
import LoadingSpinner from '../components/LoadingSpinner';

type Props = NativeStackScreenProps<DatingStackParamList, 'DatingScreen'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 32; // Reduced padding for better fit
// Remove fixed card height - let it be dynamic based on content
const IS_SMALL_SCREEN = screenHeight < 700;
const IS_LARGE_SCREEN = screenHeight > 800;

interface ProfileCardProps {
  profile: Profile;
  onLike: () => void;
  onSkip: () => void;
  onViewProfile: (profileId: string) => void;
  isAnimating: boolean;
  animationPhase: 'idle' | 'exiting' | 'entering';
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onLike,
  onSkip,
  onViewProfile,
  isAnimating,
  animationPhase,
}) => {
  const calculateAge = (dateOfBirth?: string, age?: number): number => {
    if (age && age > 0) return age;
    if (dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      if (isNaN(birthDate.getTime())) return 0;
      
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      return calculatedAge > 0 ? calculatedAge : 0;
    }
    return 0;
  };

  const age = calculateAge(profile.date_of_birth, profile.age);
  const interests = [
    profile.interest_1,
    profile.interest_2,
    profile.interest_3,
    profile.interest_4,
    profile.interest_5,
    profile.interest_6,
  ].filter(Boolean);

  return (
    <View style={[
      styles.card,
      {
        transform: [
          { translateX: animationPhase === 'exiting' ? -screenWidth : animationPhase === 'entering' ? screenWidth : 0 },
          { rotate: animationPhase === 'exiting' ? '-15deg' : animationPhase === 'entering' ? '15deg' : '0deg' },
          { scale: animationPhase === 'exiting' || animationPhase === 'entering' ? 0.8 : 1 }
        ],
        opacity: animationPhase === 'exiting' ? 0 : animationPhase === 'entering' ? 0 : 1,
      }
    ]}>
      {/* Background decorative elements */}
      <View style={styles.cardBackground1} />
      <View style={styles.cardBackground2} />
      <View style={styles.cardBackground3} />
      
      <View style={styles.cardContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBackground} />
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile.name || 'Unknown'}
              {age > 0 && <Text style={styles.profileAge}>, {age}</Text>}
            </Text>
            <View style={styles.profileTags}>
              <View style={[styles.tag, styles.genderTag]}>
                <Text style={styles.tagText}>{profile.gender || 'Unknown'}</Text>
              </View>
              <View style={[styles.tag, styles.statusTag]}>
                <Text style={styles.tagText}>{profile.relationship_status || 'Unknown'}</Text>
              </View>
              {profile.location && (
                <View style={[styles.tag, styles.locationTag]}>
                  <Text style={styles.tagText}>{profile.location}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Gradient Divider */}
        <View style={styles.divider} />

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>About {profile.name || 'Unknown'}</Text>
          <Text style={styles.bioText}>{profile.bio || 'No bio available'}</Text>
        </View>

        <View style={styles.divider} />

        {/* Partner Expectations Section */}
        {profile.partner_expectations && (
          <>
            <View style={styles.expectationsSection}>
              <Text style={styles.sectionTitle}>Partner Expectations</Text>
              <Text style={styles.expectationsText}>{profile.partner_expectations}</Text>
            </View>
            <View style={styles.divider} />
          </>
        )}

        {/* Interests Section */}
        <View style={styles.interestsSection}>
          <Text style={styles.interestsTitle}>Interests</Text>
          <View style={styles.interestsContainer}>
            {/* Interest Bubble 1 - Left Column, Top */}
            <View style={[styles.interestBubble, styles.interestBubble1]}>
              <Text style={styles.interestText}>{interests[0] || 'Reading'}</Text>
            </View>
            
            {/* Interest Bubble 2 - Left Column, Bottom */}
            <View style={[styles.interestBubble, styles.interestBubble2]}>
              <Text style={styles.interestText}>{interests[1] || 'Travel'}</Text>
            </View>
            
            {/* Interest Bubble 3 - Middle Column, Top */}
            <View style={[styles.interestBubble, styles.interestBubble3]}>
              <Text style={styles.interestText}>{interests[2] || 'Music'}</Text>
            </View>
            
            {/* Interest Bubble 4 - Middle Column, Bottom */}
            <View style={[styles.interestBubble, styles.interestBubble4]}>
              <Text style={styles.interestText}>{interests[3] || 'Cooking'}</Text>
            </View>
            
            {/* Interest Bubble 5 - Right Column, Top */}
            <View style={[styles.interestBubble, styles.interestBubble5]}>
              <Text style={styles.interestText}>{interests[4] || 'Photography'}</Text>
            </View>
            
            {/* Interest Bubble 6 - Right Column, Bottom */}
            <View style={[styles.interestBubble, styles.interestBubble6]}>
              <Text style={styles.interestText}>{interests[5] || 'Gaming'}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const getInterestColor = (index: number): string => {
  const colors = [
    '#6366F1', // Purple
    '#EC4899', // Pink
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Violet
  ];
  return colors[index % colors.length];
};

const DatingScreen: React.FC<Props> = ({ navigation }) => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<DiscoveryFilters>({
    ageRange: [18, 50],
    gender: '',
    relationshipStatus: '',
    location: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [likingProfiles, setLikingProfiles] = useState<Set<string>>(new Set());
  const [skippingProfiles, setSkippingProfiles] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [showMessagePrompt, setShowMessagePrompt] = useState(false);
  const [message, setMessage] = useState('');

  // Infinite query for discovery feed
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['discovery', user?.id, filters],
    queryFn: ({ pageParam = 1 }) =>
      discoveryApi.getFeed({
        userId: user?.id || '',
        page: pageParam as number,
        limit: 20,
        filters,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Flatten all pages into a single array
  const profiles = useMemo(() => {
    return data?.pages.flatMap(page => page.profiles) || [];
  }, [data]);

  // Calculate age function (matching web implementation)
  const calculateAge = (dateOfBirth?: string, age?: number): number => {
    // First priority: Use server-calculated age if available
    if (age && age > 0) return age;
    
    // Fallback: Calculate age from date_of_birth if available
    if (dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      
      // Check if birthDate is valid
      if (isNaN(birthDate.getTime())) return 0;
      
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Adjust age if birthday hasn't occurred this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      return calculatedAge > 0 ? calculatedAge : 0;
    }
    
    return 0;
  };

  // Apply filters to feed (matching web implementation)
  const filteredFeed = profiles.filter(profile => {
    const age = calculateAge(profile.date_of_birth, profile.age);
    
    // Age filter
    if (filters.ageRange && (age < filters.ageRange[0] || age > filters.ageRange[1])) {
      return false;
    }
    
    // Gender filter
    if (filters.gender && profile.gender !== filters.gender) {
      return false;
    }
    
    // Relationship status filter
    if (filters.relationshipStatus && profile.relationship_status !== filters.relationshipStatus) {
      return false;
    }
    
    // Location filter
    if (filters.location && profile.location && !profile.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const currentProfile = filteredFeed[currentIndex];

  // Load more profiles when we're near the end
  const shouldLoadMore = currentIndex >= filteredFeed.length - 2 && hasNextPage && !isFetchingNextPage;

  // Reset index when filters change to ensure valid index
  useEffect(() => {
    setCurrentIndex(0);
  }, [filters]);

  // Effect to load more profiles when needed
  useEffect(() => {
    if (shouldLoadMore) {
      fetchNextPage();
    }
  }, [shouldLoadMore, fetchNextPage]);

  // Send request mutation
  const sendRequestMutation = useMutation({
    mutationFn: ({ profileId, message }: { profileId: string; message: string }) =>
      discoveryApi.sendRequest(user?.id || '', profileId, message),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Remove the profile from the list
        queryClient.setQueryData(['discovery', user?.id, filters], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              profiles: page.profiles.filter((p: Profile) => p.id !== variables.profileId),
            })),
          };
        });
        Alert.alert('Success', 'Request sent successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to send request');
      }
    },
    onError: (error) => {
      console.error('Send request error:', error);
      Alert.alert('Error', 'Failed to send request. Please try again.');
    },
    onSettled: (_, __, variables) => {
      setLikingProfiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.profileId);
        return newSet;
      });
    },
  });

  const handleLike = useCallback(() => {
    if (isAnimating || !currentProfile) return;
    
    // Show message prompt
    setShowMessagePrompt(true);
  }, [isAnimating, currentProfile]);

  const handleSendMessage = useCallback(() => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    
    if (!currentProfile) return;
    
    // Send the request with the custom message
    sendRequestMutation.mutate({ profileId: currentProfile.id, message: message.trim() });
    setMessage('');
    setShowMessagePrompt(false);
    handleSkip(); // Move to next profile after sending request
  }, [message, currentProfile, sendRequestMutation]);

  const handleCancelMessage = useCallback(() => {
    setMessage('');
    setShowMessagePrompt(false);
  }, []);

  const handleSkip = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setAnimationPhase('exiting');
    
    // Card exit animation
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % filteredFeed.length);
      setAnimationPhase('entering');
      
      // Card entrance animation
      setTimeout(() => {
        setAnimationPhase('idle');
        setIsAnimating(false);
      }, 200);
    }, 400);
  }, [isAnimating, filteredFeed.length]);

  const handleViewProfile = useCallback((profileId: string) => {
    navigation.navigate('ProfileDetailScreen', { profileId });
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);



  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>💔</Text>
        <Text style={styles.emptyTitle}>
          {isError ? 'Failed to load profiles' : 'No profiles available'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {isError 
            ? 'Please check your connection and try again'
            : 'Check back later for new profiles!'
          }
        </Text>
        {isError && (
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [isLoading, isError, refetch]);

  if (isLoading && !data) {
    return <LoadingSpinner message="Loading profiles..." />;
  }

  // Show empty state if no profiles available
  if (filteredFeed.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Find your perfect match</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={styles.emptyTitle}>
            {profiles.length === 0 ? 'No profiles available' : 'No matches found'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {profiles.length === 0 ? 'Check back later for new profiles!' : 'No matches. Try adjusting your filter settings.'}
          </Text>
        </View>
      </View>
    );
  }

  // Show loading state if we're fetching more profiles
  if (!currentProfile && isFetchingNextPage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Find your perfect match</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A4B2A" />
          <Text style={styles.loadingText}>Loading more profiles...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Scrollable Middle Area with Card and Action Buttons */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          {currentProfile && (
            <ProfileCard
              profile={currentProfile}
              onLike={handleLike}
              onSkip={handleSkip}
              onViewProfile={handleViewProfile}
              isAnimating={isAnimating}
              animationPhase={animationPhase}
            />
          )}
        </View>

        {/* Action Buttons - inside scrollable area after card */}
        {currentProfile && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.skipButton, { opacity: isAnimating ? 0.5 : 1 }]}
              onPress={handleSkip}
              disabled={isAnimating}
            >
              <Text style={styles.skipButtonIcon}>✕</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.likeButton, { opacity: isAnimating ? 0.5 : 1 }]}
              onPress={handleLike}
              disabled={isAnimating}
            >
              <Text style={styles.likeButtonIcon}>♥</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Message Prompt Modal */}
      {showMessagePrompt && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Request</Text>
            <Text style={styles.modalSubtitle}>
              Enter a message to send with your request to {currentProfile?.name || 'Unknown'}:
            </Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message here..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelMessage}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleSendMessage}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE4CF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    zIndex: 10, // Ensure header stays above card
    backgroundColor: '#EDE4CF', // Match background to prevent overlap
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom navigation
  },
  cardContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#8A4B2A',
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: IS_SMALL_SCREEN ? 20 : 24,
    padding: IS_SMALL_SCREEN ? 20 : 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
    // Remove fixed height - let it be dynamic
  },
  cardContent: {
    flex: 1,
    zIndex: 1,
  },
  cardBackground1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255, 182, 193, 0.08)',
    borderRadius: 100,
    zIndex: 0,
  },
  cardBackground2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 218, 185, 0.06)',
    borderRadius: 75,
    zIndex: 0,
  },
  cardBackground3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -150 }],
    width: 300,
    height: 300,
    backgroundColor: 'rgba(166, 124, 82, 0.03)',
    borderRadius: 150,
    zIndex: 0,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarBackground: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 182, 193, 0.2)',
    borderRadius: 50,
    zIndex: 0,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFB6C1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    borderWidth: 2,
    borderColor: 'rgba(166, 124, 82, 0.2)',
  },
  avatarText: {
    color: '#A67C52',
    fontSize: 28,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E2E2E',
    marginBottom: 6,
  },
  profileAge: {
    color: '#A67C52',
    fontWeight: '500',
    fontSize: 18,
  },
  profileTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  genderTag: {
    backgroundColor: 'rgba(135, 206, 235, 0.3)',
    borderColor: 'rgba(135, 206, 235, 0.2)',
  },
  statusTag: {
    backgroundColor: 'rgba(255, 182, 193, 0.3)',
    borderColor: 'rgba(255, 182, 193, 0.2)',
  },
  locationTag: {
    backgroundColor: 'rgba(188, 227, 196, 0.3)',
    borderColor: 'rgba(188, 227, 196, 0.2)',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2E2E2E',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(166, 124, 82, 0.15)',
    marginVertical: 20,
  },
  bioSection: {
    marginBottom: 20,
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A0522D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    fontWeight: '400',
  },
  expectationsSection: {
    marginBottom: 20,
    zIndex: 1,
  },
  expectationsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    fontWeight: '400',
  },
  interestsSection: {
    zIndex: 1,
    marginBottom: 16,
  },
  interestsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A67C52',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginBottom: 16,
  },
  interestsContainer: {
    position: 'relative',
    minHeight: 280, // Minimum height to ensure all bubbles fit
    overflow: 'visible', // Allow bubbles to be visible
  },
  interestBubble: {
    position: 'absolute',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    padding: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  interestBubble1: {
    top: 20,
    left: 15,
    width: 65,
    height: 65,
    backgroundColor: '#6366F1',
  },
  interestBubble2: {
    top: 120,
    left: 15,
    width: 60,
    height: 60,
    backgroundColor: '#EC4899',
  },
  interestBubble3: {
    top: 40,
    left: 100,
    width: 65,
    height: 65,
    backgroundColor: '#10B981',
  },
  interestBubble4: {
    top: 140,
    left: 100,
    width: 55,
    height: 55,
    backgroundColor: '#F59E0B',
  },
  interestBubble5: {
    top: 30,
    left: 185,
    width: 60,
    height: 60,
    backgroundColor: '#EF4444',
  },
  interestBubble6: {
    top: 130,
    left: 185,
    width: 55,
    height: 55,
    backgroundColor: '#8B5CF6',
  },
  interestText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: IS_SMALL_SCREEN ? 24 : 32,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 20,
  },
  actionButton: {
    width: IS_SMALL_SCREEN ? 60 : 70,
    height: IS_SMALL_SCREEN ? 60 : 70,
    borderRadius: IS_SMALL_SCREEN ? 30 : 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  skipButton: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  likeButton: {
    backgroundColor: '#107980',
    borderColor: '#107980',
  },
  viewButton: {
    backgroundColor: 'transparent',
    borderColor: '#8A4B2A',
  },
  skipButtonIcon: {
    fontSize: IS_SMALL_SCREEN ? 24 : 28,
    color: 'white',
    fontWeight: 'bold',
  },
  likeButtonIcon: {
    fontSize: IS_SMALL_SCREEN ? 24 : 28,
    color: 'white',
    fontWeight: 'bold',
  },
  viewButtonIcon: {
    fontSize: 20,
    color: '#8A4B2A',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  footerText: {
    color: '#8A4B2A',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#8A4B2A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  sendButton: {
    backgroundColor: '#8A4B2A',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DatingScreen;
