/**
 * Job Card Component
 * Displays job information in a card format
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../../../i18n';
import { useTheme } from '../../context/ThemeProvider';
import { SurfaceCard } from './Card';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  budget?: string;
  timeAgo: string;
  status?: 'open' | 'assigned' | 'completed';
  service_type?: string;
}

interface JobCardProps {
  job: Job;
  onPress?: () => void;
  onApply?: () => void;
  showActions?: boolean;
  style?: ViewStyle;
}

export function JobCard({
  job,
  onPress,
  onApply,
  showActions = true,
  style,
}: JobCardProps) {
  const { colors, typography, spacing, radius } = useTheme();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'open':
        return colors.secondary;
      case 'assigned':
        return colors.primary;
      case 'completed':
        return colors.textMuted;
      default:
        return colors.secondary;
    }
  };

  const getServiceIcon = (serviceType?: string) => {
    // Map service types to icons
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'snow-removal': 'snow-outline',
      'landscaping': 'leaf-outline',
      'renovation': 'hammer-outline',
      'cleaning': 'sparkles-outline',
      'plumbing': 'water-outline',
      'electrical': 'flash-outline',
    };

    return iconMap[serviceType || ''] || 'briefcase-outline';
  };

  return (
    <SurfaceCard variant="elevated" padding="none" style={style}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Job: ${job.title}`}
      >
        {/* Header */}
        <View style={[styles.header, { padding: spacing[4] }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons
                name={getServiceIcon(job.service_type)}
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.jobInfo}>
              <Text
                style={[
                  styles.title,
                  {
                    color: colors.onSurface,
                    fontFamily: typography.fontFamily.semibold,
                    fontSize: typography.fontSize.base,
                  },
                ]}
                numberOfLines={1}
              >
                {job.title}
              </Text>
              <Text
                style={[
                  styles.location,
                  {
                    color: '#00E6CF',
                    fontFamily: typography.fontFamily.medium,
                    fontSize: typography.fontSize.sm,
                  },
                ]}
                numberOfLines={1}
              >
                <Ionicons name="location-outline" size={12} color={'#00E6CF'} />
                {' '}{job.location}
              </Text>
            </View>
          </View>

          {job.budget && (
            <Text
              style={[
                styles.budget,
                {
                  color: colors.secondary,
                  fontFamily: typography.fontFamily.bold,
                  fontSize: typography.fontSize.base,
                },
              ]}
            >
              ${job.budget}
            </Text>
          )}
        </View>

        {/* Description */}
        <View style={[styles.description, { paddingHorizontal: spacing[4] }]}>
          <Text
            style={[
                styles.descriptionText,
              {
                color: '#FFFFFF',
                fontFamily: typography.fontFamily.medium,
                fontSize: typography.fontSize.sm,
              },
            ]}
            numberOfLines={2}
          >
            {job.description}
          </Text>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { padding: spacing[4] }]}>
          <View style={styles.footerLeft}>
            <Text
              style={[
                styles.timeAgo,
                {
                  color: '#FFFFFF',
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.xs,
                },
              ]}
            >
              {job.timeAgo}
            </Text>

            {job.status && (
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '20' }]}>
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: getStatusColor(job.status),
                      fontFamily: typography.fontFamily.semibold,
                      fontSize: typography.fontSize.xs,
                    },
                  ]}
                >
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Text>
              </View>
            )}
          </View>

          {showActions && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.detailsButton, { borderColor: colors.stroke }]}
                onPress={onPress}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.detailsButtonText,
                    {
                      color: colors.textPrimary,
                      fontFamily: typography.fontFamily.medium,
                      fontSize: typography.fontSize.xs,
                    },
                  ]}
                >
                  {i18n.t('jobs.details')}
                </Text>
              </TouchableOpacity>

              {onApply && job.status === 'open' && (
                <TouchableOpacity
                  style={[styles.applyButton, { backgroundColor: colors.primary }]}
                  onPress={onApply}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.applyButtonText,
                      {
                        color: 'white',
                        fontFamily: typography.fontFamily.semibold,
                        fontSize: typography.fontSize.xs,
                      },
                    ]}
                  >
                    Apply
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  container: {
    // Container styles handled by Card
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  location: {
    // styles applied inline
  },
  budget: {
    // styles applied inline
  },
  description: {
    marginBottom: 8,
  },
  descriptionText: {
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeAgo: {
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    // styles applied inline
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
  },
  detailsButtonText: {
    // styles applied inline
  },
  applyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  applyButtonText: {
    // styles applied inline
  },
});
