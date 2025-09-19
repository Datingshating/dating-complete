import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/types';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileScreen'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { globalSignOut } = useAuth();
  const queryClient = useQueryClient();

  const handleEditProfile = () => {
    navigation.navigate('EditProfileScreen');
  };

  const handleViewPacks = () => {
    navigation.navigate('PacksScreen');
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileImage}>
          <Text style={styles.imagePlaceholder}>Profile Photo</Text>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.age}>25 years old</Text>
          <Text style={styles.location}>New York, NY</Text>
        </View>
      </View>

      <View style={styles.bio}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bioText}>
          I love traveling, photography, and trying new cuisines. Looking for someone to share adventures with!
        </Text>
      </View>

      <View style={styles.interests}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.interestTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Travel</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Photography</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Music</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Cooking</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleViewPacks}>
          <Text style={styles.actionButtonText}>View Packs</Text>
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
});

export default ProfileScreen;
