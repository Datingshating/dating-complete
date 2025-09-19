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
  FlatList,
  Dimensions,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../api/auth';
import { RegisterRequest } from '../api/types';
import { RootStackParamList } from '../navigation/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

  // Responsive sizing based on screen dimensions
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
  const isLargeScreen = screenWidth >= 414;

  const getResponsiveStyles = () => {
    if (isSmallScreen) {
      return StyleSheet.create({
        containerPadding: { paddingHorizontal: 16 },
        sectionPadding: { padding: 16 },
        titleSize: { fontSize: 20, fontFamily: 'Poppins', fontWeight: '600' },
        subtitleSize: { fontSize: 12 },
        sectionTitleSize: { fontSize: 14, fontFamily: 'Poppins', fontWeight: '600' },
        labelText: { fontSize: 12, fontWeight: '700' },
        inputHeight: { paddingVertical: 12 },
        inputText: { fontSize: 14 },
        buttonHeight: { paddingVertical: 12 },
        buttonText: { fontSize: 14, fontWeight: '700' },
        cancelText: { fontSize: 12, fontWeight: '500' },
        modalTitle: { fontSize: 18, fontFamily: 'Poppins', fontWeight: '600' },
        modalItemText: { fontSize: 14 },
        modalItemPadding: { padding: 12 },
        interestChipText: { fontSize: 12 },
        interestChipPadding: { paddingHorizontal: 12, paddingVertical: 8 },
        wordCountText: { fontSize: 12 },
        helperText: { fontSize: 12 },
        checkboxSize: { width: 16, height: 16 },
        checkboxText: { fontSize: 12 },
        stickyButtonHeight: { paddingVertical: 12 },
        stickyButtonText: { fontSize: 14, fontWeight: '700' }
      });
    } else if (isMediumScreen) {
      return StyleSheet.create({
        containerPadding: { paddingHorizontal: 20 },
        sectionPadding: { padding: 24 },
        titleSize: { fontSize: 24, fontFamily: 'Poppins', fontWeight: '600' },
        subtitleSize: { fontSize: 14 },
        sectionTitleSize: { fontSize: 16, fontFamily: 'Poppins', fontWeight: '600' },
        labelText: { fontSize: 14, fontWeight: '700' },
        inputHeight: { paddingVertical: 12 },
        inputText: { fontSize: 16 },
        buttonHeight: { paddingVertical: 16 },
        buttonText: { fontSize: 16, fontWeight: '700' },
        cancelText: { fontSize: 14, fontWeight: '500' },
        modalTitle: { fontSize: 20, fontFamily: 'Poppins', fontWeight: '600' },
        modalItemText: { fontSize: 16 },
        modalItemPadding: { padding: 16 },
        interestChipText: { fontSize: 14 },
        interestChipPadding: { paddingHorizontal: 16, paddingVertical: 8 },
        wordCountText: { fontSize: 12 },
        helperText: { fontSize: 12 },
        checkboxSize: { width: 20, height: 20 },
        checkboxText: { fontSize: 14 },
        stickyButtonHeight: { paddingVertical: 16 },
        stickyButtonText: { fontSize: 16, fontWeight: '700' }
      });
    } else {
      return StyleSheet.create({
        containerPadding: { paddingHorizontal: 24 },
        sectionPadding: { padding: 32 },
        titleSize: { fontSize: 30, fontFamily: 'Poppins', fontWeight: '600' },
        subtitleSize: { fontSize: 16 },
        sectionTitleSize: { fontSize: 18, fontFamily: 'Poppins', fontWeight: '600' },
        labelText: { fontSize: 14, fontWeight: '700' },
        inputHeight: { paddingVertical: 16 },
        inputText: { fontSize: 16 },
        buttonHeight: { paddingVertical: 16 },
        buttonText: { fontSize: 18, fontWeight: '700' },
        cancelText: { fontSize: 14, fontWeight: '500' },
        modalTitle: { fontSize: 20, fontFamily: 'Poppins', fontWeight: '600' },
        modalItemText: { fontSize: 16 },
        modalItemPadding: { padding: 16 },
        interestChipText: { fontSize: 14 },
        interestChipPadding: { paddingHorizontal: 16, paddingVertical: 8 },
        wordCountText: { fontSize: 12 },
        helperText: { fontSize: 12 },
        checkboxSize: { width: 20, height: 20 },
        checkboxText: { fontSize: 14 },
        stickyButtonHeight: { paddingVertical: 16 },
        stickyButtonText: { fontSize: 18, fontWeight: '700' }
      });
    }
  };

  const styles = getResponsiveStyles();

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
      <View style={{ flex: 1, backgroundColor: '#F7F3EC' }}>
        <View style={[styles.modalItemPadding, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E6DFD4' }]}>
          <Text style={[styles.modalTitle, { color: '#1F2937' }]}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.modalTitle, { color: '#8A4B2A', fontWeight: '500' }]}>Done</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelect(item)}
              style={[
                styles.modalItemPadding,
                { borderBottomWidth: 1, borderBottomColor: '#E6DFD4' },
                selectedValue === item ? { backgroundColor: 'rgba(138, 75, 42, 0.1)' } : {}
              ]}
            >
              <Text style={[
                styles.modalItemText,
                { color: '#1F2937' },
                selectedValue === item ? { fontWeight: '600' } : {}
              ]}>
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
      style={{ flex: 1, backgroundColor: '#F7F3EC' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.containerPadding}>
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={[styles.titleSize, { color: '#1F2937', marginBottom: 8 }]}>
              Tell us about you
            </Text>
            <Text style={[styles.subtitleSize, { color: '#5B6068' }]}>
              It takes ~2 minutes.
            </Text>
          </View>

          {/* Basics Section */}
          <View style={{ marginBottom: 32 }}>
            <Text style={[styles.sectionTitleSize, { color: '#8A4B2A', marginBottom: 16 }]}>Basics</Text>
            
            <View style={{ gap: 16 }}>
              <View>
                <Text style={[styles.labelText, { color: '#1F2937', marginBottom: 8 }]}>Name *</Text>
                <TextInput
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                  style={[
                    styles.inputHeight,
                    styles.inputText,
                    {
                      width: '100%',
                      backgroundColor: '#FFF',
                      borderWidth: 2,
                      borderColor: '#E6DFD4',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      color: '#1F2937',
                    }
                  ]}
                  placeholder="Enter your name"
                  placeholderTextColor="#7C7C7C"
                  editable={!loading}
                />
              </View>

              <View>
                <Text style={[styles.labelText, { color: '#1F2937', marginBottom: 8 }]}>Gender *</Text>
                <TouchableOpacity
                  onPress={() => setShowGenderModal(true)}
                  style={[
                    styles.inputHeight,
                    {
                      width: '100%',
                      backgroundColor: '#FFF',
                      borderWidth: 2,
                      borderColor: '#E6DFD4',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }
                  ]}
                  disabled={loading}
                >
                  <Text style={[styles.inputText, { color: form.gender ? '#1F2937' : '#7C7C7C' }]}>
                    {form.gender || 'Select gender'}
                  </Text>
                  <Text style={{ color: '#7C7C7C' }}>▼</Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text style={[styles.labelText, { color: '#1F2937', marginBottom: 8 }]}>Date of birth *</Text>
                <TextInput
                  value={form.dateOfBirth}
                  onChangeText={(text) => setForm({ ...form, dateOfBirth: text })}
                  style={[
                    styles.inputHeight,
                    styles.inputText,
                    {
                      width: '100%',
                      backgroundColor: '#FFF',
                      borderWidth: 2,
                      borderColor: '#E6DFD4',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      color: '#1F2937',
                    }
                  ]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#7C7C7C"
                  editable={!loading}
                />
              </View>

              <View>
                <Text style={[styles.labelText, { color: '#1F2937', marginBottom: 8 }]}>WhatsApp number *</Text>
                <TextInput
                  value={form.whatsappNumber}
                  onChangeText={(text) => setForm({ ...form, whatsappNumber: text })}
                  style={[
                    styles.inputHeight,
                    styles.inputText,
                    {
                      width: '100%',
                      backgroundColor: '#FFF',
                      borderWidth: 2,
                      borderColor: '#E6DFD4',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      color: '#1F2937',
                    }
                  ]}
                  placeholder="Enter your WhatsApp number"
                  placeholderTextColor="#7C7C7C"
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>

              <View>
                <Text style={[styles.labelText, { color: '#1F2937', marginBottom: 8 }]}>Instagram handle *</Text>
                <TextInput
                  value={form.instagramHandle}
                  onChangeText={(text) => setForm({ ...form, instagramHandle: text })}
                  style={[
                    styles.inputHeight,
                    styles.inputText,
                    {
                      width: '100%',
                      backgroundColor: '#FFF',
                      borderWidth: 2,
                      borderColor: '#E6DFD4',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      color: '#1F2937',
                    }
                  ]}
                  placeholder="Enter your Instagram handle"
                  placeholderTextColor="#7C7C7C"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View>
                <Text style={[styles.labelText, { color: '#1F2937', marginBottom: 8 }]}>Location *</Text>
                <TouchableOpacity
                  onPress={() => setShowLocationModal(true)}
                  style={[
                    styles.inputHeight,
                    {
                      width: '100%',
                      backgroundColor: '#FFF',
                      borderWidth: 2,
                      borderColor: '#E6DFD4',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }
                  ]}
                  disabled={loading}
                >
                  <Text style={[styles.inputText, { color: form.location ? '#1F2937' : '#7C7C7C' }]}>
                    {form.location || 'Select your city'}
                  </Text>
                  <Text style={{ color: '#7C7C7C' }}>▼</Text>
                </TouchableOpacity>
                {form.location === 'Others' && (
                  <TextInput
                    value={form.customLocation}
                    onChangeText={(text) => setForm({ ...form, customLocation: text })}
                    style={[
                      styles.inputHeight,
                      styles.inputText,
                      {
                        width: '100%',
                        backgroundColor: '#FFF',
                        borderWidth: 2,
                        borderColor: '#E6DFD4',
                        borderRadius: 8,
                        paddingHorizontal: 16,
                        color: '#1F2937',
                        marginTop: 8,
                      }
                    ]}
                    placeholder="Enter your city name"
                    placeholderTextColor="#7C7C7C"
                    editable={!loading}
                  />
                )}
              </View>
            </View>
          </View>

          {/* About you Section */}
          <View style={{ marginBottom: 32 }}>
            <Text style={[styles.sectionTitleSize, { color: '#8A4B2A', marginBottom: 16 }]}>About you</Text>
            
            <View style={{ gap: 16 }}>
              <View>
                <Text style={[styles.labelText, { color: '#1F2937', marginBottom: 8 }]}>Relationship status *</Text>
                <TouchableOpacity
                  onPress={() => setShowStatusModal(true)}
                  style={[
                    styles.inputHeight,
                    {
                      width: '100%',
                      backgroundColor: '#FFF',
                      borderWidth: 2,
                      borderColor: '#E6DFD4',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }
                  ]}
                  disabled={loading}
                >
                  <Text style={[styles.inputText, { color: form.relationshipStatus ? '#1F2937' : '#7C7C7C' }]}>
                    {form.relationshipStatus || 'Select relationship status'}
                  </Text>
                  <Text style={{ color: '#7C7C7C' }}>▼</Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text style={[styles.labelText, { color: '#1F2937', marginBottom: 8 }]}>Bio (minimum 25 words, don't use AI) *</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    value={form.bio}
                    onChangeText={(text) => setForm({ ...form, bio: text })}
                    style={[
                      styles.inputHeight,
                      styles.inputText,
                      {
                        width: '100%',
                        backgroundColor: '#FFF',
                        borderWidth: 2,
                        borderColor: '#E6DFD4',
                        borderRadius: 8,
                        paddingHorizontal: 16,
                        color: '#1F2937',
                        minHeight: 120,
                        textAlignVertical: 'top',
                        paddingBottom: 32,
                      }
                    ]}
                    placeholder="Tell us about yourself"
                    placeholderTextColor="#7C7C7C"
                    multiline
                    textAlignVertical="top"
                    editable={!loading}
                  />
                  <View style={{ position: 'absolute', bottom: 8, right: 12 }}>
                    <Text style={[
                      styles.wordCountText,
                      { color: getWordCount(form.bio) >= 25 ? '#8A4B2A' : '#7C7C7C' }
                    ]}>
                      {getWordCount(form.bio)} words
                    </Text>
                  </View>
                </View>
                <Text style={[styles.helperText, { color: '#7C7C7C', marginTop: 4 }]}>Minimum 25 words required</Text>
              </View>

              <View>
                <Text style={[styles.labelText, { color: '#1F2937', marginBottom: 8 }]}>What do you expect in your partner? (minimum 25 words) *</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    value={form.partnerExpectations}
                    onChangeText={(text) => setForm({ ...form, partnerExpectations: text })}
                    style={[
                      styles.inputHeight,
                      styles.inputText,
                      {
                        width: '100%',
                        backgroundColor: '#FFF',
                        borderWidth: 2,
                        borderColor: '#E6DFD4',
                        borderRadius: 8,
                        paddingHorizontal: 16,
                        color: '#1F2937',
                        minHeight: 120,
                        textAlignVertical: 'top',
                        paddingBottom: 32,
                      }
                    ]}
                    placeholder="Describe what you're looking for in a partner"
                    placeholderTextColor="#7C7C7C"
                    multiline
                    textAlignVertical="top"
                    editable={!loading}
                  />
                  <View style={{ position: 'absolute', bottom: 8, right: 12 }}>
                    <Text style={[
                      styles.wordCountText,
                      { color: getWordCount(form.partnerExpectations) >= 25 ? '#8A4B2A' : '#7C7C7C' }
                    ]}>
                      {getWordCount(form.partnerExpectations)} words
                    </Text>
                  </View>
                </View>
                <Text style={[styles.helperText, { color: '#7C7C7C', marginTop: 4 }]}>Minimum 25 words required</Text>
              </View>
            </View>
          </View>

          {/* Interests Section */}
          <View style={{ marginBottom: 32 }}>
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.sectionTitleSize, { color: '#8A4B2A', marginBottom: 8 }]}>Interests</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Text style={[styles.helperText, { color: '#7C7C7C' }]}>({selectedInterests.length}/6)</Text>
              </View>
              <View style={{ height: 1, backgroundColor: '#E6DFD4', marginBottom: 16 }}></View>
            </View>

            <TouchableOpacity
              onPress={() => setShowInterestsModal(true)}
              style={[
                styles.inputHeight,
                {
                  width: '100%',
                  backgroundColor: '#FFF',
                  borderWidth: 2,
                  borderColor: '#E6DFD4',
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }
              ]}
              disabled={loading}
            >
              <Text style={[styles.inputText, { color: '#1F2937' }]}>
                {selectedInterests.length > 0 
                  ? `${selectedInterests.length} interests selected` 
                  : 'Select 6 interests'
                }
              </Text>
              <Text style={{ color: '#7C7C7C' }}>▼</Text>
            </TouchableOpacity>

            {selectedInterests.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.helperText, { color: '#7C7C7C', marginBottom: 8 }]}>Selected interests:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {selectedInterests.map((interest) => (
                    <View key={interest} style={[styles.interestChipPadding, { backgroundColor: 'rgba(138, 75, 42, 0.1)', borderRadius: 999 }]}>
                      <Text style={[styles.interestChipText, { color: '#8A4B2A' }]}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {selectedInterests.length === 6 && (
              <Text style={[styles.helperText, { color: '#7C7C7C', marginTop: 12 }]}>
                You've selected 6. Tap to modify your selection.
              </Text>
            )}
          </View>

          {/* Terms and Conditions */}
          <View style={{ marginBottom: 32 }}>
            <View style={{ height: 1, backgroundColor: '#E6DFD4', marginBottom: 16 }}></View>
            <Text style={[styles.sectionTitleSize, { color: '#8A4B2A', marginBottom: 16 }]}>Review & submit</Text>
            
            <View style={{ backgroundColor: '#EDE4CF', borderWidth: 1, borderColor: '#E6DFD4', borderRadius: 8, padding: 16, marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                  style={[
                    styles.checkboxSize,
                    {
                      borderRadius: 2,
                      borderWidth: 2,
                      marginTop: 4,
                      backgroundColor: acceptedTerms ? '#8A4B2A' : 'transparent',
                      borderColor: acceptedTerms ? '#8A4B2A' : '#E6DFD4',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }
                  ]}
                  disabled={loading}
                >
                  {acceptedTerms && (
                    <Text style={[styles.helperText, { color: '#FAF7F3', textAlign: 'center', lineHeight: 16 }]}>✓</Text>
                  )}
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.checkboxText, { color: '#5B6068', lineHeight: 20 }]}>
                    I agree to the{' '}
                    <Text style={{ color: '#8A4B2A', textDecorationLine: 'underline' }}>Terms and Conditions</Text>
                    {' '}and understand that I must comply with the community guidelines and safety requirements.
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ alignItems: 'center', marginBottom: 16 }}
              disabled={loading}
            >
              <Text style={[styles.cancelText, { color: '#5B6068' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sticky submit button */}
      <View style={{ backgroundColor: '#F7F3EC', borderTopWidth: 1, borderTopColor: '#E6DFD4', padding: 16 }}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || !acceptedTerms}
          style={[
            styles.stickyButtonHeight,
            {
              width: '100%',
              paddingHorizontal: 24,
              borderRadius: 8,
              backgroundColor: loading || !acceptedTerms ? '#9CA3AF' : '#8A4B2A',
              shadowColor: loading || !acceptedTerms ? 'transparent' : '#8A4B2A',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: loading || !acceptedTerms ? 0 : 0.3,
              shadowRadius: 8,
              elevation: loading || !acceptedTerms ? 0 : 8,
            }
          ]}
        >
          <Text style={[styles.stickyButtonText, { color: '#FAF7F3', textAlign: 'center' }]}>
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
          <View style={{ flex: 1, backgroundColor: '#F7F3EC' }}>
            <View style={[styles.modalItemPadding, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E6DFD4' }]}>
              <Text style={[styles.modalTitle, { color: '#1F2937' }]}>
                Select Interests ({selectedInterests.length}/6)
              </Text>
              <TouchableOpacity onPress={() => setShowInterestsModal(false)}>
                <Text style={[styles.modalTitle, { color: '#8A4B2A', fontWeight: '500' }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={[styles.modalItemPadding, { flex: 1 }]}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {interests.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    onPress={() => handleInterestToggle(interest)}
                    disabled={selectedInterests.length >= 6 && !selectedInterests.includes(interest)}
                    style={[
                      styles.interestChipPadding,
                      {
                        borderRadius: 999,
                        borderWidth: 2,
                        backgroundColor: selectedInterests.includes(interest)
                          ? '#8A4B2A'
                          : selectedInterests.length >= 6 && !selectedInterests.includes(interest)
                          ? '#E5E7EB'
                          : '#FFF',
                        borderColor: selectedInterests.includes(interest)
                          ? '#8A4B2A'
                          : selectedInterests.length >= 6 && !selectedInterests.includes(interest)
                          ? '#D1D5DB'
                          : '#E6DFD4',
                      }
                    ]}
                  >
                    <Text style={[
                      styles.interestChipText,
                      {
                        color: selectedInterests.includes(interest)
                          ? '#FAF7F3'
                          : selectedInterests.length >= 6 && !selectedInterests.includes(interest)
                          ? '#9CA3AF'
                          : '#1F2937'
                      }
                    ]}>
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