import React from 'react';
import { View, Text } from 'react-native';

export default function ChatScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-2xl font-bold text-foreground">Chat Screen</Text>
      <Text className="text-muted-foreground mt-2">Real-time chat coming soon...</Text>
    </View>
  );
}
