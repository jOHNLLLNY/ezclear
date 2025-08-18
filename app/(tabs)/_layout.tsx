/**
 * Tabs Layout
 * Main app navigation with bottom tabs
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { BottomTabBar } from '../../src/components/ui/BottomTabBar';
import { useTheme } from '../../src/context/ThemeProvider';
import { useAuth } from '../../src/context/AuthContext';
import i18n, { tShort } from '../../i18n';

export default function TabsLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [lng, setLng] = useState(i18n.language || 'en');
  const { profile, session } = useAuth();

  // Derive role immediately from session metadata (available right after sign-in/sign-up),
  // and then prefer the profile value once loaded
  const role = (profile?.user_type as 'worker' | 'hirer')
    || (session?.user?.user_metadata?.user_type as 'worker' | 'hirer')
    || 'worker';

  const tabsByRole = useMemo(() => ({
    worker: [
      { id: 'home', label: tShort('nav.home'), icon: 'home-outline', activeIcon: 'home' },
      { id: 'find', label: i18n.t('nav.jobs'), icon: 'search-outline', activeIcon: 'search' },
      { id: 'jobs', label: tShort('nav.myJobs'), icon: 'briefcase-outline', activeIcon: 'briefcase' },
      { id: 'messages', label: tShort('nav.messages'), icon: 'chatbubble-outline', activeIcon: 'chatbubble' },
      { id: 'profile', label: tShort('nav.profile'), icon: 'person-outline', activeIcon: 'person' },
    ],
    hirer: [
      { id: 'home', label: tShort('nav.home'), icon: 'home-outline', activeIcon: 'home' },
      { id: 'jobs', label: tShort('nav.myJobs'), icon: 'briefcase-outline', activeIcon: 'briefcase' },
      { id: 'post', label: tShort('nav.postJob'), icon: 'add', activeIcon: 'add', type: 'fab' },
      { id: 'messages', label: tShort('nav.messages'), icon: 'chatbubble-outline', activeIcon: 'chatbubble' },
      { id: 'profile', label: tShort('nav.profile'), icon: 'person-outline', activeIcon: 'person' },
    ],
  }), [lng]);

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    
    switch (tabId) {
      case 'home':
        router.push('/(tabs)/home');
        break;
      case 'find':
        if (role === 'worker') router.push('/(tabs)/jobs');
        else Alert.alert('Only for workers');
        break;
      case 'jobs':
        // Always open My Jobs root screen
        router.push('/(tabs)/my-jobs');
        break;
      case 'messages':
        router.push('/(tabs)/messages');
        break;
      case 'profile':
        router.push('/(tabs)/profile');
        break;
    }
  };

  // Reset active tab when role changes to ensure correct tabs layout without restart
  useEffect(() => {
    setActiveTab('home');
  }, [role]);

  // Re-render labels when language changes
  useEffect(() => {
    const handler = () => setLng(i18n.language);
    i18n.on('languageChanged', handler);
    return () => { i18n.off('languageChanged', handler); };
  }, []);

  const handlePostPress = () => {
    if (role !== 'hirer') {
      Alert.alert('Only for hirers');
      return;
    }
    router.push('/(tabs)/post-job');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="jobs" />
        <Stack.Screen name="my-jobs" />
        <Stack.Screen name="services" />
        <Stack.Screen name="service-details" />
        <Stack.Screen name="messages" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="contractors" />
        <Stack.Screen name="explore-map" />
        {/* Hire tools */}
        <Stack.Screen name="hire/jobs/posted" />
        <Stack.Screen name="hire/applicants" />
        <Stack.Screen name="hire/saved-contractors" />
        <Stack.Screen name="hire/invite" options={{ presentation: 'modal' }} />
        {/* Guarded routes: hide for hirer by redirecting to profile */}
        {role === 'hirer' ? null : (
          <Stack.Screen name="invoice" options={{ presentation: 'card' }} />
        )}
        <Stack.Screen
          name="post-job"
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="job-detail"
          options={{
            presentation: 'card',
          }}
        />
        {/* Guarded routes for hire-disabled pages */}
        {role === 'hirer' ? null : <></>}
      </Stack>
      
      <BottomTabBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onPostPress={handlePostPress}
        tabs={tabsByRole[role] as any}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
