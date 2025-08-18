/**
 * Root Navigator for EZ Clear Native App
 * Handles main app navigation flow
 */

import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    checkOnboardingStatus();

    // Hide splash screen after delay
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // Reduced from 3000 to 2000

    return () => clearTimeout(timer);
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // In development, skip onboarding
      if (__DEV__) {
        setHasSeenOnboarding(true);
        return;
      }
      
      // In a real app, you'd check AsyncStorage or SecureStore
      // For now, we'll assume they haven't seen it
      setHasSeenOnboarding(false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasSeenOnboarding(false);
    }
  };

  // Show splash screen
  if (showSplash || loading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  // In development, skip auth and go directly to main app
  if (__DEV__ && isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    );
  }

  // Show onboarding if user hasn't seen it
  if (!hasSeenOnboarding && !isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreen
              {...props}
              onComplete={() => setHasSeenOnboarding(true)}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  // Show auth flow if not authenticated
  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    );
  }

  // Show main app if authenticated
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
}
