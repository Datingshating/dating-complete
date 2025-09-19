import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnhancedRequestsScreen from '../screens/EnhancedRequestsScreen';
import RequestDetailScreen from '../screens/RequestDetailScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import { RequestsStackParamList } from './types';

const Stack = createNativeStackNavigator<RequestsStackParamList>();

const RequestsStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#F7F3EC',
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: '#1F2937',
          fontSize: 18,
          fontWeight: '600',
        },
        headerTintColor: '#0F766E',
      }}
    >
      <Stack.Screen 
        name="RequestsScreen" 
        component={EnhancedRequestsScreen}
        options={{ title: 'Requests' }}
      />
      <Stack.Screen 
        name="RequestDetailScreen" 
        component={RequestDetailScreen}
        options={{ title: 'Request Details' }}
      />
      <Stack.Screen 
        name="ProfileDetailScreen" 
        component={ProfileDetailScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

export default RequestsStack;
