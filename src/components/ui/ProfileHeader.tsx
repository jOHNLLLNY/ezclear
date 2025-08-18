/**
 * ProfileHeader Component - V0 Design System
 * User profile header with avatar, name, rating, and stats
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeProvider';

interface ProfileHeaderProps {
  name: string;
  email?: string;
  role: 'worker' | 'hirer';
  rating?: number;
  reviewsCount?: number;
  jobsCompleted?: number;
  avatarUrl?: string;
  style?: ViewStyle;
}

export function ProfileHeader({
  name,
  email,
  role,
  rating = 0,
  reviewsCount = 0,
  jobsCompleted = 0,
  avatarUrl,
  style,
}: ProfileHeaderProps) {
  const { colors, typography, spacing, radius } = useTheme();

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons
            key={i}
            name="star"
            size={16}
            color={colors.warning}
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons
            key={i}
            name="star-half"
            size={16}
            color={colors.warning}
          />
        );
      } else {
        stars.push(
          <Ionicons
            key={i}
            name="star-outline"
            size={16}
            color={colors.muted}
          />
        );
      }
    }

    return stars;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Avatar and Basic Info */}
      <View style={styles.mainInfo}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={[styles.avatarImage, { borderRadius: radius.full }]}
            />
          ) : (
            <Text
              style={[
                styles.avatarText,
                {
                  color: colors.background,
                  fontFamily: typography.fontFamily.bold,
                  fontSize: typography.fontSize['2xl'],
                },
              ]}
            >
              {name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text
            style={[
              styles.name,
              {
                color: colors.onSurface,
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize.xl,
                marginBottom: spacing[1],
              },
            ]}
          >
            {name}
          </Text>

          {email && (
            <Text
              style={[
                styles.email,
                {
                  color: colors.muted,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.base,
                  marginBottom: spacing[2],
                },
              ]}
            >
              {email}
            </Text>
          )}

          {/* Role Badge */}
          <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons
              name={role === 'worker' ? 'briefcase' : 'search'}
              size={14}
              color={colors.primary}
            />
            <Text
              style={[
                styles.roleText,
                {
                  color: colors.primary,
                  fontFamily: typography.fontFamily.semibold,
                  fontSize: typography.fontSize.sm,
                  marginLeft: spacing[1],
                },
              ]}
            >
              {role === 'worker' ? 'Worker' : 'Hirer'}
            </Text>
          </View>
        </View>
      </View>

      {/* Rating and Stats */}
      <View style={styles.statsSection}>
        {/* Rating */}
        {rating > 0 && (
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {renderStars(rating)}
            </View>
            <Text
              style={[
                styles.ratingText,
                {
                  color: colors.onSurface,
                  fontFamily: typography.fontFamily.semibold,
                  fontSize: typography.fontSize.base,
                  marginLeft: spacing[2],
                },
              ]}
            >
              {rating.toFixed(1)}
            </Text>
            <Text
              style={[
                styles.reviewsText,
                {
                  color: colors.muted,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.sm,
                  marginLeft: spacing[1],
                },
              ]}
            >
              ({reviewsCount} reviews)
            </Text>
          </View>
        )}

        {/* Jobs Completed */}
        {jobsCompleted > 0 && (
          <View style={styles.jobsContainer}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text
              style={[
                styles.jobsText,
                {
                  color: colors.onSurface,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.base,
                  marginLeft: spacing[1],
                },
              ]}
            >
              {jobsCompleted} jobs completed
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Container styles
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 80,
    height: 80,
  },
  avatarText: {
    // styles applied inline
  },
  userInfo: {
    flex: 1,
  },
  name: {
    // styles applied inline
  },
  email: {
    // styles applied inline
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  roleText: {
    // styles applied inline
  },
  statsSection: {
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    // styles applied inline
  },
  reviewsText: {
    // styles applied inline
  },
  jobsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobsText: {
    // styles applied inline
  },
});
