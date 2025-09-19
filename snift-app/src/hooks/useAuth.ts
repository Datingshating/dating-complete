import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginResponse } from '../api/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const [token, userId, userName, isAdmin] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('userName'),
        AsyncStorage.getItem('isAdmin'),
      ]);

      if (token && userId) {
        setAuthState({
          user: {
            id: userId,
            name: userName || '',
            is_admin: isAdmin === 'true',
          } as User,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = async (loginResponse: LoginResponse) => {
    try {
      console.log('💾 useAuth: Storing auth data in AsyncStorage...');
      await Promise.all([
        AsyncStorage.setItem('authToken', loginResponse.token),
        AsyncStorage.setItem('userId', loginResponse.userId),
        AsyncStorage.setItem('userName', loginResponse.name),
        AsyncStorage.setItem('isAdmin', loginResponse.is_admin.toString()),
      ]);

      console.log('💾 useAuth: Auth data stored, updating auth state...');
      setAuthState({
        user: {
          id: loginResponse.userId,
          name: loginResponse.name,
          is_admin: loginResponse.is_admin,
        } as User,
        token: loginResponse.token,
        isAuthenticated: true,
        isLoading: false,
      });
      console.log('✅ useAuth: Auth state updated to authenticated');
    } catch (error) {
      console.error('❌ useAuth: Error saving auth state:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear all auth-related storage
      await AsyncStorage.multiRemove([
        'authToken',
        'userId', 
        'userName',
        'isAdmin'
      ]);

      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  // Global signOut function that can be called from anywhere
  const globalSignOut = async () => {
    try {
      // Call logout API endpoint first
      const { authApi } = await import('../api/auth');
      await authApi.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }

    // Clear local storage
    await logout();
    
    console.log('Global sign out completed');
  };

  return {
    ...authState,
    login,
    logout,
    globalSignOut,
  };
};
