/**
 * Messages Screen
 * List of conversations and chats
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeProvider';
import { AppBar } from '../../src/components/ui/AppBar';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { SurfaceCard, Card } from '../../src/components/ui/Card';
import { SearchBar } from '../../src/components/ui/SearchBar';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import { useAuth } from '../../src/context/AuthContext';
import i18n, { tShort } from '../../i18n';

// Conversations will be loaded from Supabase

export default function MessagesScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const { profile, session } = useAuth();
  const isHire = ((profile as any)?.user_type || (session?.user?.user_metadata as any)?.user_type) === 'hirer';
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [conversations, setConversations] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const { db } = await import('../../src/lib/supabase');
      const { useAuth } = await import('../../src/context/AuthContext');
      // get current user id
      const { user } = (useAuth as any)();
      const userId = user?.id || '';
      const data = await db.getConversations(userId);
      setConversations((data as any[])?.map((c) => ({
        id: c.id,
        name: c.title || 'Conversation',
        lastMessage: c.messages?.[0]?.content ?? 'New conversation',
        timestamp: '',
        unreadCount: 0,
        avatar: null,
        jobTitle: '',
        isOnline: false,
      })) || []);
    } catch (e: any) {
      setError(e.message || 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const handleConversationPress = (conversationId: string) => {
    router.push(`/messages/${conversationId}`);
  };

  const renderConversation = ({ item }: { item: typeof mockConversations[0] }) => (
    <Card variant="elevated" padding="none" style={styles.conversationCard}>
      <TouchableOpacity
        style={[styles.conversationContainer, { padding: spacing[4] }]}
        onPress={() => handleConversationPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.conversationLeft}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Text
              style={[
                styles.avatarText,
                {
                  color: 'white',
                  fontFamily: typography.fontFamily.semibold,
                  fontSize: typography.fontSize.lg,
                },
              ]}
            >
              {item.name.charAt(0)}
            </Text>
            {item.isOnline && (
              <View style={[styles.onlineIndicator, { backgroundColor: colors.secondary }]} />
            )}
          </View>

          {/* Conversation Info */}
          <View style={styles.conversationInfo}>
            <View style={styles.conversationHeader}>
              <Text
                style={[
                  styles.name,
                  {
                    color: colors.textPrimary,
                    fontFamily: typography.fontFamily.semibold,
                    fontSize: typography.fontSize.base,
                  },
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  {
                    color: colors.textMuted,
                    fontFamily: typography.fontFamily.medium,
                    fontSize: typography.fontSize.xs,
                  },
                ]}
              >
                {item.timestamp}
              </Text>
            </View>

            <Text
              style={[
                styles.jobTitle,
                {
                  color: colors.accent,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.sm,
                },
              ]}
              numberOfLines={1}
            >
              {item.jobTitle}
            </Text>

            <Text
              style={[
                styles.lastMessage,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.sm,
                },
              ]}
              numberOfLines={2}
            >
              {item.lastMessage}
            </Text>
          </View>
        </View>

        {/* Unread Badge */}
        {item.unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.accent }]}>
            <Text
              style={[
                styles.unreadText,
                {
                  color: 'white',
                  fontFamily: typography.fontFamily.semibold,
                  fontSize: typography.fontSize.xs,
                },
              ]}
            >
              {item.unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );

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
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize['2xl'],
              },
            ]}
          >
            {tShort('nav.messages')}
          </Text>

          <TouchableOpacity style={styles.searchButton} accessibilityLabel={i18n.t('home.viewAll')}>
            <Ionicons name="search-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Conversations List */}
        <View style={styles.conversationsSection}>
          {conversations.length > 0 ? (
            <FlatList
              data={conversations}
              renderItem={renderConversation}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={[styles.conversationsList, { paddingHorizontal: spacing[4] }]}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          ) : (
            <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 16) }}>
                <EmptyState
                  icon="chatbubble-outline"
                  title={i18n.t('messages.emptyTitle')}
                  description={i18n.t('jobs.emptyHelp')}
                  action={
                    <PrimaryButton
                      title={isHire ? i18n.t('nav.postJob') : i18n.t('home.viewAll')}
                      onPress={() => router.push(isHire ? '/(tabs)/post-job' : '/(tabs)/jobs')}
                    />
                  }
                />
              </View>
            </SafeAreaView>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  headerTitle: {
    // styles applied inline
  },
  searchButton: {
    padding: 8,
  },
  conversationsSection: {
    flex: 1,
  },
  conversationsList: {
    paddingBottom: 100, // Account for bottom tab bar
  },
  conversationCard: {
    // styles handled by Card component
  },
  conversationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conversationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    // styles applied inline
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    // styles applied inline
  },
  jobTitle: {
    marginBottom: 4,
  },
  lastMessage: {
    lineHeight: 18,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    // styles applied inline
  },
});
