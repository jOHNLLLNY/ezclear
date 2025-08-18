/**
 * Jobs Screen
 * Browse and search for available jobs
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeProvider';
import { AppBar } from '../../src/components/ui/AppBar';
import { SearchBar } from '../../src/components/ui/SearchBar';
import { JobCard } from '../../src/components/ui/JobCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ServiceChip } from '../../src/components/ui/ServiceChip';
import { SecondaryButton } from '../../src/components/ui/SecondaryButton';
import i18n from '../../i18n';

// Data is loaded from Supabase

const categories = [
  { id: 'all', name: 'All', icon: 'apps-outline' },
  { id: 'snow-removal', name: 'Snow Removal', icon: 'snow-outline' },
  { id: 'landscaping', name: 'Landscaping', icon: 'leaf-outline' },
  { id: 'renovation', name: 'Renovation', icon: 'hammer-outline' },
  { id: 'cleaning', name: 'Cleaning', icon: 'sparkles-outline' },
  { id: 'plumbing', name: 'Plumbing', icon: 'water-outline' },
  { id: 'electrical', name: 'Electrical', icon: 'flash-outline' },
];

export default function JobsScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const router = useRouter();
  const { category, search } = useLocalSearchParams<{ category?: string; search?: string }>();
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [searchQuery, setSearchQuery] = useState(search || '');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    filterJobs();
  }, [selectedCategory, searchQuery, jobs]);

  // Fetch jobs from Supabase
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const { db } = await import('../../src/lib/supabase');
        const data = await db.getJobs({ category: selectedCategory !== 'all' ? selectedCategory : undefined });
        if (Array.isArray(data) && data.length) {
          // Map to UI shape if necessary
          const mapped = data.map((j: any) => ({
            id: j.id,
            title: j.title,
            description: j.description,
            location: j.location,
            budget: j.budget,
            timeAgo: '',
            status: j.status,
            service_type: j.service_type,
          }));
          setJobs(mapped);
        } else {
          setJobs([] as any);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [selectedCategory]);

  const filterJobs = () => {
    let filtered = jobs;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(job => job.service_type === selectedCategory);
    }

    // Filter by search query (be robust to nulls)
    const q = String(searchQuery || '').toLowerCase();
    if (q) {
      const lc = (v: any) => String(v || '').toLowerCase();
      filtered = filtered.filter(job =>
        lc(job.title).includes(q) ||
        lc(job.description).includes(q) ||
        lc(job.location).includes(q)
      );
    }

    setFilteredJobs(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleJobPress = (jobId: string) => {
    router.push(`/WorkerJobDetails?jobId=${jobId}`);
  };

  const handleApply = (jobId: string) => {
    // Handle job application
    console.log('Apply to job:', jobId);
  };

  const renderJob = ({ item }: { item: typeof mockJobs[0] }) => (
    <JobCard
      job={item}
      onPress={() => handleJobPress(item.id)}
      onApply={() => handleApply(item.id)}
      style={styles.jobCard}
    />
  );

  const renderCategory = ({ item }: { item: typeof categories[0] }) => {
    const isSelected = selectedCategory === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryChip,
          {
            backgroundColor: isSelected ? colors.accent : colors.surface,
            borderRadius: radius.full,
          },
        ]}
        onPress={() => setSelectedCategory(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={item.icon}
          size={16}
          color={isSelected ? 'white' : colors.textMuted}
          style={styles.categoryIcon}
        />
        <Text
          style={[
            styles.categoryText,
            {
              color: isSelected ? 'white' : colors.textMuted,
              fontFamily: typography.fontFamily.medium,
              fontSize: typography.fontSize.sm,
            },
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing[4] }]}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.textPrimary,
                fontFamily: typography.fontFamily.semibold,
                fontSize: 22,
              },
            ]}
          >
            {i18n.t('home.availableJobs')}
          </Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchSection, { paddingHorizontal: spacing[4] }]}>
          <SearchBar
            placeholder={i18n.t('home.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            rightIcon="options-outline"
            onPressRight={() => setShowFilters(true)}
            accessibilityLabel={i18n.t('home.searchPlaceholder')}
            style={{ backgroundColor: '#1F2937', borderColor: '#334155', borderWidth: 1, borderRadius: 16 }}
          />
        </View>

        {/* List header with counter */}
        <View style={{ paddingHorizontal: spacing[4], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.medium, fontSize: 16 }}>{i18n.t('home.availableJobs')}</Text>
          <View style={{ backgroundColor: '#111827', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{`${filteredJobs.length} ${i18n.t('common.jobs')}`}</Text>
          </View>
        </View>

        {/* Categories (hidden if empty state) */}
        {filteredJobs.length > 0 && (
          <View style={styles.categoriesSection}>
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.categoriesList, { paddingHorizontal: spacing[4] }]}
            />
          </View>
        )}

        {/* Jobs List */}
        <View style={styles.jobsSection}>
          {loading ? (
            <View style={{ paddingHorizontal: spacing[4] }}>
              <View style={[styles.skeletonCard, { backgroundColor: colors.surface }]} />
              <View style={{ height: 12 }} />
              <View style={[styles.skeletonCard, { backgroundColor: colors.surface }]} />
            </View>
          ) : error ? (
            <View style={{ padding: 24 }}>
              <Text style={{ color: colors.error }}>Error: {error}</Text>
            </View>
          ) : filteredJobs.length > 0 ? (
            <FlatList
              data={filteredJobs}
              renderItem={renderJob}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={[styles.jobsList, { paddingHorizontal: spacing[4], paddingBottom: 24 }]}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            />
          ) : jobs.length === 0 ? (
            <View style={{ paddingHorizontal: spacing[4] }}>
              <View style={{ backgroundColor: '#111827', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#334155' }}>
                <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.medium, fontSize: 16, textAlign: 'center' }}>
                  {i18n.t('jobs.noResults')}
                </Text>
                <Text style={{ color: '#FFFFFF', marginTop: 6, textAlign: 'center' }}>
                  {i18n.t('jobs.tryAdjust')}
                </Text>
                <TouchableOpacity
                  onPress={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                  activeOpacity={0.8}
                  style={{ marginTop: 14, height: 48, borderRadius: 16, borderWidth: 1, borderColor: '#334155', alignItems: 'center', justifyContent: 'center' }}
                  accessibilityRole="button"
                  accessibilityLabel={i18n.t('jobs.clearFilters')}
                >
                  <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.medium }}>{i18n.t('jobs.clearFilters')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // When there are jobs but filters return 0, don't show empty state
            <View />
          )}
        </View>
      </SafeAreaView>

      {/* Filters Modal */}
      <Modal transparent visible={showFilters} animationType="fade" onRequestClose={() => setShowFilters(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, fontSize: 18 }}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)} accessibilityLabel="Close filters">
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            {/* Simple filter: category quick select */}
            <FlatList
              data={categories}
              keyExtractor={(i) => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8, gap: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedCategory(item.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: selectedCategory === item.id ? colors.accent : colors.surface,
                    borderWidth: 1,
                    borderColor: colors.stroke,
                  }}
                >
                  <Ionicons name={item.icon as any} size={16} color={selectedCategory === item.id ? 'white' : colors.textMuted} style={{ marginRight: 6 }} />
                  <Text style={{ color: selectedCategory === item.id ? 'white' : colors.textMuted }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              style={{ marginTop: 12, height: 48, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
              accessibilityLabel="Apply filters"
            >
              <Text style={{ color: '#FFFFFF', fontFamily: typography.fontFamily.semibold }}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  headerTitle: {
    // styles applied inline
  },
  filterButton: {
    padding: 8,
  },
  searchSection: {
    marginBottom: 12,
  },
  categoriesSection: {
    marginBottom: 16,
  },
  categoriesList: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    // styles applied inline
  },
  jobsSection: {
    flex: 1,
  },
  jobsList: {
    paddingBottom: 100,
  },
  jobCard: {
    // styles handled by JobCard component
  },
  skeletonCard: {
    height: 120,
    borderRadius: 16,
  },
});
