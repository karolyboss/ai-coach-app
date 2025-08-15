import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// —— Screens you already have (adjust paths if your folders differ)
import HomeScreen from './src/screens/HomeScreen';
import LiveFormScreen from './src/screens/LiveFormScreen';
import LogMealScreen from './src/screens/LogMealScreen';
// If you’ve created these, uncomment the imports + screens below
// import WorkoutHistoryScreen from './src/screens/WorkoutHistoryScreen';
// import ProUpsell from './src/screens/ProUpsell';
// import Session3D from './src/screens/Session3D';

export type RootStackParamList = {
  Home: undefined;
  LiveForm: undefined;
  Meals: undefined;
  // WorkoutHistory?: undefined;
  // ProUpsell?: undefined;
  // Session3D?: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={DefaultTheme}>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: true,
              headerStyle: { backgroundColor: '#0e0e0e' },
              headerTitleStyle: { color: '#fff' },
              headerTintColor: '#fff',
              contentStyle: { backgroundColor: '#000' },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'AI Coach' }} />
            <Stack.Screen name="LiveForm" component={LiveFormScreen} options={{ title: 'Live Form' }} />
            <Stack.Screen name="Meals" component={LogMealScreen} options={{ title: 'Log a Meal' }} />
            {/**
            <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} options={{ title: 'History' }} />
            <Stack.Screen name="ProUpsell" component={ProUpsell} options={{ title: 'Go Pro' }} />
            <Stack.Screen name="Session3D" component={Session3D} options={{ title: '3D Session' }} />
            */}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
Quick notes:
• Put this file at the project root as `App.tsx` (Expo auto-detects it).
• Ensure you have these deps installed (you already added most):
    @react-navigation/native, @react-navigation/native-stack,
    react-native-gesture-handler, react-native-screens,
    react-native-safe-area-context
  If not, run:  npm i @react-navigation/native @react-navigation/native-stack
               npm i react-native-gesture-handler react-native-screens react-native-safe-area-context
• If a screen isn’t ready yet, keep its import + <Stack.Screen> commented to avoid build errors.
*/
