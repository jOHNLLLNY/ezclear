import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Animated, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeProvider';
import { useAuth } from '../../src/context/AuthContext';
import { JobCard } from '../../src/components/ui/JobCard';
import { Screen } from '../../src/components/ui/Screen';
import { supabase } from '../../src/lib/supabase';
import { useRouter } from 'expo-router';
import i18n, { tShort } from '../../i18n';

export default function MyJobsScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Role-based tabs
  const isHire = (profile as any)?.user_type === 'hirer' || (profile as any)?.user_type === 'hire';
  const tabsHire = [i18n.t('jobs.active'), i18n.t('jobs.applicants'), i18n.t('jobs.completed')] as const;
  const [activeTab, setActiveTab] = useState<typeof tabsHire[number]>(i18n.t('jobs.active'));
  const [status, setStatus] = useState<'active' | 'applications' | 'declined'>('active');
  const [loading, setLoading] = useState(false);
  const indicator = useRef(new Animated.Value(0)).current;

  const load = async () => {
    if (!user) return;
    try {
      setLoading(true);
      if ((profile as any)?.user_type === 'worker') {
        // Worker: applications + join jobs (unchanged)
        const { data, error } = await supabase
          .from('job_applications')
          .select('id,status,created_at, job:job_id(id,title,description,location,status,budget,service_type,lat,lng)')
          .eq('applicant_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        const flattened = (data || []).map((a: any) => ({
          ...(a.job || {}),
          status: a.status || a.job?.status,
          application_id: a.id,
          created_at: a.created_at,
        }));
        setJobs(flattened);
      } else {
        // Hirer (Hire): separate fetches
        const activePromise = supabase
          .from('jobs')
          .select('id,title,location,city,status,created_at')
          .eq('poster_id', user.id)
          .in('status', ['open', 'in_progress', 'active', 'assigned'])
          .order('created_at', { ascending: false });

        const completedPromise = supabase
          .from('jobs')
          .select('id,title,location,city,status,completed_at')
          .eq('poster_id', user.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false });

        const applicantsPromise = supabase
          .from('job_applications')
          .select(`
            id, status, created_at,
            job:job_id(id, title, user_id),
            contractor:applicant_id(id)
          `)
          .eq('job.user_id', user.id)
          .order('created_at', { ascending: false });

        const [{ data: activeData }, { data: completedData }, { data: applicantsData }] = await Promise.all([
          activePromise, completedPromise, applicantsPromise,
        ]);

        setJobs([
          { __kind: 'active', rows: activeData || [] },
          { __kind: 'completed', rows: completedData || [] },
          { __kind: 'applicants', rows: applicantsData || [] },
        ] as any);
      }
    } catch (e) {
      console.log('MyJobs load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id, (profile as any)?.user_type]);

  const filtered = useMemo(() => {
    const s = String(status);
    const norm = (v: any) => String(v || '').toLowerCase();
    if (s === 'active') return jobs.filter((j: any) => ['open','assigned','active','accepted','hired'].includes(norm(j.status)));
    if (s === 'applications') return jobs.filter((j: any) => ['applied','pending','review'].includes(norm(j.status)));
    return jobs.filter((j: any) => ['declined','rejected'].includes(norm(j.status)));
  }, [jobs, status]);

  const onTab = (index: number) => {
    Animated.timing(indicator, { toValue: index, duration: 220, useNativeDriver: false }).start();
  };

  const segment = [
    { id: 'active', label: tShort('nav.myJobs') },
    { id: 'applications', label: 'Applications' },
    { id: 'declined', label: 'Declined' },
  ] as const;

  const activeIndex = segment.findIndex(s => s.id === status);
  const indicatorLeft = indicator.interpolate({ inputRange: [0,1,2], outputRange: ['0%','33.33%','66.66%'] });

  return (
    <Screen>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: 12 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 22, fontFamily: typography.fontFamily.semibold }}>{tShort('nav.myJobs')}</Text>
      </View>

      {/* Segmented control */}
      {isHire ? (
        <View style={{ paddingHorizontal:16 }}>
          <View style={{ flexDirection:'row', marginBottom:12 }}>
            {tabsHire.map((t) => (
              <Pressable
                key={t}
                onPress={() => setActiveTab(t)}
                style={({ pressed }) => ({
                  flex:1,
                  height:40,
                  borderRadius:12,
                  justifyContent:'center',
                  alignItems:'center',
                  marginHorizontal: 4,
                  backgroundColor: activeTab===t ? '#6D5EF1' : 'rgba(255,255,255,0.06)',
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text style={{ color:'#fff', fontWeight:'600' }}>{t}</Text>
              </Pressable>
            ))}
          </View>
      {/* Hire lists */}
      {isHire && (
        <View>
          {activeTab === 'Active' && (
            <FlatList
              data={(jobs.find((b: any) => b.__kind === 'active')?.rows) || []}
              keyExtractor={(it: any) => it.id}
              contentContainerStyle={{ padding:16, gap:12 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push({ pathname: '/(tabs)/job-detail', params: { id: item.id } })}
                  style={{ width:'100%', backgroundColor:'#111827', borderRadius:12, padding:12, borderWidth:1, borderColor:'#2A3345' }}>
                  <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold }} numberOfLines={2}>{item.title}</Text>
                  <Text style={{ color: colors.textSecondary, marginTop:4 }}>{item.city || item.location || ''}</Text>
                  <View style={{ marginTop:8, alignSelf:'flex-start', paddingHorizontal:10, paddingVertical:6, borderRadius:999, backgroundColor:'rgba(255,255,255,0.08)' }}>
                    <Text style={{ color:'#fff', fontSize:12 }}>{item.status}</Text>
                  </View>
                  <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:12 }}>
                    <Pressable onPress={() => router.push({ pathname: '/(tabs)/hire/applicants', params: { jobId: item.id } })} style={{ minHeight:44, paddingHorizontal:12, borderRadius:12, borderWidth:1, borderColor:'#334155', alignItems:'center', justifyContent:'center' }}>
                      <Text style={{ color: colors.textPrimary }}>{i18n.t('jobs.viewApplicants')}</Text>
                    </Pressable>
                    <Pressable
                      disabled={String(item.status||'').toLowerCase()!=='open' || busyId===item.id}
                      onPress={async()=>{
                        try {
                          setBusyId(item.id);
                          await supabase.rpc('close_job', { p_job_id: item.id, p_user: user?.id });
                          // optimistic: update local item status
                          setJobs(prev => prev.map((j:any)=> j.id===item.id ? { ...j, status:'closed' } : j));
                        } catch (e) { console.log('close error', e); } finally { setBusyId(null); }
                      }}
                      style={{ opacity:(String(item.status||'').toLowerCase()!=='open'||busyId===item.id)?0.6:1, minHeight:44, paddingHorizontal:12, borderRadius:12, backgroundColor: colors.accent, alignItems:'center', justifyContent:'center' }}>
                      <Text style={{ color: '#0B0F1A', fontWeight: '700' }}>{i18n.t('jobs.close')}</Text>
                    </Pressable>
                  </View>
                </Pressable>
              )}
            />
          )}

          {activeTab === 'Completed' && (
            <FlatList
              data={(jobs.find((b: any) => b.__kind === 'completed')?.rows) || []}
              keyExtractor={(it: any) => it.id}
              contentContainerStyle={{ padding:16, gap:12 }}
              renderItem={({ item }) => (
                <Pressable onPress={() => router.push({ pathname: '/(tabs)/job-detail', params: { id: item.id } })} style={{ width:'100%', backgroundColor:'#111827', borderRadius:12, padding:12, borderWidth:1, borderColor:'#2A3345' }}>
                  <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold }} numberOfLines={2}>{item.title}</Text>
                  <Text style={{ color: colors.textSecondary, marginTop:4 }}>{item.city || item.location || ''}</Text>
                  <View style={{ marginTop:8, alignSelf:'flex-start', paddingHorizontal:10, paddingVertical:6, borderRadius:999, backgroundColor:'rgba(255,255,255,0.08)' }}>
                    <Text style={{ color:'#fff', fontSize:12 }}>{item.status}</Text>
                  </View>
                  <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:12 }}>
                    <Pressable onPress={() => router.push({ pathname: '/(tabs)/hire/applicants', params: { jobId: item.id } })} style={{ minHeight:44, paddingHorizontal:12, borderRadius:12, borderWidth:1, borderColor:'#334155', alignItems:'center', justifyContent:'center' }}>
                      <Text style={{ color: colors.textPrimary }}>View Applicants</Text>
                    </Pressable>
                  </View>
                </Pressable>
              )}
            />
          )}

          {activeTab === 'Applicants' && (
            <FlatList
              data={(jobs.find((b: any) => b.__kind === 'applicants')?.rows) || []}
              keyExtractor={(it: any) => it.id}
              contentContainerStyle={{ padding:16, gap:12 }}
              renderItem={({ item }) => (
                <View style={{ padding:16, borderRadius:12, backgroundColor:'rgba(255,255,255,0.06)' }}>
                  <View style={{ flexDirection:'row', gap:12 }}>
                    <Image source={{ uri: item?.contractor?.avatar_url || undefined }} style={{ width:56, height:56, borderRadius:12 }} />
                    <View style={{ flex:1 }}>
                      <Text style={{ color:'#fff', fontWeight:'700' }}>{item?.contractor?.full_name || 'Applicant'}</Text>
                      <Text numberOfLines={1} style={{ color:'#fff', opacity:0.8 }}>{item?.job?.title || ''}</Text>
                      <Text style={{ color:'#fff', opacity:0.7, marginTop:4 }}>{item?.status}</Text>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}
          {/* old inline tabs replaced by segmented row above */}
        </View>
      ) : (
        <View style={{ paddingHorizontal: spacing[4], marginBottom: 12 }}>
          <View accessibilityRole="tablist" style={{ backgroundColor: '#0F172A', borderRadius: 16, padding: 4, position: 'relative' }}>
            <Animated.View style={{ position: 'absolute', top: 4, bottom: 4, width: '33.33%', left: indicatorLeft, backgroundColor: colors.accent, borderRadius: 14 }} />
            <View style={{ flexDirection: 'row' }}>
              {segment.map((s, idx) => {
                const selected = status === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    onPress={() => { setStatus(s.id); onTab(idx); }}
                    style={{ flex: 1, paddingVertical: 10, alignItems: 'center' }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={{ color: selected ? '#0B0F1A' : '#FFFFFF', fontFamily: typography.fontFamily.medium }}>{s.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* Section header with counter (workers only) */}
      {!isHire && (
        <View style={{ paddingHorizontal: spacing[4], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.medium, fontSize: 16 }}>
            {segment[activeIndex]?.label}
          </Text>
          <View style={{ backgroundColor: '#111827', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{`${filtered.length} jobs`}</Text>
          </View>
        </View>
      )}

      {/* List / states (workers only) */}
      {!isHire && (
        loading ? (
          <View style={{ paddingHorizontal: spacing[4] }}>
            <View style={[styles.skeleton, { backgroundColor: colors.surface }]} />
            <View style={{ height: 12 }} />
            <View style={[styles.skeleton, { backgroundColor: colors.surface }]} />
            <View style={{ height: 12 }} />
            <View style={[styles.skeleton, { backgroundColor: colors.surface }]} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ paddingHorizontal: spacing[4] }}>
            <View style={{ backgroundColor: '#111827', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2A3345', alignItems: 'center' }}>
              <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.medium, fontSize: 16, textAlign: 'center' }}>
                {status === 'active' ? 'No jobs yet' : status === 'applications' ? 'No applications yet' : 'No declined jobs'}
              </Text>
              <Text style={{ color: '#FFFFFF', marginTop: 6, textAlign: 'center' }}>
                {status === 'active' ? 'Post or find a job to get started.' : status === 'applications' ? 'Apply to jobs to see them here.' : 'Good news – nothing declined.'}
              </Text>
              {status !== 'declined' && (
                <TouchableOpacity
                  onPress={() => { isHire ? router.push('/(tabs)/post-job') : router.push('/(tabs)/jobs') }}
                  activeOpacity={0.8}
                  style={{ marginTop: 14, height: 44, borderRadius: 14, borderWidth: 1, borderColor: '#334155', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}
                  accessibilityRole="button"
                  accessibilityLabel={isHire ? 'Post Job' : 'Find Jobs'}
                >
                  <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.medium }}>{isHire ? 'Post Job' : 'Find Jobs'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <JobCard job={{
                id: item.id,
                title: item.title,
                description: item.description,
                location: item.location,
                budget: item.budget,
                timeAgo: '',
                status: item.status,
                service_type: item.service_type,
              }} />
            )}
            contentContainerStyle={{ paddingHorizontal: spacing[4], paddingVertical: spacing[4], gap: 12, paddingBottom: 24 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load().finally(() => setRefreshing(false)); }} />}
            onEndReachedThreshold={0.5}
            contentInsetAdjustmentBehavior="automatic"
          />
        )
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skeleton: { height: 120, borderRadius: 16 },
});
