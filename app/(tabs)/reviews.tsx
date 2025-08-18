import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../src/context/ThemeProvider';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

export default function ReviewsScreen() {
  const { colors, spacing } = useTheme();
  const { user, profile, session } = useAuth();
  const router = useRouter();
  const isHire = (profile?.user_type || session?.user?.user_metadata?.user_type) === 'hirer';
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (isHire) { router.replace('/(tabs)/profile'); return; }
    (async () => {
      try {
        if (!user) return;
        const { supabase } = await import('../../src/lib/supabase');
        const { data } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setReviews(data || []);
      } catch {}
    })();
  }, [user?.id, isHire]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>      
      {reviews.length === 0 ? (
        <View style={{ padding: 24 }}>
          <Text style={{ color: colors.textMuted }}>No reviews yet.</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing[4], paddingVertical: spacing[4], gap: 12 }}
          renderItem={({ item }) => (
            <View style={{ borderWidth: 1, borderColor: colors.stroke, borderRadius: 12, padding: 16, backgroundColor: colors.surface }}>
              <Text style={{ color: colors.textPrimary, marginBottom: 6 }}>{item.comment}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});


