import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LiveFormScreen from '../screens/LiveFormScreen';
import WorkoutHistoryScreen from '../screens/WorkoutHistoryScreen';
import LogMealScreen from '../screens/LogMealScreen';
import ProUpsell from '../screens/ProUpsell';

const Stack = createNativeStackNavigator();

export default function RootNavigator(){
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LiveForm" component={LiveFormScreen} />
        <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
        <Stack.Screen name="LogMeal" component={LogMealScreen} />
        <Stack.Screen name="ProUpsell" component={ProUpsell} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}