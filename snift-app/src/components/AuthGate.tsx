import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/auth';
import { useQueryClient } from '@tanstack/react-query';

interface AuthGateProps {
  children: React.ReactNode;
  onAuthRequired: () => void;
}

export default function AuthGate({ children, onAuthRequired }: AuthGateProps) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const validateSession = async () => {
      console.log('🔍 AuthGate: Starting session validation - isAuthenticated:', isAuthenticated, 'user:', user);
      if (!isAuthenticated || !user) {
        console.log('🔍 AuthGate: No auth data, skipping validation');
        setHasValidated(true);
        return;
      }

      // TEMPORARY: Skip session validation to test login flow
      console.log('🔍 AuthGate: Skipping session validation for testing');
      setHasValidated(true);
      return;

      console.log('🔍 AuthGate: Validating session with API call...');
      setIsValidating(true);
      try {
        // Call the same "me" endpoint as web to validate session
        const currentUser = await authApi.getMe();
        
        // If the API call succeeds, the session is valid
        console.log('✅ AuthGate: Session validated successfully:', currentUser);
        setHasValidated(true);
      } catch (error) {
        console.error('❌ AuthGate: Session validation failed:', error);
        
        // Session is invalid, clear storage and redirect to login
        console.log('🚨 AuthGate: Logging out user due to session validation failure');
        await logout();
        queryClient.clear(); // Clear all react-query caches
        onAuthRequired();
      } finally {
        setIsValidating(false);
      }
    };

    if (!hasValidated) {
      validateSession();
    }
  }, [isAuthenticated, user, logout, queryClient, onAuthRequired, hasValidated]);

  // Add this useEffect to handle the case when not authenticated
  useEffect(() => {
    console.log('🔍 AuthGate: Auth state changed - hasValidated:', hasValidated, 'isAuthenticated:', isAuthenticated);
    if (hasValidated && !isAuthenticated) {
      // Add a small delay to allow auth state to update after login
      console.log('🔍 AuthGate: User not authenticated, waiting 100ms before checking again...');
      const timer = setTimeout(() => {
        console.log('🔍 AuthGate: After delay - isAuthenticated:', isAuthenticated);
        if (!isAuthenticated) {
          console.log('🚨 AuthGate: User still not authenticated after delay, calling onAuthRequired');
          onAuthRequired();
        } else {
          console.log('✅ AuthGate: User is now authenticated after delay');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [hasValidated, isAuthenticated, onAuthRequired]);

  // Show loading spinner while checking auth state or validating session
  if (isLoading || isValidating || !hasValidated) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#8A4B2A" />
        <Text className="text-muted-foreground mt-4">Loading...</Text>
      </View>
    );
  }

  // If not authenticated, show loading (onAuthRequired will be called in useEffect)
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#8A4B2A" />
        <Text className="text-muted-foreground mt-4">Redirecting...</Text>
      </View>
    );
  }

  // If authenticated and session is valid, render children
  return <>{children}</>;
}

// Global signOut function that can be called from anywhere
export const globalSignOut = async (logout: () => Promise<void>, queryClient: any) => {
  try {
    // Call logout API endpoint
    await authApi.logout();
  } catch (error) {
    console.warn('Logout API call failed:', error);
  }

  // Clear local storage and react-query caches
  await logout();
  queryClient.clear();
  
  console.log('Global sign out completed');
};
