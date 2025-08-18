/**
 * Bottom Navigation - V0 Design Match
 * Modern bottom navigation with floating action button
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Theme
import { theme } from '../ui';

const { width } = Dimensions.get('window');

interface Tab {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const tabs: Tab[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    id: 'search',
    label: 'Search',
    icon: 'search-outline',
    activeIcon: 'search',
  },
  {
    id: 'post', // Placeholder for center button
    label: 'Post',
    icon: 'add',
    activeIcon: 'add',
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: 'chatbubble-outline',
    activeIcon: 'chatbubble',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
];

interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
  onPostPress: () => void;
}

export default function BottomNavigation({
  activeTab,
  onTabPress,
  onPostPress,
}: BottomNavigationProps) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <View style={styles.tabContainer}>
          {tabs.map((tab, index) => {
            // Center button (Post)
            if (tab.id === 'post') {
              return (
                <View key={tab.id} style={styles.centerButtonContainer}>
                  <TouchableOpacity
                    style={styles.postButton}
                    onPress={onPostPress}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              );
            }

            // Regular tabs
            const isActive = activeTab === tab.id;
            
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tab}
                onPress={() => onTabPress(tab.id)}
                activeOpacity={0.7}
              >
                <View style={styles.tabContent}>
                  <Ionicons
                    name={isActive ? tab.activeIcon : tab.icon}
                    size={24}
                    color={isActive ? theme.colors.primary : theme.colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      isActive && styles.tabLabelActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </View>
                
                {/* Active indicator */}
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  blurContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.stroke,
    backgroundColor: theme.colors.background + 'E6', // 90% opacity
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    height: 80,
  },
  
  // Regular tabs
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textMuted,
    marginTop: theme.spacing[1],
  },
  tabLabelActive: {
    color: theme.colors.primary,
  },
  activeIndicator: {
    position: 'absolute',
    top: -theme.spacing[1],
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },

  // Center post button
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.button,
    // Gradient effect would go here in a real implementation
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
});
