/**
 * Complete Profile Screen
 * Minimal form to finish user profile after sign-up/sign-in
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/context/ThemeProvider';
import { useAuth } from '../../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../src/lib/supabase';

export default function CompleteProfileScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const { user, profile } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [location, setLocation] = useState(profile?.location ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    if (!fullName) {
      Alert.alert('Missing info', 'Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, location })
        .eq('id', user.id);

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Save failed', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>          
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize['2xl'],
              textAlign: 'center',
            }}
          >
            Complete Your Profile
          </Text>
          <Text
            style={{
              color: colors.muted,
              fontFamily: typography.fontFamily.medium,
              fontSize: typography.fontSize.base,
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            Add your name and location to continue
          </Text>
        </View>

        <View style={[styles.content, { paddingHorizontal: spacing[4] }]}>          
          <Text style={[styles.label, { color: colors.textPrimary }]}>Full Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderRadius: radius.lg }]}
            placeholder="e.g., John Doe"
            placeholderTextColor="#FFFFFF"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={[styles.label, { color: colors.textPrimary, marginTop: 16 }]}>Location</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderRadius: radius.lg }]}
            placeholder="City, Province"
            placeholderTextColor="#FFFFFF"
            value={location}
            onChangeText={setLocation}
          />

          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.9}
            style={{ borderRadius: 16, overflow: 'hidden', height: 56, marginTop: 24, opacity: loading ? 0.7 : 1 }}
          >
            <LinearGradient colors={["#00E6CF", "#14B8A6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{loading ? 'Saving...' : 'Save and Continue'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 16 },
  content: { marginTop: 24 },
  label: { marginBottom: 8 },
  input: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 48 },
});
