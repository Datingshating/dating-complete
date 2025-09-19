import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatListScreen from '../screens/ChatListScreen';
import ChatThreadScreen from '../screens/ChatThreadScreen';
import { ChatStackParamList } from './types';

const Stack = createNativeStackNavigator<ChatStackParamList>();

const ChatStack: React.FC = () => {
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
        name="ChatListScreen" 
        component={ChatListScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen 
        name="ChatThreadScreen" 
        component={ChatThreadScreen}
        options={({ route }) => ({ 
          title: route.params.userName,
          headerBackTitle: 'Back'
        })}
      />
    </Stack.Navigator>
  );
};

export default ChatStack;
