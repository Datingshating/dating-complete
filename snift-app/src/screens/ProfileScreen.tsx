import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/types';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '../api/profilesApi';
import { User } from '../api/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileScreen'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { globalSignOut, user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await profilesApi.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth?: string): number => {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Get display location
  const getDisplayLocation = (): string => {
    if (!user) return '';
    return user.custom_location || user.location || 'Location not set';
  };

  // Get subscription status
  const getSubscriptionStatus = (): string => {
    if (!user || !user.status) return 'Unknown';
    return user.status === 'approved' ? 'Active' : user.status.charAt(0).toUpperCase() + user.status.slice(1);
  };

  // Get interests array
  const getInterests = (): string[] => {
    if (!user) return [];
    const interests = [
      user.interest_1,
      user.interest_2,
      user.interest_3,
      user.interest_4,
      user.interest_5,
      user.interest_6,
    ].filter((interest): interest is string => interest !== undefined && interest.trim() !== '');
    return interests;
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfileScreen');
  };

  const handleViewPacks = () => {
    navigation.navigate('PacksScreen');
  };

  const handleAdminPanel = () => {
    navigation.navigate('AdminScreen');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await globalSignOut();
              // The AuthGate will automatically handle the navigation
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleOpenPrivacyPolicy = async () => {
    const url = 'https://www.thesnift.com/privacy';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open privacy policy. Please check your internet connection.');
      }
    } catch (error) {
      console.error('Error opening privacy policy:', error);
      Alert.alert('Error', 'Failed to open privacy policy.');
    }
  };

  const handleOpenTermsOfService = async () => {
    const url = 'https://www.thesnift.com/terms';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open terms of service. Please check your internet connection.');
      }
    } catch (error) {
      console.error('Error opening terms of service:', error);
      Alert.alert('Error', 'Failed to open terms of service.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8A4B2A" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileImage}>
          <Text style={styles.imagePlaceholder}>Profile Photo</Text>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.name || 'Unknown'}</Text>
          <Text style={styles.age}>{calculateAge(user?.date_of_birth)} years old</Text>
          <Text style={styles.location}>{getDisplayLocation()}</Text>
          <Text style={styles.status}>Status: {getSubscriptionStatus()}</Text>
        </View>
      </View>

      {user?.bio && (
        <View style={styles.bio}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>
      )}

      {user?.partner_expectations && (
        <View style={styles.expectations}>
          <Text style={styles.sectionTitle}>Partner Expectations</Text>
          <Text style={styles.bioText}>{user.partner_expectations}</Text>
        </View>
      )}

      <View style={styles.interests}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.interestTags}>
          {getInterests().map((interest, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleViewPacks}>
          <Text style={styles.actionButtonText}>View Packs</Text>
        </TouchableOpacity>
        
        {authUser?.is_admin && (
          <TouchableOpacity style={[styles.actionButton, styles.adminButton]} onPress={handleAdminPanel}>
            <Text style={styles.adminButtonText}>Admin Panel</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.actionButton} onPress={handleOpenPrivacyPolicy}>
          <Text style={styles.actionButtonText}>Privacy Policy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleOpenTermsOfService}>
          <Text style={styles.actionButtonText}>Terms of Service</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE4CF',
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
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePlaceholder: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  age: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#8A4B2A',
    fontWeight: '500',
  },
  bio: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  interests: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#8A4B2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  adminButton: {
    backgroundColor: '#0F766E',
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#EDE4CF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#EDE4CF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
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
  status: {
    fontSize: 14,
    color: '#8A4B2A',
    fontWeight: '500',
    marginTop: 4,
  },
  expectations: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
});

export default ProfileScreen;
