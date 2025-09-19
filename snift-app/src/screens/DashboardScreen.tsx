import React from 'react';
import { View, Text } from 'react-native';

export default function DashboardScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-2xl font-bold text-foreground">Dating Screen</Text>
      <Text className="text-muted-foreground mt-2">Discovery feed coming soon...</Text>
    </View>
  );
}
