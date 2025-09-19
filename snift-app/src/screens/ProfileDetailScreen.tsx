import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DatingStackParamList } from '../navigation/types';
import { profilesApi } from '../api/profilesApi';
import { Profile } from '../api/types';

type Props = NativeStackScreenProps<DatingStackParamList, 'ProfileDetailScreen'>;

const ProfileDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { profileId } = route.params;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data on mount
  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileData = await profilesApi.getProfile(profileId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth?: string): number | null => {
    if (!dateOfBirth) return null;
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
    if (!profile) return '';
    return profile.custom_location || profile.location || 'Location not set';
  };

  // Get interests array
  const getInterests = (): string[] => {
    if (!profile) return [];
    const interests = [
      profile.interest_1,
      profile.interest_2,
      profile.interest_3,
      profile.interest_4,
      profile.interest_5,
      profile.interest_6,
    ].filter(interest => interest && interest.trim() !== '');
    return interests;
  };

  const handleSendRequest = () => {
    // TODO: Implement send request functionality
    Alert.alert('Send Request', 'Request functionality will be implemented soon!');
  };

  const handleAcceptRequest = () => {
    // TODO: Implement accept request functionality
    Alert.alert('Accept Request', 'Accept request functionality will be implemented soon!');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8A4B2A" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const age = calculateAge(profile.date_of_birth);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile Details</Text>
      </View>

      <View style={styles.profileImage}>
        <Text style={styles.imagePlaceholder}>Profile Photo</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.name}>{profile.name}</Text>
        {age && <Text style={styles.age}>{age} years old</Text>}
        <Text style={styles.location}>{getDisplayLocation()}</Text>
        {profile.bio && (
          <Text style={styles.bio}>{profile.bio}</Text>
        )}
      </View>

      {profile.partner_expectations && (
        <View style={styles.expectations}>
          <Text style={styles.sectionTitle}>Partner Expectations</Text>
          <Text style={styles.bio}>{profile.partner_expectations}</Text>
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
        <TouchableOpacity style={styles.passButton} onPress={() => navigation.goBack()}>
          <Text style={styles.passButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeButton} onPress={handleSendRequest}>
          <Text style={styles.likeButtonText}>Send Request</Text>
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
  profileId: {
    fontSize: 14,
    color: '#6B7280',
  },
  profileImage: {
    height: 300,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePlaceholder: {
    fontSize: 16,
    color: '#6B7280',
  },
  details: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  age: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  interests: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
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
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 16,
  },
  passButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  passButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  likeButton: {
    flex: 1,
    backgroundColor: '#8A4B2A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  likeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  location: {
    fontSize: 14,
    color: '#8A4B2A',
    fontWeight: '500',
    marginBottom: 12,
  },
  expectations: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
});

export default ProfileDetailScreen;
