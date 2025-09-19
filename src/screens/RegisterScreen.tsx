import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Modal,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../api/auth';
import { RegisterRequest } from '../api/types';
import { RootStackParamList } from '../navigation/types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const cities = [
  "Pune",
  "Delhi NCR",
  "Mumbai",
  "Bengaluru",
  "Kolkata",
  "Hyderabad",
  "Chennai",
  "Chandigarh",
  "Ahmedabad",
  "Indore",
  "Jaipur",
  "Lucknow",
  "Goa",
  "Gurgaon (Gurugram)",
  "Bhopal",
  "Others"
];

const interests = [
  "Travel & Adventure",
  "Cooking & Food",
  "Music & Concerts",
  "Movies & TV Shows",
  "Reading & Books",
  "Fitness & Gym",
  "Dancing",
  "Photography",
  "Art & Creativity",
  "Gaming",
  "Sports & Athletics",
  "Nature & Hiking",
  "Technology & Gadgets",
  "Fashion & Style",
  "Coffee & Cafes",
  "Wine & Fine Dining",
  "Yoga & Meditation",
  "Pets & Animals",
  "Comedy & Stand-up",
  "Board Games",
  "Volunteering",
  "Language Learning",
  "DIY & Crafts",
  "Astronomy",
  "History & Museums",
  "Fashion & Shopping",
  "Beach & Water Sports",
  "Camping & Outdoors",
  "Classical Music",
  "Street Food",
  "Skincare & Beauty"
];

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [form, setForm] = useState<RegisterRequest>({
    name: '',
    gender: 'male',
    dateOfBirth: '',
    whatsappNumber: '',
    instagramHandle: '',
    location: '',
    customLocation: '',
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
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Update form when selectedInterests changes
  useEffect(() => {
    const newForm = { ...form };
    for (let i = 0; i < 6; i++) {
      newForm[`interest${i + 1}` as keyof RegisterRequest] = selectedInterests[i] || '';
    }
    setForm(newForm);
  }, [selectedInterests]);

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else if (selectedInterests.length < 6) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }
    if (!form.gender) {
      Alert.alert('Error', 'Please select your gender');
      return false;
    }
    if (!form.dateOfBirth) {
      Alert.alert('Error', 'Date of birth is required');
      return false;
    }
    if (!form.whatsappNumber.trim()) {
      Alert.alert('Error', 'WhatsApp number is required');
      return false;
    }
    if (!form.instagramHandle.trim()) {
      Alert.alert('Error', 'Instagram handle is required');
      return false;
    }
    if (!form.location) {
      Alert.alert('Error', 'Please select your location');
      return false;
    }
    if (form.location === 'Others' && !form.customLocation.trim()) {
      Alert.alert('Error', 'Please enter your custom location');
      return false;
    }
    if (!form.relationshipStatus) {
      Alert.alert('Error', 'Please select your relationship status');
      return false;
    }
    if (getWordCount(form.bio) < 25) {
      Alert.alert('Error', 'Bio must be at least 25 words');
      return false;
    }
    if (getWordCount(form.partnerExpectations) < 25) {
      Alert.alert('Error', 'Partner expectations must be at least 25 words');
      return false;
    }
    if (selectedInterests.length !== 6) {
      Alert.alert('Error', 'Please select exactly 6 interests');
      return false;
    }
    if (!acceptedTerms) {
      Alert.alert('Error', 'Please accept the Terms and Conditions to continue');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register(form);
      
      if (response.ok) {
        Alert.alert(
          'Success! 🎉', 
          'Hold on — we will review and verify your profile. After approval, you will receive a unique ID and password on WhatsApp.',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      } else {
        Alert.alert('Error', 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderModal = (title: string, items: string[], selectedValue: string, onSelect: (value: string) => void, onClose: () => void) => (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background">
        <View className="flex-row justify-between items-center p-4 border-b border-border">
          <Text className="text-lg font-semibold text-card-foreground">{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-primary text-lg font-medium">Done</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelect(item)}
              className={`p-4 border-b border-border ${
                selectedValue === item ? 'bg-primary/10' : ''
              }`}
            >
              <Text className={`text-card-foreground ${
                selectedValue === item ? 'font-semibold' : ''
              }`}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          <View className="text-center mb-8">
            <Text className="font-heading text-2xl font-semibold text-card-foreground mb-2">
              Tell us about you
            </Text>
            <Text className="text-muted-foreground text-sm">
              It takes ~2 minutes.
            </Text>
          </View>

          {/* Basics Section */}
          <View className="mb-8">
            <Text className="text-base font-semibold text-card-foreground mb-4">Basics</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-bold text-card-foreground mb-2">Name *</Text>
                <TextInput
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground"
                  placeholder="Enter your name"
                  editable={!loading}
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-card-foreground mb-2">Gender *</Text>
                <TouchableOpacity
                  onPress={() => setShowGenderModal(true)}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 flex-row justify-between items-center"
                  disabled={loading}
                >
                  <Text className={`text-card-foreground ${form.gender ? '' : 'text-muted-foreground'}`}>
                    {form.gender || 'Select gender'}
                  </Text>
                  <Text className="text-muted-foreground">▼</Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text className="text-sm font-bold text-card-foreground mb-2">Date of birth *</Text>
                <TextInput
                  value={form.dateOfBirth}
                  onChangeText={(text) => setForm({ ...form, dateOfBirth: text })}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground"
                  placeholder="YYYY-MM-DD"
                  editable={!loading}
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-card-foreground mb-2">WhatsApp number *</Text>
                <TextInput
                  value={form.whatsappNumber}
                  onChangeText={(text) => setForm({ ...form, whatsappNumber: text })}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground"
                  placeholder="Enter your WhatsApp number"
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-card-foreground mb-2">Instagram handle *</Text>
                <TextInput
                  value={form.instagramHandle}
                  onChangeText={(text) => setForm({ ...form, instagramHandle: text })}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground"
                  placeholder="Enter your Instagram handle"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-card-foreground mb-2">Location *</Text>
                <TouchableOpacity
                  onPress={() => setShowLocationModal(true)}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 flex-row justify-between items-center"
                  disabled={loading}
                >
                  <Text className={`text-card-foreground ${form.location ? '' : 'text-muted-foreground'}`}>
                    {form.location || 'Select your city'}
                  </Text>
                  <Text className="text-muted-foreground">▼</Text>
                </TouchableOpacity>
                {form.location === 'Others' && (
                  <TextInput
                    value={form.customLocation}
                    onChangeText={(text) => setForm({ ...form, customLocation: text })}
                    className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground mt-2"
                    placeholder="Enter your city name"
                    editable={!loading}
                  />
                )}
              </View>
            </View>
          </View>

          {/* About you Section */}
          <View className="mb-8">
            <Text className="text-base font-semibold text-card-foreground mb-4">About you</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-bold text-card-foreground mb-2">Relationship status *</Text>
                <TouchableOpacity
                  onPress={() => setShowStatusModal(true)}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 flex-row justify-between items-center"
                  disabled={loading}
                >
                  <Text className={`text-card-foreground ${form.relationshipStatus ? '' : 'text-muted-foreground'}`}>
                    {form.relationshipStatus || 'Select relationship status'}
                  </Text>
                  <Text className="text-muted-foreground">▼</Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text className="text-sm font-bold text-card-foreground mb-2">Bio (minimum 25 words, don't use AI) *</Text>
                <View className="relative">
                  <TextInput
                    value={form.bio}
                    onChangeText={(text) => setForm({ ...form, bio: text })}
                    className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground min-h-32"
                    placeholder="Tell us about yourself"
                    multiline
                    textAlignVertical="top"
                    editable={!loading}
                  />
                  <View className="absolute bottom-2 right-3">
                    <Text className={`text-xs ${
                      getWordCount(form.bio) >= 25 ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {getWordCount(form.bio)} words
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-muted-foreground mt-1">Minimum 25 words required</Text>
              </View>

              <View>
                <Text className="text-sm font-bold text-card-foreground mb-2">What do you expect in your partner? (minimum 25 words) *</Text>
                <View className="relative">
                  <TextInput
                    value={form.partnerExpectations}
                    onChangeText={(text) => setForm({ ...form, partnerExpectations: text })}
                    className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground min-h-32"
                    placeholder="Describe what you're looking for in a partner"
                    multiline
                    textAlignVertical="top"
                    editable={!loading}
                  />
                  <View className="absolute bottom-2 right-3">
                    <Text className={`text-xs ${
                      getWordCount(form.partnerExpectations) >= 25 ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {getWordCount(form.partnerExpectations)} words
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-muted-foreground mt-1">Minimum 25 words required</Text>
              </View>
            </View>
          </View>

          {/* Interests Section */}
          <View className="mb-8">
            <View className="mb-4">
              <Text className="text-base font-semibold text-card-foreground mb-2">Interests</Text>
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-sm text-muted-foreground">({selectedInterests.length}/6)</Text>
              </View>
              <View className="h-px bg-border mb-4"></View>
            </View>

            <TouchableOpacity
              onPress={() => setShowInterestsModal(true)}
              className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 flex-row justify-between items-center"
              disabled={loading}
            >
              <Text className="text-card-foreground">
                {selectedInterests.length > 0 
                  ? `${selectedInterests.length} interests selected` 
                  : 'Select 6 interests'
                }
              </Text>
              <Text className="text-muted-foreground">▼</Text>
            </TouchableOpacity>

            {selectedInterests.length > 0 && (
              <View className="mt-3">
                <Text className="text-sm text-muted-foreground mb-2">Selected interests:</Text>
                <View className="flex-row flex-wrap gap-2">
                  {selectedInterests.map((interest) => (
                    <View key={interest} className="bg-primary/10 px-3 py-1 rounded-full">
                      <Text className="text-primary text-sm">{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {selectedInterests.length === 6 && (
              <Text className="text-xs text-muted-foreground mt-3">
                You've selected 6. Tap to modify your selection.
              </Text>
            )}
          </View>

          {/* Terms and Conditions */}
          <View className="mb-8">
            <View className="h-px bg-border mb-4"></View>
            <Text className="text-base font-semibold text-card-foreground mb-4">Review & submit</Text>
            
            <View className="bg-muted border border-border rounded-lg p-4 mb-6">
              <View className="flex-row items-start gap-3">
                <TouchableOpacity
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                  className={`w-5 h-5 rounded border-2 mt-1 ${
                    acceptedTerms ? 'bg-primary border-primary' : 'border-border'
                  }`}
                  disabled={loading}
                >
                  {acceptedTerms && (
                    <Text className="text-primary-foreground text-xs text-center leading-4">✓</Text>
                  )}
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className="text-sm text-muted-foreground leading-relaxed">
                    I agree to the{' '}
                    <Text className="text-primary underline">Terms and Conditions</Text>
                    {' '}and understand that I must comply with the community guidelines and safety requirements.
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="text-center mb-4"
              disabled={loading}
            >
              <Text className="text-muted-foreground text-sm font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sticky submit button */}
      <View className="bg-background border-t border-border p-4">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || !acceptedTerms}
          className={`w-full py-4 px-6 rounded-lg shadow-lg ${
            loading || !acceptedTerms ? 'bg-gray-400' : 'bg-primary'
          }`}
        >
          <Text className="text-primary-foreground font-bold text-lg text-center">
            {loading ? 'Submitting...' : 'Submit for review'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      {showGenderModal && renderModal(
        'Select Gender',
        ['male', 'female', 'trans'],
        form.gender,
        (value) => {
          setForm({ ...form, gender: value as 'male' | 'female' | 'trans' });
          setShowGenderModal(false);
        },
        () => setShowGenderModal(false)
      )}

      {showLocationModal && renderModal(
        'Select Location',
        cities,
        form.location,
        (value) => {
          setForm({ ...form, location: value });
          setShowLocationModal(false);
        },
        () => setShowLocationModal(false)
      )}

      {showStatusModal && renderModal(
        'Select Relationship Status',
        ['single', 'in a relationship', 'recent breakup', 'its complicated', 'divorced'],
        form.relationshipStatus,
        (value) => {
          setForm({ ...form, relationshipStatus: value });
          setShowStatusModal(false);
        },
        () => setShowStatusModal(false)
      )}

      {showInterestsModal && (
        <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
          <View className="flex-1 bg-background">
            <View className="flex-row justify-between items-center p-4 border-b border-border">
              <Text className="text-lg font-semibold text-card-foreground">
                Select Interests ({selectedInterests.length}/6)
              </Text>
              <TouchableOpacity onPress={() => setShowInterestsModal(false)}>
                <Text className="text-primary text-lg font-medium">Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView className="flex-1 p-4">
              <View className="flex-row flex-wrap gap-3">
                {interests.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    onPress={() => handleInterestToggle(interest)}
                    disabled={selectedInterests.length >= 6 && !selectedInterests.includes(interest)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      selectedInterests.includes(interest)
                        ? 'bg-primary border-primary'
                        : selectedInterests.length >= 6
                        ? 'bg-gray-200 border-gray-300'
                        : 'bg-background border-border'
                    }`}
                  >
                    <Text className={`text-sm ${
                      selectedInterests.includes(interest)
                        ? 'text-primary-foreground'
                        : selectedInterests.length >= 6
                        ? 'text-gray-500'
                        : 'text-card-foreground'
                    }`}>
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}
