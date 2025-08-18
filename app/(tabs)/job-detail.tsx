/**
 * Job Detail Screen
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeProvider';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/context/AuthContext';
import i18n from '../../i18n';
import { AIEstimate } from '../../src/components/ui/AIEstimate';

export default function JobDetailScreen() {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiEst, setAiEst] = useState<{ low?: number; high?: number; days?: number }|null>(null);

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('jobs')
          .select('id,title,description,city,address,postal_code,budget,status,service_slug,created_at,poster_id,hired_contractor_id')
          .eq('id', String(id))
          .single();
        if (error) throw error;
        setJob(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load job');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJob();
  }, [id]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {loading ? (
          <View style={{ padding: 24 }}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : error ? (
          <View style={{ padding: 24 }}>
            <Text style={{ color: colors.error }}>Error: {error}</Text>
          </View>
        ) : job ? (
          <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
            <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize['2xl'] }}>
              {job.title}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 8 }}>{job.location}</Text>
            <Text style={{ color: colors.onSurface, marginTop: 16, lineHeight: 22 }}>{job.description}</Text>

            <View style={{ height: 16 }} />
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(tabs)/contractors', params: { service: job.service_slug, jobId: job.id } })}
              style={{ height: 48, borderRadius: 14, borderWidth:1, borderColor:'#334155', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}
            >
              <Text style={{ color: colors.textPrimary }}>{i18n.t('home.bannerCta')}</Text>
            </TouchableOpacity>

            <View style={{ height: 8 }} />
            <View style={{ flexDirection:'row', gap:8 }}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/(tabs)/hire/applicants', params: { jobId: job.id } })}
                style={{ height: 48, flex:1, borderRadius: 14, borderWidth:1, borderColor:'#334155', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: colors.textPrimary }}>{i18n.t('jobs.viewApplicants')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={String(job?.status||'').toLowerCase()!=='open' || busy}
                onPress={async () => {
                  try {
                    setBusy(true);
                    await supabase.rpc('close_job', { p_job_id: job.id, p_user: user?.id });
                    setJob((j:any)=> ({ ...j, status:'closed', closed_at: new Date().toISOString() }));
                    Alert.alert(i18n.t('jobs.closedSuccess'));
                  } catch (e:any) { Alert.alert('Error', e.message || 'Failed to close'); } finally { setBusy(false); }
                }}
                style={{ height: 48, flex:1, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#0B0F1A', fontWeight: '700' }}>{i18n.t('jobs.close')}</Text>
              </TouchableOpacity>
            </View>
        <View style={{ height: 16 }} />
        <TouchableOpacity
          onPress={async()=>{
            const { isAiCapped, setAiCapped, includesCapError } = await import('../../src/lib/aiCap')
            if (await isAiCapped()) { Alert.alert('AI', 'Monthly AI limit reached.'); return }
            try {
              const { aiEstimateJob } = await import('../../src/lib/ai')
              const { ensureSession } = await import('../../src/lib/supabase')
              await ensureSession();
              const res = await aiEstimateJob({ title: job.title, description: job.description, city: job.city, service_slug: job.service_slug })
              setAiEst({ low: res?.cost_low, high: res?.cost_high, days: res?.days })
            } catch (e:any) {
              if (includesCapError(e)) { await setAiCapped(); Alert.alert('AI', 'Monthly AI limit reached.') }
              else { Alert.alert(i18n.t('common.aiError'), e?.message||i18n.t('common.failed')) }
            }
          }}
          style={{ height: 48, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#0B0F1A', fontWeight: '700' }}>{i18n.t('common.getEstimateAI')}</Text>
        </TouchableOpacity>
        {aiEst && (
          <View style={{ marginTop: 10 }}>
            <AIEstimate low={aiEst.low} high={aiEst.high} days={aiEst.days} />
          </View>
        )}
              </ScrollView>
            ) : null}
          </SafeAreaView>
        </View>
      );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
});
