import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DatingScreen from '../screens/DatingScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import { DatingStackParamList } from './types';

const Stack = createNativeStackNavigator<DatingStackParamList>();

const DatingStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#EDE4CF',
          borderBottomColor: '#E6DFD4',
        },
        headerTitleStyle: {
          color: '#1F2937',
          fontSize: 18,
          fontWeight: '600',
        },
        headerTintColor: '#8A4B2A',
      }}
    >
      <Stack.Screen 
        name="DatingScreen" 
        component={DatingScreen}
        options={{ title: 'Discover' }}
      />
      <Stack.Screen 
        name="ProfileDetailScreen" 
        component={ProfileDetailScreen}
        options={{ title: 'Profile Details' }}
      />
    </Stack.Navigator>
  );
};

export default DatingStack;
