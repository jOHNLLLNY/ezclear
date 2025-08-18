/**
 * Sign In Screen
 * User authentication with email and password
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../src/context/AuthContext';
import { signInWithGoogle } from '../../src/lib/auth/google';
import { signInWithFacebook } from '../../src/lib/auth/facebook';
import { BackButton } from '../../src/components/ui/BackButton';
import { useFocusEffect } from '@react-navigation/native';

export default function SignInScreen() {
  const { signIn, loading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Clear form on every focus/visit
  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setPassword('');
      setShowPassword(false);
    }, [])
  );

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await signIn(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Sign In Failed', error.message || 'Please check your credentials and try again.');
    }
  };

  const handleSignUp = () => {
    router.push('/(auth)/create-account');
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F1117' }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
            {/* Header - Back button + Title aligned left */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 20 }}>
              <TouchableOpacity 
                style={{ padding: 8, marginRight: 12, marginLeft: -8 }}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={24} color="#E6E8EC" />
              </TouchableOpacity>
              <Text style={{ color: '#E6E8EC', fontSize: 22, fontWeight: '600' }}>Sign In</Text>
            </View>

            {/* Social buttons - vertical stack */}
            <View style={{ gap: 12, marginBottom: 18 }}>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    // If user previously selected a role in onboarding, it may be in metadata; otherwise default worker
                    await signInWithGoogle();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    router.replace('/(tabs)/home');
                  } catch (error: any) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    Alert.alert('Google Sign-In Failed', error.message || 'Please try again.');
                  }
                }}
                style={{
                  height: 56, borderRadius: 16, backgroundColor: '#1E212A',
                  flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18,
                  shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
                }}
              >
                <Ionicons name="logo-google" size={22} color="#E6E8EC" />
                <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
                  <Text style={{ color: '#E6E8EC', fontSize: 16, fontWeight: '600' }}>Continue with Google</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Alert.alert('Apple Sign-In', 'Not configured yet')}
                style={{
                  height: 56, borderRadius: 16, backgroundColor: '#1E212A',
                  flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18,
                  shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
                }}
              >
                <Ionicons name="logo-apple" size={22} color="#E6E8EC" />
                <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
                  <Text style={{ color: '#E6E8EC', fontSize: 16, fontWeight: '600' }}>Continue with Apple</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  try {
                    await signInWithFacebook();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    router.replace('/(tabs)/home');
                  } catch (error: any) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    Alert.alert('Facebook Sign-In Failed', error.message || 'Please try again.');
                  }
                }}
                style={{
                  height: 56, borderRadius: 16, backgroundColor: '#1E212A',
                  flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18,
                  shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
                }}
              >
                <Ionicons name="logo-facebook" size={20} color="#E6E8EC" />
                <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
                  <Text style={{ color: '#E6E8EC', fontSize: 16, fontWeight: '600' }}>Continue with Facebook</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 18 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#2A2F3A' }} />
              <Text style={{ marginHorizontal: 10, color: '#9AA0A6', letterSpacing: 2, fontSize: 12 }}>
                OR SIGN IN WITH EMAIL
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#2A2F3A' }} />
            </View>

            {/* Email Field */}
            <Text style={{ color: '#9AA0A6', fontSize: 14, marginBottom: 8 }}>Email</Text>
            <View style={{
              height: 56, borderRadius: 14, backgroundColor: '#1E212A',
              borderWidth: 1, borderColor: '#2A2F3A', paddingHorizontal: 16,
              flexDirection: 'row', alignItems: 'center', marginBottom: 16
            }}>
              <Ionicons name="mail-outline" size={20} color="#7E8592" style={{ marginRight: 12 }} />
              <TextInput 
                placeholder="your@email.com" 
                placeholderTextColor="#7E8592"
                keyboardType="email-address" 
                autoCapitalize="none" 
                autoComplete="off"
                textContentType="none"
                style={{ color: '#E6E8EC', fontSize: 16, flex: 1 }}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Field */}
            <Text style={{ color: '#9AA0A6', fontSize: 14, marginBottom: 8 }}>Password</Text>
            <View style={{
              height: 56, borderRadius: 14, backgroundColor: '#1E212A',
              borderWidth: 1, borderColor: '#2A2F3A', paddingHorizontal: 16,
              flexDirection: 'row', alignItems: 'center'
            }}>
              <Ionicons name="lock-closed-outline" size={20} color="#7E8592" style={{ marginRight: 12 }} />
              <TextInput 
                placeholder="Enter your password" 
                placeholderTextColor="#7E8592"
                secureTextEntry={!showPassword}
                autoComplete="off"
                textContentType="none"
                style={{ color: '#E6E8EC', fontSize: 16, flex: 1 }}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color="#7E8592" 
                />
              </TouchableOpacity>
            </View>
            
            {/* Forgot Password Link */}
            <TouchableOpacity 
              style={{ alignSelf: 'flex-end', marginTop: 12 }}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={{ color: '#19E5C0', fontSize: 14, fontWeight: '600' }}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Primary Sign In Button */}
            <TouchableOpacity 
              style={{
                height: 56, borderRadius: 16, backgroundColor: '#19E5C0',
                alignItems: 'center', justifyContent: 'center', marginTop: 24,
                opacity: loading ? 0.7 : 1
              }}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={{ color: '#0F1117', fontSize: 17, fontWeight: '700' }}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Footer - Create Account Link */}
            <View style={{ alignItems: 'center', marginTop: 24, paddingBottom: 20 }}>
              <Text style={{ color: '#9AA0A6', fontSize: 16 }}>
                Don't have an account?{' '}
                <Text 
                  style={{ color: '#19E5C0', fontWeight: '600' }}
                  onPress={handleSignUp}
                >
                  Create Account
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}