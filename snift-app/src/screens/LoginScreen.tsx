import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Dimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../navigation/types';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  onAuthSuccess?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LoginScreen({ onAuthSuccess }: LoginScreenProps) {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Responsive sizing based on screen dimensions
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
  const isLargeScreen = screenWidth >= 414;

  const getResponsiveStyles = () => {
    if (isSmallScreen) {
      return StyleSheet.create({
        containerPadding: { paddingHorizontal: 16 },
        cardPadding: { padding: 24 },
        titleSize: { fontSize: 24, fontFamily: 'Poppins', fontWeight: '900' },
        subtitleSize: { fontSize: 14 },
        inputHeight: { paddingVertical: 12 },
        inputText: { fontSize: 14 },
        buttonHeight: { paddingVertical: 12 },
        buttonText: { fontSize: 16, fontWeight: '700' },
        labelText: { fontSize: 12, fontWeight: '700' },
        backText: { fontSize: 12, fontWeight: '500' },
        maxWidth: { maxWidth: 320 }
      });
    } else if (isMediumScreen) {
      return StyleSheet.create({
        containerPadding: { paddingHorizontal: 20 },
        cardPadding: { padding: 32 },
        titleSize: { fontSize: 30, fontFamily: 'Poppins', fontWeight: '900' },
        subtitleSize: { fontSize: 16 },
        inputHeight: { paddingVertical: 12 },
        inputText: { fontSize: 16 },
        buttonHeight: { paddingVertical: 16 },
        buttonText: { fontSize: 18, fontWeight: '700' },
        labelText: { fontSize: 14, fontWeight: '700' },
        backText: { fontSize: 14, fontWeight: '500' },
        maxWidth: { maxWidth: 400 }
      });
    } else {
      return StyleSheet.create({
        containerPadding: { paddingHorizontal: 24 },
        cardPadding: { padding: 40 },
        titleSize: { fontSize: 36, fontFamily: 'Poppins', fontWeight: '900' },
        subtitleSize: { fontSize: 18 },
        inputHeight: { paddingVertical: 16 },
        inputText: { fontSize: 16 },
        buttonHeight: { paddingVertical: 16 },
        buttonText: { fontSize: 18, fontWeight: '700' },
        labelText: { fontSize: 14, fontWeight: '700' },
        backText: { fontSize: 14, fontWeight: '500' },
        maxWidth: { maxWidth: 480 }
      });
    }
  };

  const styles = getResponsiveStyles();

  const handleLogin = async () => {
    if (!loginId || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    console.log('🔐 Starting login process...');
    setLoading(true);
    try {
      console.log('📡 Calling authApi.login...');
      const response = await authApi.login(loginId, password);
      console.log('📡 Login response:', response);
      
      if (response.ok) {
        console.log('✅ Login successful, storing auth data...');
        // Store token and user data in AsyncStorage using useAuth hook
        await login(response);
        console.log('✅ Auth data stored, calling onAuthSuccess...');
        
        // Call onAuthSuccess to switch to authenticated app
        if (onAuthSuccess) {
          console.log('🔄 Calling onAuthSuccess callback...');
          onAuthSuccess();
        } else {
          console.log('🔄 No onAuthSuccess callback, using navigation.goBack()...');
          navigation.goBack();
        }
      } else {
        console.log('❌ Login failed:', response.error);
        Alert.alert('Error', response.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#F7F3EC' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.containerPadding, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
        <View 
          style={[
            styles.cardPadding,
            styles.maxWidth,
            { 
              backgroundColor: '#FAF7F3', 
              borderRadius: 24, 
              width: '100%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 12,
            }
          ]}
        >
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={[styles.titleSize, { color: '#1F2937', marginBottom: 12 }]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitleSize, { color: '#5B6068' }]}>
              Sign in to your account to continue
            </Text>
          </View>
          
          <View style={{ gap: 24 }}>
            <View>
              <Text style={[styles.labelText, { color: '#1F2937', marginBottom: 8 }]}>
                Login ID
              </Text>
              <TextInput
                value={loginId}
                onChangeText={setLoginId}
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
                placeholder="Enter your login ID"
                placeholderTextColor="#7C7C7C"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
            
            <View>
              <Text style={[styles.labelText, { color: '#1F2937', marginBottom: 8 }]}>
                Password
              </Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
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
                      paddingRight: 50,
                      color: '#1F2937',
                    }
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor="#7C7C7C"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: [{ translateY: -12 }],
                    padding: 4,
                  }}
                  disabled={loading}
                >
                  <Text style={{ fontSize: 18, color: '#8A4B2A' }}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[
                styles.buttonHeight,
                {
                  width: '100%',
                  paddingHorizontal: 24,
                  borderRadius: 8,
                  backgroundColor: loading ? '#9CA3AF' : '#8A4B2A',
                  shadowColor: loading ? 'transparent' : '#8A4B2A',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: loading ? 0 : 0.3,
                  shadowRadius: 8,
                  elevation: loading ? 0 : 8,
                }
              ]}
            >
              <Text style={[styles.buttonText, { color: '#FAF7F3', textAlign: 'center' }]}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ alignItems: 'center', marginTop: 24 }}
              disabled={loading}
            >
              <Text style={[styles.backText, { color: '#5B6068' }]}>
                ← Back to home
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
