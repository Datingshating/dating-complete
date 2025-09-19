import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import PacksScreen from '../screens/PacksScreen';
import AdminScreen from '../screens/AdminScreen';
import PerformanceTestScreen from '../screens/PerformanceTestScreen';
import { ProfileStackParamList } from './types';
import { useAuth } from '../hooks/useAuth';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#EDE4CF',
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: '#1F2937',
          fontSize: 18,
          fontWeight: '600',
        },
        headerTintColor: '#8A4B2A',
      }}
    >
      <Stack.Screen 
        name="ProfileScreen" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="EditProfileScreen" 
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen 
        name="ProfileDetailScreen" 
        component={ProfileDetailScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="PacksScreen" 
        component={PacksScreen}
        options={{ title: 'Packs' }}
      />
      {user?.is_admin && (
        <Stack.Screen 
          name="AdminScreen" 
          component={AdminScreen}
          options={{ title: 'Admin Panel' }}
        />
      )}
      {__DEV__ && (
        <Stack.Screen 
          name="PerformanceTestScreen" 
          component={PerformanceTestScreen}
          options={{ title: 'Performance Test' }}
        />
      )}
    </Stack.Navigator>
  );
};

export default ProfileStack;
