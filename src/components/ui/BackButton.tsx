/**
 * BackButton Component
 * Consistent back navigation for auth screens
 */

import React from 'react';
import { Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeProvider';
import * as Haptics from 'expo-haptics';

interface BackButtonProps {
  tintColor?: string;
  onPress?: () => void;
}

export function BackButton({ tintColor, onPress }: BackButtonProps) {
  const router = useRouter();
  const { colors } = useTheme();
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (onPress) {
      onPress();
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(auth)/welcome');
      }
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        padding: 4,
      })}
    >
      <Feather 
        name="chevron-left" 
        size={28} 
        color={tintColor || colors.onSurface || '#FFFFFF'} 
      />
    </Pressable>
  );
}
