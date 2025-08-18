/**
 * Sign Up Screen
 * User registration with email, password, and role
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/context/ThemeProvider';
import { useAuth } from '../../src/context/AuthContext';
import { AppBar } from '../../src/components/ui/AppBar';
import { LinearGradient } from 'expo-linear-gradient';
import { BackButton } from '../../src/components/ui/BackButton';
import { useFocusEffect } from '@react-navigation/native';

export default function SignUpScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const { signUp, loading } = useAuth();
  const router = useRouter();
  const { userType } = useLocalSearchParams<{ userType: 'worker' | 'hirer' }>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clear form on every focus/visit
  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }, [])
  );

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (!userType) {
      Alert.alert('Error', 'Please select an account type');
      return;
    }

    try {
      await signUp(email, password, userType);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Account Created',
        'Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/home'),
          },
        ]
      );
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Sign Up Failed', error.message || 'Please try again.');
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  const isValid = email.includes('@') && password.length >= 8 && confirmPassword.length >= 8 && password === confirmPassword;

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
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: '#0B0F1A' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.safeArea}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.textPrimary,
                fontFamily: typography.fontFamily.semibold,
                fontSize: typography.fontSize.xl,
              },
            ]}
          >
            Create Account
          </Text>

          {/* Content */}
          <View style={styles.content}>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Social auth */}
          <View style={{ gap: 12, marginBottom: 20 }}>
            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.85}
              onPress={async () => {
                try {
                  await (await import('../../src/lib/auth/google')).signInWithGoogle();
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  router.replace('/(tabs)/home');
                } catch (e: any) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  Alert.alert('Google Sign Up Failed', e?.message || 'Please try again.');
                }
              }}
            >
              <Ionicons name="logo-google" size={18} color="#FFFFFF" style={{ marginRight: 10 }} />
              <Text style={styles.socialText}>Continue with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85} onPress={() => Alert.alert('Apple Sign Up', 'Not configured yet')}>
              <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
              <Text style={styles.socialText}>Continue with Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.85}
              onPress={async () => {
                try {
                  await (await import('../../src/lib/auth/facebook')).signInWithFacebook();
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  router.replace('/(tabs)/home');
                } catch (e: any) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  Alert.alert('Facebook Sign Up Failed', e?.message || 'Please try again.');
                }
              }}
            >
              <Ionicons name="logo-facebook" size={18} color="#FFFFFF" style={{ marginRight: 10 }} />
              <Text style={styles.socialText}>Continue with Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR SIGN UP WITH EMAIL</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.form}>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  {
                    color: colors.textPrimary,
                    fontFamily: typography.fontFamily.medium,
                    fontSize: typography.fontSize.sm,
                  },
                ]}
              >
                Email
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: '#1F2937', borderRadius: 14, borderWidth: 1, borderColor: '#334155' }]}>                
                <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: '#FFFFFF',
                      fontFamily: typography.fontFamily.medium,
                      fontSize: typography.fontSize.base,
                    },
                  ]}
                  placeholder="your@email.com"
                  placeholderTextColor="#FFFFFF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  {
                    color: colors.textPrimary,
                    fontFamily: typography.fontFamily.medium,
                    fontSize: typography.fontSize.sm,
                  },
                ]}
              >
                Password
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: '#1F2937', borderRadius: 14, borderWidth: 1, borderColor: '#334155' }]}>                
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: '#FFFFFF',
                      fontFamily: typography.fontFamily.medium,
                      fontSize: typography.fontSize.base,
                    },
                  ]}
                  placeholder="Create a password"
                  placeholderTextColor="#FFFFFF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  {
                    color: colors.textPrimary,
                    fontFamily: typography.fontFamily.medium,
                    fontSize: typography.fontSize.sm,
                  },
                ]}
              >
                Confirm Password
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: '#1F2937', borderRadius: 14, borderWidth: 1, borderColor: '#334155' }]}>                
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: '#FFFFFF',
                      fontFamily: typography.fontFamily.medium,
                      fontSize: typography.fontSize.base,
                    },
                  ]}
                  placeholder="Confirm password"
                  placeholderTextColor="#FFFFFF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={!isValid || loading}
              onPress={handleSignUp}
              style={{ borderRadius: 16, overflow: 'hidden', height: 56, marginTop: 12, opacity: !isValid || loading ? 0.7 : 1 }}
              accessibilityLabel="Create Account"
            >
              <LinearGradient colors={["#00E6CF", "#14B8A6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Create Account</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          </ScrollView>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.signInSection}>
              <Text style={[styles.signInPrompt, { color: '#9CA3AF', fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.sm }]}>Already have an account?{' '}<Text style={[styles.signInLink, { color: '#00E6CF', fontFamily: typography.fontFamily.semibold }]} onPress={handleSignIn}>Sign In</Text></Text>
            </View>
          </SafeAreaView>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
  },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 24, justifyContent: 'space-between' },
  form: {
    flex: 1,
  },
  accountTypeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  accountTypeText: {
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    minHeight: 24,
  },
  passwordToggle: {
    padding: 4,
  },
  socialBtn: { height: 52, borderRadius: 14, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  socialText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#374151' },
  dividerText: { color: '#9CA3AF', fontSize: 12, letterSpacing: 0.5 },
  signInSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  signInPrompt: {
    textAlign: 'center',
  },
  signInLink: {
    textDecorationLine: 'underline',
  },
});
