import React, { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Image, ScrollView, TouchableOpacity, FlatList } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/context/ThemeProvider'
import { supabase } from '../../src/lib/supabase'
import i18n from '../../i18n'
import { useTx } from '../../i18n/tx'
import { InviteBottomSheet } from '../../src/components/contractors/InviteBottomSheet'

export default function ProfileDetails(){
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors, typography } = useTheme()
  const router = useRouter()
  const [p, setP] = useState<any|null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [portfolio, setPortfolio] = useState<string[]>([])
  const [saved, setSaved] = useState<boolean>(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const txServices = useTx('services')

  useEffect(()=>{
    (async()=>{
      try{
        setLoading(true)
        setError(null)
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, location, rating, headline, about, primary_service')
          .eq('id', String(id))
          .single()
        if (error) throw error
        setP(data)
        // Check saved
        const auth = (await supabase.auth.getUser()).data.user
        if (auth?.id) {
          const { data: s } = await supabase.from('saved_contractors').select('contractor_id').eq('user_id', auth.id).eq('contractor_id', String(id)).maybeSingle()
          setSaved(!!s)
        }
        // Load portfolio images
        try{
          const { data: files } = await supabase.storage.from('portfolio').list(`${id}/`, { limit: 30 })
          const urls = (files||[]).map(f=> supabase.storage.from('portfolio').getPublicUrl(`${id}/${f.name}`).data.publicUrl)
          setPortfolio(urls)
        } catch {}
      } catch(e:any){ setError(e?.message||'Failed to load profile') }
      finally{ setLoading(false) }
    })()
  },[id])

  const toggleSave = async () => {
    const { toggleSaved } = await import('../../src/lib/saved')
    const next = await toggleSaved(String(id))
    setSaved(next)
  }

  return (
    <View style={{ flex:1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex:1 }}>
        <View style={{ flexDirection:'row', alignItems:'center', padding: 12 }}>
          <TouchableOpacity onPress={()=>router.back()} style={{ padding:8 }}>
            <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.lg }}>{i18n.t('profile.title') || 'Profile'}</Text>
        </View>
        {loading ? (
          <View style={{ padding:24 }}><ActivityIndicator color={colors.accent} /></View>
        ) : error ? (
          <View style={{ padding:24 }}><Text style={{ color: colors.error }}>{error}</Text></View>
        ) : p ? (
          <ScrollView contentContainerStyle={{ padding:16, paddingBottom: 24 }}>
            {/* Hero */}
            <View style={{ alignItems:'center', marginBottom: 16 }}>
              <View style={{ width: 96, height: 96, borderRadius: 48, overflow:'hidden', backgroundColor:'#0F172A', alignItems:'center', justifyContent:'center' }}>
                {p.avatar_url ? (
                  <Image source={{ uri: p.avatar_url }} style={{ width:'100%', height:'100%' }} />
                ) : (
                  <Ionicons name="person-outline" size={28} color={colors.muted} />
                )}
              </View>
              <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.bold, fontSize: 18, marginTop: 8 }}>{p.full_name || i18n.t('profile.noName') || 'Unnamed'}</Text>
              {!!p.location && <Text style={{ color: colors.muted, marginTop: 2 }}>{p.location}</Text>}
              {typeof p.rating==='number' && (
                <View style={{ flexDirection:'row', alignItems:'center', marginTop: 6 }}>
                  <Ionicons name="star" size={16} color="#FBBF24" />
                  <Text style={{ color: colors.onSurface, marginLeft: 4 }}>{p.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>

            {/* Headline */}
            {!!p.headline && (
              <View style={{ backgroundColor:'#111827', borderWidth:1, borderColor:'#2A3345', borderRadius:16, padding:14, marginBottom: 12 }}>
                <Text style={{ color: colors.muted, marginBottom: 6 }}>{i18n.t('profile.headline')||'Headline'}</Text>
                <Text style={{ color: colors.onSurface }}>{p.headline}</Text>
              </View>
            )}

            {/* About */}
            {!!p.about && (
              <View style={{ backgroundColor:'#111827', borderWidth:1, borderColor:'#2A3345', borderRadius:16, padding:14, marginBottom: 12 }}>
                <Text style={{ color: colors.muted, marginBottom: 6 }}>{i18n.t('profile.about')||'About'}</Text>
                <Text style={{ color: colors.onSurface }}>{p.about}</Text>
              </View>
            )}

            {/* Services chips */}
            {!!p.primary_service && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, marginBottom: 8 }}>{i18n.t('profile.services')||'Services'}</Text>
                <View style={{ flexDirection:'row', flexWrap:'wrap', gap: 8 }}>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth:1, borderColor:'#2A3345' }}>
                    <Text style={{ color: colors.onSurface }}>{txServices(p.primary_service)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Portfolio grid */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, marginBottom: 8 }}>{i18n.t('profile.portfolio')||'Portfolio'}</Text>
              {portfolio.length ? (
                <FlatList
                  data={portfolio}
                  keyExtractor={(u)=>u}
                  numColumns={3}
                  scrollEnabled={false}
                  columnWrapperStyle={{ gap: 6 }}
                  renderItem={({item})=> (
                    <Image source={{ uri: item }} style={{ width: '32%', aspectRatio: 1, borderRadius: 8, backgroundColor:'#0F172A' }} />
                  )}
                />
              ) : (
                <Text style={{ color: colors.muted }}>{i18n.t('profile.noPortfolio')||'No portfolio yet'}</Text>
              )}
            </View>

            {/* Reviews placeholder */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, marginBottom: 8 }}>{i18n.t('profile.reviews')||'Reviews'}</Text>
              <Text style={{ color: colors.muted }}>{i18n.t('profile.noReviews')||'No reviews yet'}</Text>
            </View>

            {/* CTAs */}
            <View style={{ flexDirection:'row', gap:8 }}>
              <TouchableOpacity onPress={()=> setInviteOpen(true)} style={{ flex:1, height: 48, borderRadius: 14, borderWidth:1, borderColor:'#334155', alignItems:'center', justifyContent:'center' }}>
                <Text style={{ color:'#fff' }}>{i18n.t('contractors.invite')||'Invite'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=> router.push('/(tabs)/messages')} style={{ flex:1, height: 48, borderRadius: 14, borderWidth:1, borderColor:'#334155', alignItems:'center', justifyContent:'center' }}>
                <Text style={{ color:'#fff' }}>{i18n.t('profile.message')||'Message'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleSave} style={{ width: 48, height: 48, borderRadius: 14, borderWidth:1, borderColor:'#334155', alignItems:'center', justifyContent:'center' }}>
                <Ionicons name={saved ? 'star' : 'star-outline'} size={20} color={saved ? '#F59E0B' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : null}
      </SafeAreaView>
      <InviteBottomSheet visible={inviteOpen} contractorId={String(id)} onClose={()=> setInviteOpen(false)} />
    </View>
  )
}

