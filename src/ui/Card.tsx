/**
 * Card Component - V0 Design System
 * Modern card with hover effects and variants
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Theme
import { theme } from '../theme/theme';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'gradient';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  disabled?: boolean;
}

export default function Card({
  children,
  variant = 'default',
  onPress,
  style,
  contentStyle,
  disabled = false,
}: CardProps) {
  const cardStyles = [
    styles.base,
    styles[variant],
    style,
  ];

  const contentStyles = [
    styles.content,
    contentStyle,
  ];

  if (variant === 'gradient') {
    const Component = onPress ? TouchableOpacity : View;
    
    return (
      <Component
        style={[styles.base, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={onPress ? 0.8 : 1}
      >
        <LinearGradient
          colors={[
            theme.colors.card,
            theme.colors.cardHover,
          ]}
          style={[styles.gradient, contentStyles]}
        >
          {children}
        </LinearGradient>
      </Component>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View style={contentStyles}>
          {children}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles}>
      <View style={contentStyles}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  content: {
    padding: theme.spacing[4],
  },

  // Variants
  default: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  elevated: {
    backgroundColor: theme.colors.card,
    ...theme.shadows.card,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  gradient: {
    borderRadius: theme.radius.lg,
  },
});

// Service Card Component
interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress?: () => void;
  color?: string;
}

export function ServiceCard({
  title,
  description,
  icon,
  onPress,
  color = theme.colors.primary,
}: ServiceCardProps) {
  return (
    <Card variant="default" onPress={onPress} style={styles.serviceCard}>
      <View style={styles.serviceCardContent}>
        <View style={[styles.serviceIcon, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceTitle}>{title}</Text>
          <Text style={styles.serviceDescription}>{description}</Text>
        </View>
      </View>
    </Card>
  );
}

// Job Card Component
interface JobCardProps {
  title: string;
  location: string;
  budget: string;
  description: string;
  timeAgo: string;
  onPress?: () => void;
  onApply?: () => void;
}

export function JobCard({
  title,
  location,
  budget,
  description,
  timeAgo,
  onPress,
  onApply,
}: JobCardProps) {
  return (
    <Card variant="default" style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.jobIconContainer}>
          <Ionicons name="briefcase-outline" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{title}</Text>
          <Text style={styles.jobLocation}>{location}</Text>
        </View>
        <Text style={styles.jobBudget}>{budget}</Text>
      </View>
      
      <Text style={styles.jobDescription} numberOfLines={2}>
        {description}
      </Text>
      
      <View style={styles.jobFooter}>
        <Text style={styles.jobTime}>{timeAgo}</Text>
        <View style={styles.jobActions}>
          {onPress && (
            <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
              <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>
          )}
          {onApply && (
            <TouchableOpacity style={styles.applyButton} onPress={onApply}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
}

// Additional styles for specialized cards
const additionalStyles = StyleSheet.create({
  // Service Card
  serviceCard: {
    marginBottom: theme.spacing[3],
  },
  serviceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing[1],
  },
  serviceDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.normal,
    color: theme.colors.textMuted,
  },

  // Job Card
  jobCard: {
    marginBottom: theme.spacing[3],
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  jobIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing[1],
  },
  jobLocation: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.normal,
    color: theme.colors.textMuted,
  },
  jobBudget: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
  jobDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.normal,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.fontSize.sm * 1.5,
    marginBottom: theme.spacing[3],
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTime: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.normal,
    color: theme.colors.textMuted,
  },
  jobActions: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  detailsButton: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  detailsButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
  },
  applyButton: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.secondary,
  },
  applyButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: 'white',
  },
});

// Merge styles
Object.assign(styles, additionalStyles);
