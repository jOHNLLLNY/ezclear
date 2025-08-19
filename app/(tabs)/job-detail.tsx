/**
 * Job Detail Screen (Poster View)
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Image, Modal, Pressable, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeProvider';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/context/AuthContext';
import i18n from '../../i18n';
import { AIEstimate } from '../../src/components/ui/AIEstimate';
import { AICard } from '../../src/components/ui/AICard';
import { Expandable } from '../../src/components/ui/Expandable';
import { useTx } from '../../i18n/tx';

function timeAgo(iso?: string): string {
  if (!iso) return i18n.t('job.posted_ago', { n: 0, u: 'm' });
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return i18n.t('job.posted_just_now') || 'Posted Just now';
  if (m < 60) return i18n.t('job.posted_ago', { n: m, u: 'm' });
  const h = Math.floor(m / 60);
  if (h < 24) return i18n.t('job.posted_ago', { n: h, u: 'h' });
  const d = Math.floor(h / 24);
  return i18n.t('job.posted_ago', { n: d, u: 'd' });
}

export default function JobDetailScreen() {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<any | null>(null);
  const [poster, setPoster] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiEst, setAiEst] = useState<{ low?: number; high?: number; days?: number }|null>(null);
  const [aiExplain, setAiExplain] = useState<string[] | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [appCount, setAppCount] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const txServices = useTx('services');
  const [cover, setCover] = useState('');
  const [myApp, setMyApp] = useState<any|null>(null);
  const isPoster = useMemo(() => {
    const uid = user?.id
    return !!uid && (job?.poster_id === uid || job?.user_id === uid)
  }, [user?.id, job?.poster_id, job?.user_id])


  const photos = useMemo(()=> (Array.isArray(job?.photos) ? job?.photos : []), [job]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const j = await supabase
          .from('jobs')
          .select('id,title,description,city,address,postal_code,budget,status,service_slug,created_at,poster_id,photos')
          .eq('id', String(id))
          .single();
        if (j.error) throw j.error;
        setJob(j.data);
        // Poster profile (minimal fields)
        if (j.data?.poster_id) {
          const p = await supabase.from('profiles').select('id,full_name,avatar_url,city').eq('id', j.data.poster_id).single();
          if (!p.error) setPoster(p.data);
        }
        // Applicants count and my application
        const authUser = (await supabase.auth.getUser()).data.user
        const [{ count }, { data: mine }] = await Promise.all([
          supabase.from('applications').select('id', { count: 'exact', head: true }).eq('job_id', String(id)),
          supabase.from('applications').select('id,status').eq('job_id', String(id)).eq('worker_id', authUser?.id || '').maybeSingle(),
        ])
        setAppCount(count || 0)
        setMyApp(mine || null)
      } catch (e: any) {
        setError(e.message || 'Failed to load job');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAll();
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
            <Text style={{ color: colors.error }}>{i18n.t('common.error')}: {error}</Text>
          </View>
        ) : job ? (
          <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
            {/* Title */}
            <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize['2xl'] }}>
              {job.title}
            </Text>
            {/* Status + time + location */}
            <View style={{ flexDirection:'row', alignItems:'center', gap: 10, marginTop: 10 }}>
              <View style={{ paddingHorizontal:10, paddingVertical:4, borderRadius:999, backgroundColor: String(job.status).toLowerCase()==='open' ? '#063d36' : '#2E1B4B' }}>
                <Text style={{ color: String(job.status).toLowerCase()==='open' ? '#00E6CF' : '#C084FC', fontSize: 12 }}>
                  {String(job.status).toLowerCase()==='open' ? i18n.t('job.open') : i18n.t('job.completed')}
                </Text>
              </View>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{i18n.t('job.posted')}{' '}{timeAgo(job.created_at)}</Text>
            </View>
            {!!(job.city || job.address) && (
              <Text style={{ color: colors.muted, marginTop: 6 }} numberOfLines={2}> {job.city}{job.address ? ` • ${job.address}` : ''}</Text>
            )}

            {/* Poster card */}
            <View style={{ marginTop: 16, backgroundColor:'#111827', borderRadius: 16, borderWidth:1, borderColor:'#2A3345', padding: 12, flexDirection:'row', alignItems:'center' }}>
              <Image source={{ uri: poster?.avatar_url || undefined }} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor:'#0F172A' }} />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold }}>{poster?.full_name || i18n.t('job.poster')}</Text>
                {!!poster?.city && <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{poster?.city}</Text>}
              </View>
            </View>

            {/* Service card */}
            <View style={{ marginTop: 10, backgroundColor:'#111827', borderRadius: 16, borderWidth:1, borderColor:'#2A3345', padding: 12 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{i18n.t('job.service')}</Text>
              <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, marginTop: 4 }}>{job.service_slug ? txServices(job.service_slug) : i18n.t('job.generalService')}</Text>
            </View>

            {/* Description with collapse */}
            <View style={{ marginTop: 10, backgroundColor:'#111827', borderRadius: 16, borderWidth:1, borderColor:'#2A3345', padding: 12 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{i18n.t('job.description')}</Text>
              <Text style={{ color: colors.textPrimary, marginTop: 6, lineHeight: 22 }}>{job.description}</Text>
            </View>

            {/* Attachments/photos */}
            {photos?.length ? (
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>{i18n.t('job.attachments')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {photos.map((uri: string, idx: number) => (
                    <Pressable key={idx} onPress={()=> setPhotoIndex(idx)} style={{ marginRight: 10 }}>
                      <Image source={{ uri }} style={{ width: 120, height: 90, borderRadius: 12, backgroundColor:'#0F172A' }} />
                    </Pressable>
                  ))}
                </ScrollView>
                <Modal visible={photoIndex!==null} transparent animationType="fade" onRequestClose={()=> setPhotoIndex(null)}>
                  <Pressable onPress={()=> setPhotoIndex(null)} style={{ flex:1, backgroundColor:'#000C' }}>
                    {photoIndex!==null && (
                      <Image source={{ uri: photos[photoIndex] }} style={{ width:'100%', height:'100%', resizeMode:'contain' }} />
                    )}
                  </Pressable>
                </Modal>
              </View>
            ) : null}

            {/* Applicants banner */}
            <View style={{ marginTop: 12 }}>
              <View style={{ backgroundColor:'#0F172A', borderRadius: 14, padding: 12, borderWidth:1, borderColor:'#2A3345', flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
                <Text style={{ color: colors.textPrimary }}>{i18n.t('job.applicants', { count: appCount })}</Text>
                <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/hire/applicants', params: { jobId: job.id } })} style={{ paddingHorizontal:12, paddingVertical:8, borderWidth:1, borderColor:'#334155', borderRadius:12 }}>
                  <Text style={{ color: colors.textPrimary }}>{i18n.t('job.viewApplicants')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions */}
            <View style={{ height: 16 }} />
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(tabs)/contractors', params: { service: job.service_slug, jobId: job.id } })}
              style={{ height: 48, borderRadius: 14, borderWidth:1, borderColor:'#334155', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}
            >
              <Text style={{ color: colors.textPrimary }}>{i18n.t('job.searchContractors')}</Text>
            </TouchableOpacity>

            <View style={{ flexDirection:'row', gap:8 }}>
              {isPoster && (
                <TouchableOpacity
                  disabled={busy || String(job?.status||'').toLowerCase()!=='open'}
                  onPress={async () => {
                    try {
                      setBusy(true);
                      const { error } = await supabase
                        .from('jobs')
                        .update({ status: 'completed', closed_at: new Date().toISOString() })
                        .eq('id', job.id)
                        .eq('poster_id', user?.id);
                      if (error) throw error;
                      Alert.alert(i18n.t('toast.jobMovedToCompleted'));
                      router.replace('/(tabs)/my-jobs');
                    } catch (e:any) {
                      Alert.alert(i18n.t('common.error'), e?.message || 'Failed to close');
                    } finally { setBusy(false); }
                  }}
                  style={{ height: 48, flex:1, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: '#0B0F1A', fontWeight: '700' }}>{i18n.t('job.close')}</Text>
                </TouchableOpacity>
              )}


              </View>

              {/* Worker Apply/Withdraw + AI pitch */}
              <View style={{ height: 16 }} />
              <View style={{ backgroundColor:'#0F172A', borderWidth:1, borderColor:'#2A3345', borderRadius:16, padding:12 }}>
                <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold }}>{i18n.t('job.applyTitle') || 'Apply to this job'}</Text>
                {!myApp ? (
                  <>
                    <View style={{ marginTop:8, backgroundColor:'#111827', borderWidth:1, borderColor:'#2A3345', borderRadius:12, padding:10 }}>
                      <TextInput
                        placeholder={i18n.t('job.coverPlaceholder') || 'Write a short message...'}
                        placeholderTextColor={colors.textDisabled}
                        style={{ color: colors.onSurface, minHeight: 100, textAlignVertical:'top' }}
                        value={cover}
                        onChangeText={setCover}
                        multiline
                      />
                    </View>
                    <View style={{ flexDirection:'row', gap:8, marginTop:10 }}>
                      <TouchableOpacity
                        onPress={async()=>{
                          try {
                            if (!user?.id) { Alert.alert(i18n.t('common.error'), 'Auth required'); return }
                            const { error: e } = await supabase.from('applications').insert({ job_id: String(id), worker_id: user.id, cover_letter: cover.trim(), status:'submitted' })
                            if (e) throw e
                            Alert.alert(i18n.t('jobDetails.applicationSubmitted') || 'Application submitted')
                            setMyApp({ status:'submitted' })
                            setAppCount(n=> n+1)
                          } catch (e:any) { Alert.alert(i18n.t('common.error'), e?.message||i18n.t('common.failed')) }
                        }}
                        disabled={!cover.trim() || String(job?.status||'').toLowerCase()!=='open'}
                        style={{ flex:1, height:44, borderRadius:12, backgroundColor: colors.accent, alignItems:'center', justifyContent:'center', opacity: (!cover.trim() || String(job?.status||'').toLowerCase()!=='open')?0.6:1 }}>
                        <Text style={{ color:'#0B0F1A', fontWeight:'700' }}>{i18n.t('jobs.apply') || 'Apply'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={async()=>{
                          const { isAiCapped, setAiCapped, includesCapError } = await import('../../src/lib/aiCap')
                          if (await isAiCapped()) { Alert.alert('AI', 'Monthly AI limit reached.'); return }
                          try {
                            const { aiSuggestReply } = await import('../../src/lib/ai')
                            const { ensureSession } = await import('../../src/lib/supabase')
                            await ensureSession();
                            const history = [
                              { role:'system', content:'You are a professional tradesperson writing a short cover letter.'},
                              { role:'user', content:`Job: ${job.title}\nDescription: ${job.description}\nService: ${job.service_slug}`}
                            ]
                            const res = await aiSuggestReply(history as any, i18n.language)
                            if (res?.reply) setCover(res.reply)
                          } catch (e:any) {
                            if (includesCapError(e)) { await setAiCapped(); Alert.alert('AI', 'Monthly AI limit reached.') }
                          }
                        }}
                        style={{ height:44, paddingHorizontal:12, borderRadius:12, borderWidth:1, borderColor:'#334155', alignItems:'center', justifyContent:'center' }}>
                        <Text style={{ color: colors.textPrimary }}>{i18n.t('ai.explain') || 'Suggest'}</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
                    <TouchableOpacity
                      onPress={async()=>{
                        try{
                          if (!user?.id) { Alert.alert(i18n.t('common.error'), 'Auth required'); return }
                          const { error } = await supabase.from('applications').delete().eq('job_id', String(id)).eq('worker_id', user.id)
                          if (error) throw error
                          Alert.alert(i18n.t('jobDetails.withdrawn') || 'Application withdrawn')
                          setMyApp(null)
                          setAppCount(n=> Math.max(0, n-1))
                        } catch (e:any) { Alert.alert(i18n.t('common.error'), e?.message || i18n.t('common.failed')) }
                      }}
                      style={{ flex:1, height:44, borderRadius:12, borderWidth:1, borderColor:'#334155', alignItems:'center', justifyContent:'center' }}>
                      <Text style={{ color: colors.textPrimary }}>{i18n.t('jobDetails.withdraw') || 'Withdraw'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>


            {/* AI estimate */}
            <View style={{ height: 16 }} />
            <TouchableOpacity
              onPress={async()=>{
                const { isAiCapped, setAiCapped, includesCapError } = await import('../../src/lib/aiCap')
                if (await isAiCapped()) { Alert.alert('AI', 'Monthly AI limit reached.'); return }
                try {
                  const { aiEstimateJob, aiExplainEstimate } = await import('../../src/lib/ai')
                  const { ensureSession } = await import('../../src/lib/supabase')
                  await ensureSession();
                  const res = await aiEstimateJob({ title: job.title, description: job.description, city: job.city, service_slug: job.service_slug })
                  setAiEst({ low: res?.cost_low, high: res?.cost_high, days: res?.days })
                  setAiExplain(null)
                  try { const ex = await aiExplainEstimate({ title: job.title, description: job.description, city: job.city, service_slug: job.service_slug }); setAiExplain((ex?.bullets||[]).slice(0,5)) } catch {}
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
                {!!(aiExplain?.length) ? (
                  <AICard title={i18n.t('ai.why_estimate')}>
                    <Text style={{ color:'#E5E7EB', marginBottom:8, opacity:0.9 }}>{i18n.t('ai.tldr')}</Text>
                    <View>
                      {aiExplain.map((b,idx)=> (<Text key={idx} style={{ color:'#E5E7EB', marginBottom:6 }}>• {b}</Text>))}
                    </View>
                  </AICard>
                ) : null}
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
