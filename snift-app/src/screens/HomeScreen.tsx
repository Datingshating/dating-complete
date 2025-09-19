import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // Responsive sizing based on screen dimensions
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
  const isLargeScreen = screenWidth >= 414;

  const getResponsiveStyles = () => {
    if (isSmallScreen) {
      return StyleSheet.create({
        heroTitle: { fontSize: 48, fontFamily: 'Poppins', fontWeight: '900' },
        heroSubtitle: { fontSize: 24, fontFamily: 'Poppins', fontWeight: '700' },
        heroDescription: { fontSize: 18 },
        buttonText: { fontSize: 16, fontWeight: '700' },
        buttonPadding: { paddingHorizontal: 24, paddingVertical: 12 },
        featureTitle: { fontSize: 30, fontFamily: 'Poppins', fontWeight: '900' },
        featureSubtitle: { fontSize: 16 },
        featureIcon: { fontSize: 24 },
        featureItemTitle: { fontSize: 18, fontFamily: 'Poppins', fontWeight: '700' },
        featureItemDescription: { fontSize: 14 },
        containerPadding: { paddingHorizontal: 16 },
        sectionPadding: { padding: 24 },
        spacing: { gap: 16 },
        marginTop: { marginTop: 64 }
      });
    } else if (isMediumScreen) {
      return StyleSheet.create({
        heroTitle: { fontSize: 60, fontFamily: 'Poppins', fontWeight: '900' },
        heroSubtitle: { fontSize: 30, fontFamily: 'Poppins', fontWeight: '700' },
        heroDescription: { fontSize: 20 },
        buttonText: { fontSize: 18, fontWeight: '700' },
        buttonPadding: { paddingHorizontal: 32, paddingVertical: 16 },
        featureTitle: { fontSize: 36, fontFamily: 'Poppins', fontWeight: '900' },
        featureSubtitle: { fontSize: 18 },
        featureIcon: { fontSize: 30 },
        featureItemTitle: { fontSize: 20, fontFamily: 'Poppins', fontWeight: '700' },
        featureItemDescription: { fontSize: 16 },
        containerPadding: { paddingHorizontal: 20 },
        sectionPadding: { padding: 32 },
        spacing: { gap: 20 },
        marginTop: { marginTop: 80 }
      });
    } else {
      return StyleSheet.create({
        heroTitle: { fontSize: 72, fontFamily: 'Poppins', fontWeight: '900' },
        heroSubtitle: { fontSize: 36, fontFamily: 'Poppins', fontWeight: '700' },
        heroDescription: { fontSize: 20 },
        buttonText: { fontSize: 18, fontWeight: '700' },
        buttonPadding: { paddingHorizontal: 32, paddingVertical: 16 },
        featureTitle: { fontSize: 48, fontFamily: 'Poppins', fontWeight: '900' },
        featureSubtitle: { fontSize: 18 },
        featureIcon: { fontSize: 36 },
        featureItemTitle: { fontSize: 20, fontFamily: 'Poppins', fontWeight: '700' },
        featureItemDescription: { fontSize: 16 },
        containerPadding: { paddingHorizontal: 24 },
        sectionPadding: { padding: 40 },
        spacing: { gap: 24 },
        marginTop: { marginTop: 96 }
      });
    }
  };

  const styles = getResponsiveStyles();

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#F7F3EC' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={[styles.containerPadding, { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }]}>
        {/* Hero Section */}
        <View style={[styles.spacing, { flexDirection: 'row', alignItems: 'center', marginBottom: 32 }]}>
          <Text style={{ fontSize: 60 }}>💕</Text>
          <Text style={[styles.heroTitle, { color: '#8A4B2A' }]}>
            Snift
          </Text>
        </View>
        
        <Text style={[styles.heroSubtitle, { color: '#1F2937', marginBottom: 24, textAlign: 'center', maxWidth: 400 }]}>
          Character Finds Connection
        </Text>
        
        <Text style={[styles.heroDescription, { color: '#5B6068', maxWidth: 300, textAlign: 'center', marginBottom: 40, lineHeight: 24 }]}>
          Experience authentic connections in a photo-free environment. Share your story, discover others, and connect when hearts align. ✨
        </Text>
        
        {/* CTA Buttons */}
        <View style={[styles.spacing, { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={[
              styles.buttonPadding,
              { 
                backgroundColor: '#8A4B2A', 
                borderRadius: 8,
                shadowColor: '#8A4B2A',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }
            ]}
          >
            <Text style={[styles.buttonText, { color: '#FAF7F3' }]}>
              💖 Start Your Journey
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={[
              styles.buttonPadding,
              { 
                borderWidth: 2, 
                borderColor: '#8A4B2A', 
                borderRadius: 8, 
                backgroundColor: 'transparent' 
              }
            ]}
          >
            <Text style={[styles.buttonText, { color: '#8A4B2A' }]}>
              🔑 Login
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Features Section */}
        <View style={[
          styles.marginTop, 
          styles.sectionPadding,
          { 
            backgroundColor: '#FAF7F3', 
            borderRadius: 24, 
            width: '100%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }
        ]}>
          <Text style={[styles.featureTitle, { color: '#1F2937', marginBottom: 16, textAlign: 'center' }]}>
            Why Choose Snift?
          </Text>
          <Text style={[styles.featureSubtitle, { color: '#5B6068', textAlign: 'center', marginBottom: 32 }]}>
            Experience dating the way it should be - authentic, meaningful, and focused on what really matters.
          </Text>
          
          <View style={{ gap: 24 }}>
            {[
              {
                icon: '💭',
                title: 'Words Over Photos',
                description: 'Connect through meaningful conversations, not superficial appearances'
              },
              {
                icon: '🛡️',
                title: 'Safe & Verified',
                description: 'Manual profile verification ensures authentic, genuine connections'
              },
              {
                icon: '💌',
                title: 'Thoughtful Requests',
                description: 'Send personalized connection requests that show your genuine interest'
              },
              {
                icon: '💕',
                title: 'Mutual Matching',
                description: 'Chat only opens when both hearts are interested - no unwanted messages'
              }
            ].map((feature, index) => (
              <View 
                key={index} 
                style={{
                  backgroundColor: '#F7F3EC',
                  padding: 24,
                  borderRadius: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.featureItemTitle, { color: '#1F2937', marginBottom: 8 }]}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.featureItemDescription, { color: '#5B6068', lineHeight: 20 }]}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
