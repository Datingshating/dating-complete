import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../navigation/types';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginId || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login(loginId, password);
      
      if (response.ok) {
        // Store token and user data in AsyncStorage using useAuth hook
        await login(response);
        
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 items-center justify-center px-5">
        <View className="bg-card rounded-3xl p-8 w-full max-w-md shadow-xl">
          <View className="text-center mb-10">
            <Text className="font-heading text-3xl font-black text-card-foreground mb-3">
              Welcome Back
            </Text>
            <Text className="text-muted-foreground">
              Sign in to your account to continue
            </Text>
          </View>
          
          <View className="space-y-6">
            <View>
              <Text className="text-sm font-bold text-card-foreground mb-2">
                Login ID
              </Text>
              <TextInput
                value={loginId}
                onChangeText={setLoginId}
                className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground"
                placeholder="Enter your login ID"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
            
            <View>
              <Text className="text-sm font-bold text-card-foreground mb-2">
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground"
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
            
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-lg shadow-lg ${
                loading ? 'bg-gray-400' : 'bg-primary'
              }`}
            >
              <Text className="text-primary-foreground font-bold text-lg text-center">
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="text-center mt-6"
              disabled={loading}
            >
              <Text className="text-muted-foreground text-sm font-medium">
                ← Back to home
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
