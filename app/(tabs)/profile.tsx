/**
 * Profile Screen
 * User profile and account settings
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeProvider';
import { useAuth } from '../../src/context/AuthContext';
import { Card } from '../../src/components/ui/Card';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import i18n, { tShort } from '../../i18n';

const profileMenuItems = [
  {
    id: 'edit-profile',
    title: 'Edit Profile',
    icon: 'person-outline',
    description: 'Update your personal information',
  },
  {
    id: 'my-jobs',
    title: 'My Jobs',
    icon: 'briefcase-outline',
    description: 'View your posted jobs and applications',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'notifications-outline',
    description: 'Manage notification preferences',
  },
  // invoice, reviews, payment will be conditionally shown for workers only
  {
    id: 'help',
    title: 'Help & Support',
    icon: 'help-circle-outline',
    description: 'Get help and contact support',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'settings-outline',
    description: 'App settings and preferences',
  },
];

export default function ProfileScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const { profile, session, signOut } = useAuth();
  const router = useRouter();
  const isHire = (profile?.user_type || session?.user?.user_metadata?.user_type) === 'hirer';

  // Hire counters
  const [postedCounts, setPostedCounts] = useState<{ active: number; closed: number }>({ active: 0, closed: 0 });
  const [applicantsNew, setApplicantsNew] = useState<number>(0);
  const [savedTotal, setSavedTotal] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        if (!isHire || !profile?.id) return;
        const { supabase } = await import('../../src/lib/supabase');
        // Jobs counts
        const { data: jobs } = await supabase
          .from('jobs')
          .select('id,status')
          .eq('user_id', profile.id);
        const active = (jobs || []).filter((j: any) => ['open','active','assigned'].includes(String(j?.status ?? '').toLowerCase())).length;
        const closed = (jobs || []).filter((j: any) => ['closed','completed','cancelled','canceled'].includes(String(j?.status ?? '').toLowerCase())).length;
        setPostedCounts({ active, closed });

        // Applicants new
        const { data: apps } = await supabase
          .from('job_applications')
          .select('id,status,job_id,created_at')
          .in('job_id', (jobs || []).map((j: any) => j.id));
        const newCount = (apps || []).filter((a: any) => ['applied','pending','new'].includes(String(a.status || '').toLowerCase())).length;
        setApplicantsNew(newCount);

        // Saved contractors total (if table exists)
        try {
          const { data: favs } = await supabase
            .from('saved_contractors')
            .select('id')
            .eq('user_id', profile.id);
          setSavedTotal((favs || []).length);
        } catch {
          setSavedTotal(0);
        }
      } catch {}
    })();
  }, [isHire, profile?.id]);

  const handleMenuItemPress = (itemId: string) => {
    switch (itemId) {
      case 'edit-profile':
        router.push('/(tabs)/edit-profile');
        break;
      case 'my-jobs':
        router.push('/(tabs)/my-jobs');
        break;
      case 'hire-posted':
        router.push('/(tabs)/hire/jobs/posted');
        break;
      case 'hire-applicants':
        router.push('/(tabs)/hire/applicants');
        break;
      case 'hire-saved-contractors':
        router.push('/(tabs)/hire/saved-contractors');
        break;
      case 'hire-invite':
        router.push('/(tabs)/hire/invite');
        break;
      case 'notifications':
        router.push('/(tabs)/notifications');
        break;
      case 'help':
        router.push('/(tabs)/help');
        break;
      case 'settings':
        router.push('/(tabs)/settings');
        break;
      default:
        console.log('Menu item pressed:', itemId);
    }
  };

  const formatJoined = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      const month = d.toLocaleString(undefined, { month: 'long' });
      const year = d.getFullYear();
      return `${month} ${year}`;
    } catch {
      return '—';
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/welcome');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderMenuItem = (item: typeof profileMenuItems[0]) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        {
          backgroundColor: colors.surface,
          borderColor: colors.stroke,
          padding: spacing[4],
          borderRadius: radius.lg,
          borderWidth: 1,
        },
      ]}
      onPress={() => handleMenuItemPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon as any} size={20} color={colors.textSecondary} />
        <View style={[styles.menuItemText, { marginLeft: spacing[3] }]}>
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.semibold,
              fontSize: typography.fontSize.base,
              marginBottom: 2,
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.medium,
              fontSize: typography.fontSize.sm,
            }}
          >
            {item.description}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing[5] }]}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.textPrimary,
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize['2xl'],
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {i18n.t('profile.title')}
          </Text>
          
          <TouchableOpacity style={styles.editButton} onPress={() => router.push('/(tabs)/edit-profile')}>
            <Ionicons name="create-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Header (centered) */}
          <View style={{ paddingHorizontal: spacing[5], paddingTop: spacing[6] }}>
            <View style={{ alignItems: 'center' }}>
              <View style={[styles.profileAvatar, { backgroundColor: colors.card }]}>
                <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.xl }}>
                  {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize['2xl'], marginTop: spacing[3] }}>
                {profile?.name || i18n.t('profile.noName')}
              </Text>
              <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                {profile?.email || '—'}
              </Text>
              <Text style={{ color: colors.textSecondary, marginTop: 2 }}>
                {profile?.location || profile?.city || '—'}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/edit-profile')}
                activeOpacity={0.8}
                style={{
                  marginTop: spacing[4],
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.primary,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Ionicons name="create-outline" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontFamily: typography.fontFamily.semibold }}>{i18n.t('profile.edit')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats: Jobs / Joined (no rating for Hire) */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing[5], marginTop: spacing[6] }}>
            {isHire ? null : (
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Ionicons name="star" size={18} color={colors.primary} />
                <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.bold, marginTop: 6 }}>
                  {typeof profile?.rating === 'number' ? profile?.rating.toFixed(1) : 'New'}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm, marginTop: 2 }}>Rating</Text>
              </View>
            )}
            {isHire ? null : <View style={{ width: 1, backgroundColor: colors.stroke, marginHorizontal: spacing[5] }} />}
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.bold, marginTop: 2 }}>
                {isHire ? (profile?.posted_jobs ?? 0) : (profile?.completed_jobs ?? 0)}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm, marginTop: 2 }}>{isHire ? 'posted jobs' : 'completed jobs'}</Text>
            </View>
            <View style={{ width: 1, backgroundColor: colors.stroke, marginHorizontal: spacing[5] }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.bold }}>
                {formatJoined(profile?.joined_at || profile?.created_at)}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm, marginTop: 2 }}>{i18n.t('profile.joined')}</Text>
            </View>
          </View>

          {/* Account Section */}
          <View style={{ paddingHorizontal: spacing[5], marginTop: spacing[6] }}>
            <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.bold, marginBottom: 10 }}>{i18n.t('settings.account')}</Text>
            <View style={{ gap: 10 }}>
              {isHire ? (
                <>
                  {renderMenuItem({ id: 'edit-profile', title: i18n.t('profile.edit'), icon: 'person-outline', description: i18n.t('profile.edit') } as any)}
                  {renderMenuItem({ id: 'hire-posted', title: i18n.t('profile.myPostedJobs'), icon: 'briefcase-outline', description: i18n.t('profile.myPostedJobs_sub') } as any)}
                  {renderMenuItem({ id: 'hire-applicants', title: i18n.t('profile.applicantsManage'), icon: 'people-outline', description: i18n.t('profile.applicantsManage_sub') } as any)}
                  {renderMenuItem({ id: 'hire-saved-contractors', title: i18n.t('profile.savedContractors'), icon: 'star-outline', description: i18n.t('profile.savedContractors_sub') } as any)}
                  {renderMenuItem({ id: 'hire-invite', title: i18n.t('profile.inviteContractor'), icon: 'send-outline', description: i18n.t('profile.inviteContractor_sub') } as any)}
                  {renderMenuItem({ id: 'notifications', title: i18n.t('profile.notifications'), icon: 'notifications-outline', description: i18n.t('profile.notifications_sub') } as any)}
                  {renderMenuItem({ id: 'help', title: i18n.t('profile.help'), icon: 'help-circle-outline', description: i18n.t('profile.help_sub') } as any)}
                  {renderMenuItem({ id: 'settings', title: i18n.t('profile.settings'), icon: 'settings-outline', description: i18n.t('profile.settings') } as any)}
                </>
              ) : (
                <>
                  {renderMenuItem({ id: 'edit-profile', title: i18n.t('profile.edit'), icon: 'person-outline', description: i18n.t('profile.edit') } as any)}
                  {renderMenuItem({ id: 'my-jobs', title: tShort('nav.myJobs'), icon: 'briefcase-outline', description: 'View your posted jobs and applications' } as any)}
                  {renderMenuItem({ id: 'reviews', title: 'Reviews', icon: 'star-outline', description: 'See reviews from other users' } as any)}
                  {renderMenuItem({ id: 'payment', title: 'Payment Methods', icon: 'card-outline', description: 'Manage your payment options' } as any)}
                  {renderMenuItem({ id: 'notifications', title: i18n.t('profile.notifications'), icon: 'notifications-outline', description: i18n.t('profile.notifications_sub') } as any)}
                  {renderMenuItem({ id: 'invoice', title: 'Invoice Generator', icon: 'document-text-outline', description: 'Create and manage invoices' } as any)}
                  {renderMenuItem({ id: 'help', title: i18n.t('profile.help'), icon: 'help-circle-outline', description: i18n.t('profile.help_sub') } as any)}
                  {renderMenuItem({ id: 'settings', title: i18n.t('profile.settings'), icon: 'settings-outline', description: i18n.t('profile.settings') } as any)}
                </>
              )}
            </View>
          </View>

          {/* Sign Out Button */}
          <View style={[styles.signOutSection, { paddingHorizontal: spacing[5], marginTop: 16 }]}> 
            <PrimaryButton
              title="Sign Out"
              onPress={handleSignOut}
              style={styles.signOutButton}
            />
          </View>

          {/* Bottom padding for tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  headerTitle: {
    // styles applied inline
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    // styles applied inline
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    marginBottom: 4,
  },
  profileEmail: {
    marginBottom: 8,
  },
  profileBadge: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
  },
  menuSection: {
    gap: 12,
    marginBottom: 32,
  },
  menuCard: {
    // styles handled by Card component
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    marginBottom: 2,
  },
  menuItemDescription: {
    lineHeight: 18,
  },
  signOutSection: {
    marginBottom: 24,
  },
  signOutButton: {
    // styles handled by Button component
  },
});
