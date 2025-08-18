import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '../../src/context/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Screen } from '../../src/components/ui/Screen';

type NotificationItem = {
  id: string;
  type: 'job' | 'message' | 'general';
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export default function NotificationsScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [permissionBanner, setPermissionBanner] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const perm = await Notifications.getPermissionsAsync();
        setPermissionBanner(perm.status !== 'granted');
      } catch {}
      // Load initial notifications (replace with API)
      setTimeout(() => {
        setItems([]); // empty state by default
        setLoading(false);
      }, 600);
    })();
  }, []);

  const markAllAsRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const renderEmpty = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
      <Ionicons name="notifications-outline" size={72} color="#94A3B8" style={{ opacity: 0.6 }} />
      <Text style={{ color: '#FFFFFF', fontSize: 18, marginTop: 10 }}>No notifications yet</Text>
      <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginTop: 6, paddingHorizontal: 24 }}>
        You’ll see job invites, bid updates, and messages here.
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      accessibilityState={{ selected: !item.read }}
      style={{
        backgroundColor: item.read ? '#111827' : '#1F2937',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Ionicons
            name={item.type === 'job' ? 'briefcase-outline' : item.type === 'message' ? 'chatbubble-ellipses-outline' : 'notifications-outline'}
            size={18}
            color="#00E6CF"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }} numberOfLines={1}>{item.title}</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 13 }} numberOfLines={2}>{item.body}</Text>
        </View>
        <View style={{ marginLeft: 8, alignItems: 'flex-end' }}>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{item.time}</Text>
          {!item.read && <Text style={{ color: '#00E6CF', fontSize: 20, lineHeight: 20 }}>•</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      {/* Top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '600' }}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead} accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={{ color: '#00E6CF', fontSize: 15 }}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      {/* Permission banner */}
      {permissionBanner && (
        <View style={{ marginHorizontal: 16, marginBottom: 12, borderRadius: 12, backgroundColor: '#111827', padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ color: '#FFFFFF', marginBottom: 8 }}>Enable push notifications to get updates.</Text>
          <TouchableOpacity
            onPress={async () => {
              const { status } = await Notifications.requestPermissionsAsync();
              setPermissionBanner(status !== 'granted');
            }}
            style={{ alignSelf: 'flex-start', backgroundColor: '#00E6CF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Enable</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {loading ? (
          <View style={{ paddingTop: 24 }}>
            {[...Array(4)].map((_, i) => (
              <View key={i} style={{ height: 68, borderRadius: 12, backgroundColor: '#111827', marginBottom: 10 }} />
            ))}
          </View>
        ) : error ? (
          <View style={{ backgroundColor: '#111827', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Text style={{ color: '#FFFFFF', marginBottom: 8 }}>Failed to load notifications.</Text>
            <TouchableOpacity onPress={() => { setError(null); setLoading(true); setTimeout(() => { setItems([]); setLoading(false); }, 500); }} style={{ alignSelf: 'flex-start', backgroundColor: '#00E6CF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          renderEmpty()
        ) : (
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
            onEndReachedThreshold={0.2}
            onEndReached={() => {
              // Load more (placeholder)
              if (items.length < 20) return;
            }}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});


