/**
 * Home Screen - V0 Design Match
 * Pixel-perfect recreation of v0-ez-clear-design.vercel.app
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Context and hooks
import { useAuth } from '../../context/AuthContext';

// Services and data
import { jobService } from '../../services/jobService';
import { Job } from '../../types';

// Theme
import { theme } from '../../ui';

const { width } = Dimensions.get('window');

// Services data matching v0 design
const services = [
  { id: 1, name: 'Plumbing', icon: 'water-outline', color: '#3B82F6' },
  { id: 2, name: 'Electrical', icon: 'flash-outline', color: '#F59E0B' },
  { id: 3, name: 'Cleaning', icon: 'sparkles-outline', color: '#10B981' },
  { id: 4, name: 'Handyman', icon: 'hammer-outline', color: '#8B5CF6' },
  { id: 5, name: 'Painting', icon: 'brush-outline', color: '#EF4444' },
  { id: 6, name: 'Gardening', icon: 'leaf-outline', color: '#059669' },
];

export default function HomeScreen() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobsData = await jobService.getRecentJobs();
      setJobs(jobsData.slice(0, 3)); // Show only 3 jobs
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Ionicons name="flash" size={20} color="white" />
          </View>
          <Text style={styles.logoText}>EZ Clear</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.notificationContainer}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.textPrimary} />
              <View style={styles.notificationBadge} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.main} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section - V0 Style */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Find and hire local{'\n'}service providers
          </Text>
          <Text style={styles.heroSubtitle}>
            Connect with trusted professionals in your area for home services, repairs, and more.
          </Text>
          <View style={styles.heroButtons}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Find Services</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Post a Job</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Popular Services - V0 Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity key={service.id} style={styles.serviceCard}>
                <View style={[styles.serviceIconContainer, { backgroundColor: service.color + '20' }]}>
                  <Ionicons name={service.icon} size={28} color={service.color} />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>
                  Professional {service.name.toLowerCase()} services
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Jobs</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          {jobs.map((job) => (
            <TouchableOpacity key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.jobIconContainer}>
                  <Ionicons name="briefcase-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobLocation}>{job.location}</Text>
                </View>
                <Text style={styles.jobBudget}>${job.budget}</Text>
              </View>
              <Text style={styles.jobDescription} numberOfLines={2}>
                {job.description}
              </Text>
              <View style={styles.jobFooter}>
                <Text style={styles.jobTime}>{job.timeAgo}</Text>
                <View style={styles.jobActions}>
                  <TouchableOpacity style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.applyButton}>
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA Section */}
        <View style={styles.section}>
          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Ready to get started?</Text>
            <Text style={styles.ctaDescription}>
              Join thousands of professionals and customers on EZ Clear
            </Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Get Started Today</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacingSystem.headerSide,
    paddingVertical: theme.spacingSystem.header,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.stroke,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
  },
  logoText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  iconButton: {
    padding: theme.spacing[2],
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },

  // Main content
  main: {
    flex: 1,
  },

  // Hero section
  heroSection: {
    paddingHorizontal: theme.spacingSystem.headerSide,
    paddingVertical: theme.spacingSystem.section * 2,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: theme.typography.fontSize['3xl'],
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacingSystem.element,
    lineHeight: theme.typography.fontSize['3xl'] * 1.2,
  },
  heroSubtitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.normal,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacingSystem.section,
    lineHeight: theme.typography.fontSize.base * 1.5,
    paddingHorizontal: theme.spacing[4],
  },
  heroButtons: {
    flexDirection: 'row',
    gap: theme.spacingSystem.element,
    width: '100%',
    paddingHorizontal: theme.spacing[4],
  },
  primaryButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacingSystem.card,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.semibold,
    color: 'white',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    paddingVertical: theme.spacingSystem.card,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.textPrimary,
  },

  // Section styles
  section: {
    marginBottom: theme.spacingSystem.section,
    paddingHorizontal: theme.spacingSystem.headerSide,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacingSystem.element,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.title,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacingSystem.element,
  },
  viewAllText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.primary,
  },

  // Services grid
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacingSystem.element,
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: (width - theme.spacingSystem.headerSide * 2 - theme.spacingSystem.element) / 2,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacingSystem.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacingSystem.element,
  },
  serviceName: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing[1],
  },
  serviceDescription: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.normal,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.xs * 1.4,
  },

  // Job cards
  jobCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacingSystem.card,
    marginBottom: theme.spacingSystem.element,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
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
    marginRight: theme.spacingSystem.element,
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
    marginBottom: theme.spacingSystem.element,
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
    paddingHorizontal: theme.spacing[4],
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
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.secondary,
  },
  applyButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: 'white',
  },

  // CTA section
  ctaCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacingSystem.section,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  ctaTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  ctaDescription: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.normal,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacingSystem.section,
    lineHeight: theme.typography.fontSize.base * 1.5,
  },
  ctaButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacingSystem.section,
    paddingVertical: theme.spacingSystem.card,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  ctaButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.semibold,
    color: 'white',
  },
});
