/**
 * Bottom Tab Bar Component
 * Custom tab bar with floating post button
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeProvider';

const { width } = Dimensions.get('window');

interface Tab {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  type?: 'fab' | 'tab';
}

interface BottomTabBarProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
  onPostPress: () => void;
  tabs?: Tab[];
}

const defaultTabs: Tab[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: 'briefcase-outline',
    activeIcon: 'briefcase',
  },
  {
    id: 'post', // Placeholder for center button
    label: 'Post',
    icon: 'add',
    activeIcon: 'add',
    type: 'fab',
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

export function BottomTabBar({
  activeTab,
  onTabPress,
  onPostPress,
  tabs = defaultTabs,
}: BottomTabBarProps) {
  const { colors, typography, spacing, radius, shadows } = useTheme();

  const handleTabPress = (tabId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabPress(tabId);
  };

  const handlePostPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPostPress();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View
        style={[
          styles.tabContainer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.stroke,
          },
        ]}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;

          // Center button (Post)
          if (tab.type === 'fab') {
            return (
              <View key={tab.id} style={styles.centerButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.postButton,
                    {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                      shadowOpacity: 0.85,
                      shadowRadius: 18,
                      elevation: 12,
                    },
                  ]}
                  onPress={handlePostPress}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Post a job"
                >
                  <Ionicons name="add" size={28} color={colors.background} />
                </TouchableOpacity>
              </View>
            );
          }

          // Regular tab
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${tab.label} tab`}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={22}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? colors.primary : colors.textSecondary,
                      fontFamily: typography.fontFamily.medium,
                      fontSize: typography.fontSize.xs,
                      maxWidth: 80,
                    },
                  ]}
                >
                  {tab.label}
                </Text>

                {/* Active indicator */}
                {isActive && (
                  <View
                    style={[
                      styles.activeIndicator,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    height: 80,
    paddingHorizontal: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabLabel: {
    marginTop: 4,
    textAlign: 'center',
  },
  activeIndicator: {
    marginTop: 2,
    width: 22,
    height: 3,
    borderRadius: 2,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
  },
  postButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
  },
});
