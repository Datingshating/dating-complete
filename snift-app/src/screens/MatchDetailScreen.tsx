import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MatchesStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MatchesStackParamList, 'MatchDetailScreen'>;

const MatchDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { matchId } = route.params;

  const handleStartChat = () => {
    // Navigate to chat with this match
    console.log('Start chat with match:', matchId);
  };

  const handleUnmatch = () => {
    // Handle unmatch action
    console.log('Unmatch:', matchId);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Match Details</Text>
        <Text style={styles.matchId}>Match ID: {matchId}</Text>
      </View>

      <View style={styles.matchInfo}>
        <View style={styles.profileImage}>
          <Text style={styles.imagePlaceholder}>Match Photo</Text>
        </View>
        
        <View style={styles.details}>
          <Text style={styles.name}>Match Name</Text>
          <Text style={styles.age}>25 years old</Text>
          <Text style={styles.matchDate}>Matched 2 days ago</Text>
        </View>
      </View>

      <View style={styles.bio}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bioText}>
          This is a sample bio for the match. It contains information about their interests, hobbies, and what they're looking for in a relationship.
        </Text>
      </View>

      <View style={styles.interests}>
        <Text style={styles.sectionTitle}>Shared Interests</Text>
        <View style={styles.interestTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Travel</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Music</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Photography</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.unmatchButton} onPress={handleUnmatch}>
          <Text style={styles.unmatchButtonText}>Unmatch</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatButton} onPress={handleStartChat}>
          <Text style={styles.chatButtonText}>Start Chat</Text>
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
  matchId: {
    fontSize: 14,
    color: '#6B7280',
  },
  matchInfo: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileImage: {
    height: 200,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePlaceholder: {
    fontSize: 16,
    color: '#6B7280',
  },
  details: {
    alignItems: 'center',
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
    marginBottom: 4,
  },
  matchDate: {
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
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 16,
  },
  unmatchButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  unmatchButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#8A4B2A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MatchDetailScreen;
