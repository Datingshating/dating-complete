import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/types';
import { profilesApi } from '../api/profilesApi';
import { User } from '../api/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfileScreen'>;

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    relationshipStatus: '',
    partnerExpectations: '',
    interest1: '',
    interest2: '',
    interest3: '',
    interest4: '',
    interest5: '',
    interest6: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await profilesApi.getMe();
      setUser(userData);
      setFormData({
        bio: userData.bio || '',
        relationshipStatus: userData.relationship_status || '',
        partnerExpectations: userData.partner_expectations || '',
        interest1: userData.interest_1 || '',
        interest2: userData.interest_2 || '',
        interest3: userData.interest_3 || '',
        interest4: userData.interest_4 || '',
        interest5: userData.interest_5 || '',
        interest6: userData.interest_6 || '',
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateBio = (bio: string): string => {
    if (!bio.trim()) return 'Bio is required';
    const wordCount = bio.trim().split(/\s+/).length;
    if (wordCount < 25) return 'Bio must contain at least 25 words';
    return '';
  };

  const validatePartnerExpectations = (expectations: string): string => {
    if (!expectations.trim()) return 'Partner expectations are required';
    const wordCount = expectations.trim().split(/\s+/).length;
    if (wordCount < 25) return 'Partner expectations must contain at least 25 words';
    return '';
  };

  const validateInterests = (): string => {
    const interests = [
      formData.interest1,
      formData.interest2,
      formData.interest3,
      formData.interest4,
      formData.interest5,
      formData.interest6,
    ].filter(interest => interest && interest.trim() !== '');
    
    if (interests.length < 6) return 'Please select exactly 6 interests';
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    const bioError = validateBio(formData.bio);
    if (bioError) newErrors.bio = bioError;
    
    const expectationsError = validatePartnerExpectations(formData.partnerExpectations);
    if (expectationsError) newErrors.partnerExpectations = expectationsError;
    
    const interestsError = validateInterests();
    if (interestsError) newErrors.interests = interestsError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user) return;
    
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }

    try {
      setSaving(true);
      const response = await profilesApi.updateProfile({
        userId: user.id,
        bio: formData.bio,
        relationshipStatus: formData.relationshipStatus,
        partnerExpectations: formData.partnerExpectations,
        interest1: formData.interest1,
        interest2: formData.interest2,
        interest3: formData.interest3,
        interest4: formData.interest4,
        interest5: formData.interest5,
        interest6: formData.interest6,
      });

      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
        <Text style={styles.errorText}>Failed to load profile data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Update your information</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.label}>Bio *</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.bio && styles.inputError]}
            value={formData.bio}
            onChangeText={(value) => updateField('bio', value)}
            placeholder="Tell us about yourself (minimum 25 words)..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
          <Text style={styles.helperText}>
            {formData.bio.trim().split(/\s+/).length} words (minimum 25)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Relationship Status</Text>
          <TextInput
            style={styles.input}
            value={formData.relationshipStatus}
            onChangeText={(value) => updateField('relationshipStatus', value)}
            placeholder="e.g., Single, Looking for relationship, etc."
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Partner Expectations *</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.partnerExpectations && styles.inputError]}
            value={formData.partnerExpectations}
            onChangeText={(value) => updateField('partnerExpectations', value)}
            placeholder="Describe what you're looking for in a partner (minimum 25 words)..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.partnerExpectations && <Text style={styles.errorText}>{errors.partnerExpectations}</Text>}
          <Text style={styles.helperText}>
            {formData.partnerExpectations.trim().split(/\s+/).length} words (minimum 25)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Interests * (6 required)</Text>
          {errors.interests && <Text style={styles.errorText}>{errors.interests}</Text>}
          
          <View style={styles.interestsGrid}>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <View key={num} style={styles.interestInputContainer}>
                <Text style={styles.interestLabel}>Interest {num}</Text>
                <TextInput
                  style={styles.interestInput}
                  value={formData[`interest${num}` as keyof typeof formData]}
                  onChangeText={(value) => updateField(`interest${num}`, value)}
                  placeholder={`Interest ${num}`}
                />
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={saving}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
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
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  photoSection: {
    marginBottom: 24,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoPlaceholder: {
    width: '47%',
    height: 120,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  photoText: {
    color: '#6B7280',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#8A4B2A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
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
    fontSize: 14,
    color: '#DC2626',
    marginTop: 4,
  },
  retryButton: {
    backgroundColor: '#8A4B2A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestInputContainer: {
    width: '48%',
  },
  interestLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  interestInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
});

export default EditProfileScreen;
