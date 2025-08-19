import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Pressable, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/context/ThemeProvider'
import { supabase } from '../../src/lib/supabase'
import i18n from '../../i18n'
import { AIBadge } from '../../src/components/ui/AIBadge'
import { AICard } from '../../src/components/ui/AICard'

// Simple contractor card
function ContractorCard({ item, onPress }: { item: any; onPress: () => void }) {
  const { colors, typography } = useTheme()
  const skills: string[] = Array.isArray(item.skills) ? item.skills : []
  return (
    <Pressable onPress={onPress} android_ripple={{ color: '#00000022' }} style={{ backgroundColor: '#101826', borderRadius: 16, borderWidth: 1, borderColor: '#2A3345', padding: 12, flexDirection: 'row', alignItems: 'center' }}>
      <Image source={{ uri: item.avatar_url || undefined }} style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#0F172A' }} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ color: 'white', fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.base }} numberOfLines={1}>
          {item.full_name || 'Unnamed'}
        </Text>
        {!!item.location && (
          <Text style={{ color: '#9CA3AF', marginTop: 2 }} numberOfLines={1}>{item.location}</Text>
        )}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {skills.slice(0, 2).map((s, idx) => (
            <View key={idx} style={{ borderWidth: 1, borderColor: '#2A3345', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8 }}>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{s}</Text>
            </View>
          ))}
        </View>
      </View>
      {typeof item.rating === 'number' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
          <Ionicons name="star" size={16} color="#FBBF24" />
          <Text style={{ color: 'white', marginLeft: 4 }}>{item.rating.toFixed(1)}</Text>
        </View>
      )}
    </Pressable>
  )
}

export default function ContractorsListScreen() {
  const { colors, spacing, typography } = useTheme()
  const router = useRouter()
  const params = useLocalSearchParams<{ service?: string; jobId?: string }>()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [aiExplain, setAiExplain] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const filter = useMemo(() => (typeof params.service === 'string' ? params.service : undefined), [params.service])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        // Try service_slugs on profiles; fallback to contractor_services join; final fallback to skills
        let rows: any[] | null = null
        let error: any = null
        try {
          const base = supabase.from('public_contractors').select('id, full_name, avatar_url, location, rating, services')
          const q = filter ? (base.contains('services', [filter]) as any) : base
          const r = await q.order('rating', { ascending: false })
          rows = r.data || null; error = r.error
        } catch {}
        if (!rows && !error) {
          try {
            const r2 = await supabase
              .from('profiles')
              .select(`
                id, full_name, avatar_url, location, rating,
                contractor_services:contractor_services!inner(service_slug)
              `)
              .eq('user_type','worker')
              .maybeSingle()
            // If schema supports join, re-run without maybeSingle and with filter
          } catch {}
        }
        if (!rows) {
          const base = supabase.from('public_contractors').select('id, full_name, avatar_url, location, rating, services')
          const q = filter ? (base.contains('services', [filter]) as any) : base
          const r = await q.order('rating', { ascending: false })
          rows = r.data || []
          error = r.error
        }
        if (!error && isMounted) setData(rows || [])
        if (!error && isMounted) setData(rows || [])
      } catch (e) {
        console.log('load contractors error', e)
        if (isMounted) setData([])
      } finally {
        if (isMounted) setLoading(false)
      }
    })()
    return () => { isMounted = false }
  }, [filter])

  const renderItem = ({ item }: { item: any }) => (
    <ContractorCard item={item} onPress={() => router.push(`/(tabs)/profile`)} />
  )

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.xl }}>
              {i18n.t('contractors.title')}
            </Text>
            {!!filter && (
              <View style={{ borderWidth: 1, borderColor: '#2A3345', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{i18n.t('contractors.filteredBy')}: {i18n.t(`services.${filter}`) || filter}</Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection:'row', gap:8, marginTop:10 }}>
            <Pressable
              onPress={async()=>{
                try {
                  const { isAiCapped, setAiCapped, includesCapError } = await import('../../src/lib/aiCap')
                  if (await isAiCapped()) { Alert.alert('AI', 'Monthly AI limit reached.'); return }
                  if (!data?.length) return;
                  const jobId = typeof params.jobId==='string' ? params.jobId : undefined
                  if (!jobId) { return; }
                  const { aiMatchContractors } = await import('../../src/lib/ai')
                  const { ensureSession } = await import('../../src/lib/supabase')
                  await ensureSession();
                  const ranked = await aiMatchContractors(jobId)
                  const byId = new Map(ranked.map(r=>[r.contractor_id, r.score]))
                  setData(prev => [...prev].sort((a:any,b:any)=> (byId.get(a.id)||0) > (byId.get(b.id)||0) ? -1 : 1))
                } catch(e:any) {
                  if (includesCapError(e)) { const { setAiCapped } = await import('../../src/lib/aiCap'); await setAiCapped(); Alert.alert('AI', 'Monthly AI limit reached.') }
                }
              }}
              style={{ borderWidth:1, borderColor:'#334155', borderRadius:999, paddingHorizontal:12, paddingVertical:6 }}
            >
              <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                <AIBadge label={i18n.t('contractors.aiSort')} />
              </View>
            </Pressable>
            <Pressable
              onPress={async()=>{
                try {
                  const { isAiCapped, setAiCapped, includesCapError } = await import('../../src/lib/aiCap')
                  if (await isAiCapped()) { Alert.alert('AI', 'Monthly AI limit reached.'); return }
                  if (!data?.length) return;
                  const jobId = typeof params.jobId==='string' ? params.jobId : undefined
                  if (!jobId) { return; }
                  setAiLoading(true)
                  setAiExplain(null)
                  const { aiExplainRanking } = await import('../../src/lib/ai')
                  const { ensureSession } = await import('../../src/lib/supabase')
                  await ensureSession();
                  const payload = { jobId, contractors: data.slice(0,5).map((c:any)=> ({ id: c.id, score: Number(c.score||0), features: { rating:c.rating, services:c.services||[], location:c.location } })) }
                  const res = await aiExplainRanking(payload)
                  setAiExplain((res?.explanations||'').slice(0,1200))
                } catch(e:any) {
                  if (includesCapError(e)) { const { setAiCapped } = await import('../../src/lib/aiCap'); await setAiCapped(); Alert.alert('AI', 'Monthly AI limit reached.') }
                } finally { setAiLoading(false) }
              }}
              style={{ borderWidth:1, borderColor:'#334155', borderRadius:999, paddingHorizontal:12, paddingVertical:6 }}
            >
              <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                <AIBadge label={i18n.t('ai.explain_ranking')} />
              </View>
            </Pressable>
          </View>
        </View>

        {aiLoading && (
          <View style={{ paddingHorizontal: spacing[4], paddingBottom: 4 }}>
            <AICard title={i18n.t('ai.explain_ranking')}>
              <Text style={{ color:'#E5E7EB' }}>{i18n.t('ai.loading')}</Text>
            </AICard>
          </View>
        )}
        {!!aiExplain && !aiLoading && (
          <View style={{ paddingHorizontal: spacing[4], paddingBottom: 4 }}>
            <AICard title={i18n.t('ai.explain_ranking')}>
              <Text style={{ color:'#E5E7EB', marginBottom:8, opacity:0.9 }}>{i18n.t('ai.tldr')}</Text>
              <Text style={{ color:'#E5E7EB' }}>{aiExplain}</Text>
            </AICard>
          </View>
        )}

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: spacing[4], paddingBottom: spacing[6], gap: 12 }}
          />
        )}
      </SafeAreaView>
    </View>
  )
}

