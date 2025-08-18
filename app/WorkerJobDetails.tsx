import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../src/context/ThemeProvider'
import { supabase } from '../src/lib/supabase'
import { useAuth } from '../src/context/AuthContext'
import i18n from '../i18n'
import { LinearGradient } from 'expo-linear-gradient'
import { CATEGORY_GROUPS } from '../src/constants/categories'

function timeAgo(iso?: string): string {
  if (!iso) return i18n.t('jobDetails.postedJustNow')
  const d = new Date(iso)
  const now = new Date()
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (sec < 60) return i18n.t('jobDetails.postedJustNow')
  const min = Math.floor(sec / 60)
  if (min < 60) return i18n.t('jobDetails.postedAgo', { n: min, u: 'm' })
  const h = Math.floor(min / 60)
  if (h < 24) return i18n.t('jobDetails.postedAgo', { n: h, u: 'h' })
  const days = Math.floor(h / 24)
  return i18n.t('jobDetails.postedAgo', { n: days, u: 'd' })
}

function findService(slug?: string): { icon: keyof typeof Ionicons.glyphMap; label: string } {
  if (!slug) return { icon: 'construct-outline', label: i18n.t('jobDetails.generalService') }
  for (const g of CATEGORY_GROUPS) {
    const it = g.items.find(i => i.slug === slug)
    if (it) {
      return { icon: it.icon as any, label: i18n.t(it.label) }
    }
  }
  return { icon: 'construct-outline', label: i18n.t('jobDetails.generalService') }
}

export default function WorkerJobDetails() {
  const { colors, typography, radius, spacing } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { jobId } = useLocalSearchParams<{ jobId: string }>()
  const { user } = useAuth()

  const [job, setJob] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cover, setCover] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [appsCount, setAppsCount] = useState<number>(0)
  const [myApp, setMyApp] = useState<any | null>(null)

  const svc = useMemo(() => findService(job?.service_slug || ''), [job?.service_slug])

  useEffect(() => {
    (async () => {
      if (!jobId) return
      try {
        setLoading(true)
        setError(null)
        // Fetch job with poster join (safe alias)
        const { data: j, error: e } = await supabase
          .from('jobs')
          .select(`
            id, title, description, status, city, address, created_at,
            service_slug, photos,
            user_id, poster_id,
            poster:profiles!jobs_user_id_fkey(id, full_name, avatar_url)
          `)
          .eq('id', String(jobId))
          .single()
        if (e) throw e

        // If poster missing but poster_id exists, try fetch profile
        let poster = j?.poster
        if (!poster && j?.poster_id) {
          const { data: p } = await supabase.from('profiles').select('id,full_name,avatar_url').eq('id', j.poster_id).maybeSingle()
          poster = p || null
        }
        setJob({ ...j, poster })

        // Count applicants and my application
        const authUser = (await supabase.auth.getUser()).data.user
        const [{ count }, { data: mine }] = await Promise.all([
          supabase.from('applications').select('id', { count: 'exact', head: true }).eq('job_id', String(jobId)),
          supabase.from('applications').select('id,status').eq('job_id', String(jobId)).eq('worker_id', authUser?.id || '').maybeSingle(),
        ])
        setAppsCount(count || 0)
        setMyApp(mine || null)
      } catch (err: any) {
        setError(err.message || 'Failed to load job')
      } finally {
        setLoading(false)
      }
    })()
  }, [jobId])

  const disabled = useMemo(() => {
    const closed = String(job?.status || '').toLowerCase() !== 'open'
    return closed || !!myApp || !cover.trim()
  }, [job?.status, myApp, cover])

  const submit = async () => {
    try {
      if (!user?.id) { Alert.alert(i18n.t('common.error'), 'Auth required'); return }
      setSubmitting(true)
      const { error: e } = await supabase.from('applications').insert({
        job_id: String(jobId),
        worker_id: user.id,
        cover_letter: cover.trim(),
        status: 'submitted',
      })
      if (e) throw e
      Alert.alert(i18n.t('jobDetails.applicationSubmitted'))
      setMyApp({ status: 'submitted' })
      setAppsCount((n) => n + 1)
    } catch (e: any) {
      const msg = e?.code === '23505' ? i18n.t('jobDetails.duplicate') : (e?.message || i18n.t('common.failed'))
      Alert.alert(i18n.t('common.error'), msg)
    } finally {
      setSubmitting(false)
    }
  }

  const withdraw = async () => {
    try {
      if (!user?.id) { Alert.alert(i18n.t('common.error'), 'Auth required'); return }
      setSubmitting(true)
      const { error: e } = await supabase
        .from('applications')
        .delete()
        .eq('job_id', String(jobId))
        .eq('worker_id', user.id)
      if (e) throw e
      Alert.alert(i18n.t('jobDetails.withdrawn'))
      setMyApp(null)
      setAppsCount((n)=> Math.max(0, n-1))
    } catch (e:any) {
      Alert.alert(i18n.t('common.error'), e?.message || i18n.t('common.failed'))
    } finally { setSubmitting(false) }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        {loading ? (
          <View style={{ padding: 24 }}><ActivityIndicator color={colors.accent} /></View>
        ) : error ? (
          <View style={{ padding: 24 }}><Text style={{ color: colors.error }}>{error}</Text></View>
        ) : job ? (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={insets.top + 64}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 + insets.bottom }} showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Back" style={{ marginRight: 8 }}>
                  <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
                </TouchableOpacity>
                <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.lg }}>{i18n.t('jobDetails.title')}</Text>
              </View>

              {/* Job title */}
              <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize['2xl'] }}>{job.title}</Text>

              {/* Status + time + city */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 }}>
                <View style={{ backgroundColor: String(job.status).toLowerCase()==='open' ? '#0F2E2B' : '#3C1E1E', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                  <Text style={{ color: String(job.status).toLowerCase()==='open' ? '#00E6CF' : '#F87171', fontSize: 12 }}>
                    {String(job.status).toLowerCase()==='open' ? i18n.t('jobDetails.open') : i18n.t('jobDetails.closed')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="time-outline" size={14} color={colors.muted} />
                  <Text style={{ color: colors.muted, marginLeft: 6, fontSize: 12 }}>{timeAgo(job.created_at)}</Text>
                </View>
              </View>

              {!!job.city && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <Ionicons name="location-outline" size={16} color={colors.muted} />
                  <Text style={{ color: colors.muted, marginLeft: 6 }}>{job.city}</Text>
                </View>
              )}

              {/* Poster card */}
              <View style={{ height: 12 }} />
              <TouchableOpacity onPress={() => {
                  const authorId = job.poster?.id || job.poster_id || job.user_id
                  if (authorId) router.push(`/profile/${authorId}`)
                  else router.push('/(tabs)/profile')
                }} activeOpacity={0.8} style={{ backgroundColor: '#111827', borderWidth: 1, borderColor: '#2A3345', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 48, height: 48, borderRadius: 999, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {job.poster?.avatar_url ? (
                    <Image source={{ uri: job.poster.avatar_url }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Ionicons name="person-outline" size={20} color={colors.muted} />
                  )}
                </View>
                <Text style={{ color: colors.onSurface, marginLeft: 12, fontFamily: typography.fontFamily.medium }}>{job.poster?.full_name || i18n.t('jobDetails.anonymous')}</Text>
              </TouchableOpacity>

              {/* Service */}
              <View style={{ height: 12 }} />
              <View style={{ backgroundColor: '#111827', borderWidth: 1, borderColor: '#2A3345', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Ionicons name={svc.icon} size={16} color={colors.primary} />
                </View>
                <Text style={{ color: colors.onSurface }}>{svc.label}</Text>
              </View>

              {/* Description */}
              {!!job.description && (
                <View style={{ height: 12 }} />
              )}
              {!!job.description && (
                <View style={{ backgroundColor: '#111827', borderWidth: 1, borderColor: '#2A3345', borderRadius: 16, padding: 14 }}>
                  <Text style={{ color: colors.muted, marginBottom: 6 }}>{i18n.t('jobDetails.description')}</Text>
                  <Text style={{ color: colors.onSurface, lineHeight: 20 }}>{job.description}</Text>
                </View>
              )}

              {/* Photos preview */}
              {Array.isArray(job.photos) && job.photos.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                  {job.photos.map((u: string, idx: number) => (
                    <View key={idx} style={{ width: 100, height: 80, borderRadius: 10, backgroundColor: '#111827', borderWidth: 1, borderColor: '#2A3345', overflow: 'hidden', marginRight: 8 }}>
                      {/* @ts-ignore */}
                      <Image source={{ uri: u }} style={{ width: '100%', height: '100%' }} />
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Applicants */}
              <View style={{ height: 12 }} />
              <View style={{ backgroundColor: '#0B1220', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#2A3345', flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="people-outline" size={16} color={colors.primary} />
                <Text style={{ color: colors.onSurface, marginLeft: 8 }}>
                  {appsCount === 0 ? i18n.t('jobDetails.beFirst') : i18n.t('jobDetails.applicantsCount', { n: appsCount })}
                </Text>
              </View>

              {/* Apply */}
              <View style={{ height: 16 }} />
              <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.base }}>{i18n.t('jobDetails.applyForThisJob')}</Text>
              <View style={{ height: 8 }} />
              <View style={{ backgroundColor: '#111827', borderWidth: 1, borderColor: '#2A3345', borderRadius: 16, padding: 12 }}>
                <TextInput
                  placeholder={i18n.t('jobDetails.coverLetterPlaceholder')}
                  placeholderTextColor={colors.textDisabled}
                  style={{ color: colors.onSurface, minHeight: 120, textAlignVertical: 'top' }}
                  value={cover}
                  onChangeText={setCover}
                  multiline
                />
              </View>

              <View style={{ height: 12 }} />
              <TouchableOpacity disabled={disabled || submitting} onPress={submit} activeOpacity={0.85}>
                <LinearGradient colors={[colors.primary, colors.primaryHover]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', opacity: (disabled||submitting) ? 0.5 : 1 }}>
                  {myApp?.status === 'submitted' ? (
                    <Text style={{ color: '#0B0F1A', fontWeight: '700' }}>{i18n.t('jobDetails.applicationSent')}</Text>
                  ) : (
                    <Text style={{ color: '#0B0F1A', fontWeight: '700' }}>{i18n.t('jobDetails.submit')}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              {myApp?.status === 'submitted' && (
                <>
                  <View style={{ height: 10 }} />
                  <TouchableOpacity disabled={submitting} onPress={withdraw} activeOpacity={0.85}
                    style={{ height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth:1, borderColor:'#2A3345' }}>
                    <Text style={{ color: colors.onSurface }}>{i18n.t('jobDetails.withdraw')}</Text>
                  </TouchableOpacity>
                </>
              )}

            </ScrollView>
          </KeyboardAvoidingView>
        ) : null}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({})

