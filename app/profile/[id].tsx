import React, { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Image, ScrollView, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/context/ThemeProvider'
import { supabase } from '../../src/lib/supabase'
import i18n from '../../i18n'

export default function ProfileDetails(){
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors, typography } = useTheme()
  const router = useRouter()
  const [p, setP] = useState<any|null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(()=>{
    (async()=>{
      try{
        setLoading(true)
        setError(null)
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, location, rating, skills, bio')
          .eq('id', String(id))
          .single()
        if (error) throw error
        setP(data)
      } catch(e:any){ setError(e?.message||'Failed to load profile') }
      finally{ setLoading(false) }
    })()
  },[id])

  return (
    <View style={{ flex:1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex:1 }}>
        <View style={{ flexDirection:'row', alignItems:'center', padding: 12 }}>
          <TouchableOpacity onPress={()=>router.back()} style={{ padding:8 }}>
            <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.lg }}>{i18n.t('profile.title')}</Text>
        </View>
        {loading ? (
          <View style={{ padding:24 }}><ActivityIndicator color={colors.accent} /></View>
        ) : error ? (
          <View style={{ padding:24 }}><Text style={{ color: colors.error }}>{error}</Text></View>
        ) : p ? (
          <ScrollView contentContainerStyle={{ padding:16 }}>
            <View style={{ alignItems:'center', marginBottom: 16 }}>
              <View style={{ width: 96, height: 96, borderRadius: 48, overflow:'hidden', backgroundColor:'#0F172A', alignItems:'center', justifyContent:'center' }}>
                {p.avatar_url ? (
                  <Image source={{ uri: p.avatar_url }} style={{ width:'100%', height:'100%' }} />
                ) : (
                  <Ionicons name="person-outline" size={28} color={colors.muted} />
                )}
              </View>
              <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.bold, fontSize: 18, marginTop: 8 }}>{p.full_name || i18n.t('profile.noName')}</Text>
              {!!p.location && <Text style={{ color: colors.muted, marginTop: 2 }}>{p.location}</Text>}
              {typeof p.rating==='number' && (
                <View style={{ flexDirection:'row', alignItems:'center', marginTop: 6 }}>
                  <Ionicons name="star" size={16} color="#FBBF24" />
                  <Text style={{ color: colors.onSurface, marginLeft: 4 }}>{p.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
            {!!p.bio && (
              <View style={{ backgroundColor:'#111827', borderWidth:1, borderColor:'#2A3345', borderRadius:16, padding:14 }}>
                <Text style={{ color: colors.muted, marginBottom: 6 }}>{i18n.t('jobs.details')}</Text>
                <Text style={{ color: colors.onSurface }}>{p.bio}</Text>
              </View>
            )}
            {!!(Array.isArray(p.skills) && p.skills.length) && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, marginBottom: 8 }}>Skills</Text>
                <View style={{ flexDirection:'row', flexWrap:'wrap', gap: 8 }}>
                  {p.skills.map((s:string, i:number)=> (
                    <View key={i} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth:1, borderColor:'#2A3345' }}>
                      <Text style={{ color: colors.onSurface }}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </View>
  )
}

