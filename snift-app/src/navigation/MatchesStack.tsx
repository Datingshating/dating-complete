import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnhancedMatchesScreen from '../screens/EnhancedMatchesScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import { MatchesStackParamList } from './types';

const Stack = createNativeStackNavigator<MatchesStackParamList>();

const MatchesStack: React.FC = () => {
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
        name="MatchesScreen" 
        component={EnhancedMatchesScreen}
        options={{ title: 'Matches' }}
      />
      <Stack.Screen 
        name="MatchDetailScreen" 
        component={MatchDetailScreen}
        options={{ title: 'Match Details' }}
      />
      <Stack.Screen 
        name="ProfileDetailScreen" 
        component={ProfileDetailScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

export default MatchesStack;
