import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../src/context/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

type PaymentMethod = { id: string; brand: string; last4: string };

export default function PaymentMethodsScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const { profile, session } = useAuth();
  const router = useRouter();
  const isHire = (profile?.user_type || session?.user?.user_metadata?.user_type) === 'hirer';

  // Guard: redirect hires back to profile
  useEffect(() => {
    if (isHire) router.replace('/(tabs)/profile');
  }, [isHire]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    // Load from API later; placeholder read from DB if exists
    (async () => {
      try {
        const { supabase } = await import('../../src/lib/supabase');
        const { data } = await supabase.from('payment_methods').select('*');
        setMethods((data as any[])?.map((m) => ({ id: m.id, brand: m.brand, last4: m.last4 })) || []);
      } catch {}
    })();
  }, []);

  const handleAdd = () => {
    Alert.alert('Add Card', 'Payment provider integration will be wired next.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingHorizontal: spacing[4], paddingTop: spacing[4] }]}>      
      {methods.length === 0 ? (
        <Text style={{ color: colors.textMuted }}>No payment methods yet.</Text>
      ) : (
        methods.map((m) => (
          <View key={m.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.stroke, borderRadius: radius.lg }]}>            
            <Ionicons name="card" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.medium }}>
              {m.brand} •••• {m.last4}
            </Text>
          </View>
        ))
      )}
      <TouchableOpacity onPress={handleAdd} style={[styles.add, { borderColor: colors.stroke, borderRadius: radius.lg }]}>        
        <Ionicons name="add" size={20} color={colors.textPrimary} />
        <Text style={{ color: colors.textPrimary, marginLeft: 8 }}>Add payment method</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, padding: 16, marginBottom: 12 },
  add: { borderWidth: 1, padding: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
});


