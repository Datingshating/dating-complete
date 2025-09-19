import React from 'react';
import { View, Text } from 'react-native';

interface TabBarIconProps {
  route: string;
  focused: boolean;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ route, focused, color, size }) => {
  const getIcon = () => {
    switch (route) {
      case 'Dating':
        return '💕';
      case 'Matches':
        return '💖';
      case 'Requests':
        return '📩';
      case 'Chat':
        return '💬';
      case 'Profile':
        return '👤';
      default:
        return '❓';
    }
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size, color }}>
        {getIcon()}
      </Text>
      <Text style={{ 
        fontSize: 12, 
        color, 
        fontWeight: focused ? '600' : '500',
        marginTop: 2,
      }}>
        {route}
      </Text>
    </View>
  );
};

export default TabBarIcon;
