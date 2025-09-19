import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Import stack navigators
import DatingStack from './DatingStack';
import MatchesStack from './MatchesStack';
import RequestsStack from './RequestsStack';
import ChatStack from './ChatStack';
import ProfileStack from './ProfileStack';

// Import components
import TabBarIcon from '../components/TabBarIcon';
import AuthGate from '../components/AuthGate';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator for authenticated users
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon route={route.name} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: '#8A4B2A',
        tabBarInactiveTintColor: '#5B6068',
        tabBarStyle: {
          backgroundColor: '#EDE4CF',
          borderTopColor: '#E6DFD4',
          height: 72,
          paddingBottom: 16,
          paddingTop: 16,
        },
        headerShown: false, // Hide header since each stack has its own header
      })}
      initialRouteName="Dating" // Start with Dating tab as requested
    >
      <Tab.Screen 
        name="Dating" 
        component={DatingStack}
        options={{ title: 'Discover' }}
      />
      <Tab.Screen 
        name="Matches" 
        component={MatchesStack}
        options={{ title: 'Matches' }}
      />
      <Tab.Screen 
        name="Requests" 
        component={RequestsStack}
        options={{ title: 'Requests' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatStack}
        options={{ title: 'Chat' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Authenticated App Navigator
function AuthenticatedApp() {
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
        name="Main" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Unauthenticated App Navigator
function UnauthenticatedApp({ onAuthSuccess }: { onAuthSuccess: () => void }) {
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
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Snift' }}
      />
      <Stack.Screen 
        name="Login" 
        options={{ title: 'Login' }}
      >
        {(props) => <LoginScreen {...props} onAuthSuccess={onAuthSuccess} />}
      </Stack.Screen>
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ title: 'Join Snift' }}
      />
    </Stack.Navigator>
  );
}

// Root App Navigator with AuthGate
export default function AppNavigator() {
  const [showAuth, setShowAuth] = useState(false);

  const handleAuthRequired = () => {
    console.log('🚨 AuthGate: Authentication required, showing auth screens');
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    console.log('🎉 AppNavigator: Auth success received, switching to authenticated app');
    // Add a small delay to ensure auth state is fully updated
    setTimeout(() => {
      setShowAuth(false);
    }, 50);
  };

  console.log('🧭 AppNavigator render - showAuth:', showAuth);

  return (
    <NavigationContainer>
      {showAuth ? (
        <UnauthenticatedApp onAuthSuccess={handleAuthSuccess} />
      ) : (
        <AuthGate onAuthRequired={handleAuthRequired}>
          <AuthenticatedApp />
        </AuthGate>
      )}
    </NavigationContainer>
  );
}
