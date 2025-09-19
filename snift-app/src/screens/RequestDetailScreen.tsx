import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RequestsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RequestsStackParamList, 'RequestDetailScreen'>;

const RequestDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { requestId } = route.params;

  const handleAccept = () => {
    // Handle accept request
    console.log('Accept request:', requestId);
  };

  const handleDecline = () => {
    // Handle decline request
    console.log('Decline request:', requestId);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Connection Request</Text>
        <Text style={styles.requestId}>Request ID: {requestId}</Text>
      </View>

      <View style={styles.requestInfo}>
        <View style={styles.profileImage}>
          <Text style={styles.imagePlaceholder}>Profile Photo</Text>
        </View>
        
        <View style={styles.details}>
          <Text style={styles.name}>Requestor Name</Text>
          <Text style={styles.age}>25 years old</Text>
          <Text style={styles.requestDate}>Requested 1 day ago</Text>
        </View>
      </View>

      <View style={styles.message}>
        <Text style={styles.sectionTitle}>Message</Text>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            "Hi! I saw your profile and thought we might have a lot in common. Would love to get to know you better!"
          </Text>
        </View>
      </View>

      <View style={styles.bio}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bioText}>
          This is a sample bio for the person who sent the request. It contains information about their interests, hobbies, and what they're looking for in a relationship.
        </Text>
      </View>

      <View style={styles.interests}>
        <Text style={styles.sectionTitle}>Interests</Text>
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
        <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptButtonText}>Accept</Text>
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
  requestId: {
    fontSize: 14,
    color: '#6B7280',
  },
  requestInfo: {
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
  requestDate: {
    fontSize: 14,
    color: '#8A4B2A',
    fontWeight: '500',
  },
  message: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  messageBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8A4B2A',
  },
  messageText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  bio: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  declineButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#8A4B2A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RequestDetailScreen;
