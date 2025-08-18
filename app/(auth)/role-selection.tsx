/**
 * Role Selection Screen
 * Let users choose between worker and hirer roles
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/context/ThemeProvider';
import { AppBar } from '../../src/components/ui/AppBar';
import { SurfaceCard } from '../../src/components/ui/Card';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import { BackButton } from '../../src/components/ui/BackButton';

type UserRole = 'worker' | 'hirer' | null;

export default function RoleSelectionScreen() {
  const { colors, typography, spacing, radius, shadows } = useTheme();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const handleRoleSelect = (role: 'worker' | 'hirer') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to the new create-account screen with role parameter
    router.push(`/(auth)/create-account?role=${selectedRole}`);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerLeft: () => <BackButton tintColor="#FFFFFF" />,
        }}
      />
      <View style={[styles.container, { backgroundColor: '#0B0F1A' }]}>

      <SafeAreaView style={styles.safeArea}>
        {/* Main Content Container - Centered */}
        <View style={styles.mainContainer}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.mainTitle}>Welcome to EZ Clear</Text>
            <Text style={styles.mainSubtitle}>Select how you want to use the app</Text>
          </View>

          {/* Role Cards Section */}
          <View style={styles.roleCardsSection}>
            {/* Worker Card */}
            <Pressable
              style={[styles.selectCard, selectedRole === 'worker' && styles.selectCardActive]}
              onPress={() => handleRoleSelect('worker')}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedRole === 'worker' }}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="briefcase-outline" size={22} color="#0B0F1A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitleTxt}>I want to work</Text>
                <Text style={styles.cardSubTxt} numberOfLines={1}>Find jobs and opportunities</Text>
              </View>
              {selectedRole === 'worker' && <Ionicons name="checkmark-circle" size={22} color="#8B5CF6" />}
            </Pressable>

            {/* Hirer Card */}
            <Pressable
              style={[styles.selectCard, selectedRole === 'hirer' && styles.selectCardActive]}
              onPress={() => handleRoleSelect('hirer')}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedRole === 'hirer' }}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="search" size={22} color="#0B0F1A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitleTxt}>I want to hire</Text>
                <Text style={styles.cardSubTxt} numberOfLines={1}>Post jobs and find talent</Text>
              </View>
              {selectedRole === 'hirer' && <Ionicons name="checkmark-circle" size={22} color="#8B5CF6" />}
            </Pressable>
          </View>
        </View>

        {/* Bottom Section - Get Started Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            disabled={!selectedRole} 
            onPress={handleContinue} 
            activeOpacity={0.9} 
            style={[styles.getStartedButton, !selectedRole && styles.getStartedButtonDisabled]}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </SafeAreaView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  
  // Main Content Container - Perfect centering with slight downward shift
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    // Shift content 10-15% down from perfect center
    marginTop: '10%',
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainSubtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Role Cards Section
  roleCardsSection: {
    gap: 16,
  },
  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1F2230',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2A2F45',
  },
  selectCardActive: {
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleTxt: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubTxt: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 18,
  },
  
  // Bottom Section
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    alignItems: 'center',
  },
  getStartedButton: {
    width: '100%',
    maxWidth: 360,
    height: 56,
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  getStartedButtonDisabled: {
    backgroundColor: '#3B3B52',
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  termsText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 300,
  },
  termsLink: {
    color: '#8B5CF6',
    textDecorationLine: 'underline',
  },
});
