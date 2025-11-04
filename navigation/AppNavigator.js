import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import BoxBreathingScreen from '../screens/BoxBreathingScreen';
import SendaAIChatScreen from '../screens/SendaAIChatScreen';
import { colors } from '../styles/theme';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: colors.fondoBaseOscuro,
        },
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="BoxBreathing" component={BoxBreathingScreen} />
      <Stack.Screen name="SendaAIChat" component={SendaAIChatScreen} />
    </Stack.Navigator>
  );
}

export default AppNavigator;