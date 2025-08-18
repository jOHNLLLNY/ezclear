import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, Image, Pressable, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../../src/context/ThemeProvider'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '../../../src/lib/supabase'
import { useAuth } from '../../../src/context/AuthContext'

export default function HireApplicantsScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const { jobId } = useLocalSearchParams<{ jobId: string }>()
  const { user } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { (async () => {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('job_applications')
        .select(`
          id,status,created_at,
          contractor:applicant_id(id,full_name,city,avatar_url,rating,bio,portfolio_urls),
          job:job_id!inner(id,poster_id,hired_contractor_id,title)
        `)
        .eq('job.id', jobId)
        .order('created_at', { ascending: false })
      setData(data || [])
    } catch (e:any) { console.log(e) } finally { setLoading(false) }
  })() }, [jobId])

  const hireApplicant = async ({ applicationId, contractorId, jobId }: any) => {
    try {
      if (!user) return
      // 1) mark application hired
      await supabase.from('job_applications').update({ status: 'hired' }).eq('id', applicationId).neq('status','hired')
      // 2) update job
      await supabase.from('jobs').update({ hired_contractor_id: contractorId, status: 'in_progress' }).eq('id', jobId).is('hired_contractor_id', null)
      // 3) upsert or get thread
      const { data: thread } = await supabase
        .from('threads')
        .upsert({ job_id: jobId, hire_id: user.id, contractor_id: contractorId }, { onConflict: 'job_id' })
        .select()
        .single()
      // 4) notify contractor
      await supabase.from('notifications').insert({ user_id: contractorId, type: 'hired', job_id: jobId, payload: { title:'You were hired', body:'Open chat to discuss details' } })
      Alert.alert('Contractor hired')
      router.replace('/(tabs)/messages')
    } catch (e:any) { Alert.alert('Error', e.message || 'Failed to hire') }
  }

  const openMessage = async (contractorId: string) => {
    try {
      if (!user) return
      const { data: thread } = await supabase
        .from('threads')
        .upsert({ job_id: jobId, hire_id: user.id, contractor_id: contractorId }, { onConflict: 'job_id' })
        .select()
        .single()
      router.push('/(tabs)/messages')
    } catch (e:any) { /* noop */ }
  }

  return (
    <View style={{ flex:1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex:1 }}>
        <FlatList
          data={data}
          keyExtractor={(item, idx) => String(item?.id || idx)}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#2A3345', padding: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={{ uri: item?.contractor?.avatar_url || undefined }} style={{ width:64, height:64, borderRadius:12, resizeMode:'cover', backgroundColor:'#0F172A' }} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: colors.textPrimary }} numberOfLines={2} ellipsizeMode="tail">{item?.contractor?.full_name || 'Applicant'}</Text>
                  <Text style={{ color: colors.textSecondary }}>{item?.contractor?.city || ''}</Text>
                </View>
              </View>
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginTop: 12 }}>
                <Pressable onPress={() => router.push({ pathname: '/(tabs)/profile', params: { contractorId: item?.contractor?.id } })} style={{ minHeight:44, paddingHorizontal:12, borderRadius:12, borderWidth:1, borderColor:'#334155', alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ color: colors.textPrimary }}>View Profile</Text>
                </Pressable>
                <Pressable onPress={() => hireApplicant({ applicationId: item.id, contractorId: item?.contractor?.id, jobId })} style={{ minHeight:44, paddingHorizontal:12, borderRadius:12, backgroundColor: colors.accent, alignItems:'center', justifyContent:'center' }} android_ripple={{ color: '#00000022' }}>
                  <Text style={{ color: '#0B0F1A', fontWeight: '700' }}>Hire</Text>
                </Pressable>
                <Pressable onPress={() => openMessage(item?.contractor?.id)} style={{ minHeight:44, paddingHorizontal:12, borderRadius:12, borderWidth:1, borderColor:'#334155', alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ color: colors.textPrimary }}>Message</Text>
                </Pressable>
              </View>
            </View>
          )}
          contentContainerStyle={{ padding:16, gap:12 }}
        />
      </SafeAreaView>
    </View>
  )
}
