/**
 * Welcome Screen
 * First screen users see - matches v0 onboarding design
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image, FlatList, NativeScrollEvent, NativeSyntheticEvent, Animated } from 'react-native';
import { useTheme } from '../../src/context/ThemeProvider';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: 'briefcase-outline' as const,
    title: 'Get Work Done',
    desc: 'Reliable contractors ready to help with your indoor and outdoor maintenance needs.',
  },
  {
    icon: 'home-outline' as const,
    title: 'Welcome to EZ Clear',
    desc: 'The easiest way to connect with contractors for renovation services, snow removal, landscaping, and more.',
  },
  {
    icon: 'search-outline' as const,
    title: 'Find Services Quickly',
    desc: 'Browse available services in your area and book with just a few taps.',
  },
];

export default function WelcomeScreen() {
  const { typography } = useTheme();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  const handleGetStarted = () => {
    router.push('/(auth)/role-selection');
  };

  const handleSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  // Handle manual scroll
  useEffect(() => {
    // subtle fade on index change
    fade.setValue(0.9);
    Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [index]);

  return (
    <View style={[styles.container, { backgroundColor: '#0B0B0F' }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Logo Section */}
        <View style={styles.topLogoSection}>
          <Image source={require('../assets/ezclear_logo.png')} style={styles.logo} />
        </View>

        {/* Center Content Section */}
        <View style={styles.centerContent}>
          <View style={styles.slideContainer}>
            <Animated.FlatList
              ref={listRef}
              data={slides}
              keyExtractor={(_, i) => String(i)}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              decelerationRate="fast"
              snapToInterval={width}
              snapToAlignment="center"
              bounces={false}
              contentContainerStyle={{ flexGrow: 1 }}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                const i = Math.round(e.nativeEvent.contentOffset.x / width);
                setIndex(i);
              }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              renderItem={({ item }) => (
                <View style={styles.slideItem}>
                  <View style={styles.slideContent}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                      <Ionicons name={item.icon} size={80} color={'#8B5CF6'} />
                    </View>
                    
                    {/* Title */}
                    <Text style={[styles.slideTitle, { fontFamily: typography.fontFamily.bold }]}>
                      {item.title}
                    </Text>
                    
                    {/* Description */}
                    <Text style={styles.slideDescription}>
                      {item.desc}
                    </Text>
                  </View>
                </View>
              )}
            />
            
            {/* Pagination indicators */}
            <View style={styles.paginationContainer}>
              {[0,1,2].map((i) => {
                const isActive = i === index;
                return (
                  <View 
                    key={i} 
                    style={[
                      styles.paginationDot,
                      { 
                        width: isActive ? 24 : 6, 
                        backgroundColor: isActive ? '#8B5CF6' : 'rgba(255,255,255,0.25)' 
                      }
                    ]} 
                  />
                );
              })}
            </View>
          </View>
        </View>

        {/* Bottom Buttons Section */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Get Started"
          >
            <Text style={[styles.primaryButtonText, { fontFamily: typography.fontFamily.medium }]}>
              Get Started →
            </Text>
          </TouchableOpacity>

          <View style={styles.signInSection}>
            <Text style={styles.signInPrompt}>
              Already have an account?{' '}
              <Text
                style={[styles.signInLink, { fontFamily: typography.fontFamily.medium }]}
                onPress={handleSignIn}
              >
                Sign In
              </Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  
  // Top Logo Section
  topLogoSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    width: 525,
    height: 225,
    resizeMode: 'contain',
  },
  
  // Center Content Section - Perfect centering
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -60,
  },
  slideContainer: {
    width: '100%',
    alignItems: 'center',
  },
  slideItem: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  slideContent: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  slideDescription: {
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
    maxWidth: 280,
  },
  
  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
    alignSelf: 'center',
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },
  
  // Bottom Buttons Section
  bottomButtons: {
    paddingHorizontal: 32,
    paddingBottom: 20,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    maxWidth: 360,
    height: 56,
    backgroundColor: '#A855F7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signInSection: {
    alignItems: 'center',
  },
  signInPrompt: {
    color: '#A1A1AA',
    fontSize: 16,
    textAlign: 'center',
  },
  signInLink: {
    color: '#A855F7',
    fontWeight: '600',
  },
});
