import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '../../../../src/context/ThemeProvider'
import { useAuth } from '../../../../src/context/AuthContext'
import { useRouter } from 'expo-router'

export default function HirePostedJobsScreen() {
  const { colors, spacing, typography, radius } = useTheme()
  const { profile, session } = useAuth()
  const router = useRouter()
  const [active, setActive] = useState(0)
  const [closed, setClosed] = useState(0)

  useEffect(() => {
    (async () => {
      try {
        const { supabase } = await import('../../../../src/lib/supabase')
        const { data } = await supabase.from('jobs').select('id,status').eq('user_id', (profile?.id || session?.user?.id))
        const a = (data || []).filter((j: any) => ['open','active','assigned'].includes(String(j?.status ?? '').toLowerCase())).length
        const c = (data || []).filter((j: any) => ['closed','completed','cancelled','canceled'].includes(String(j?.status ?? '').toLowerCase())).length
        setActive(a); setClosed(c)
      } catch {}
    })()
  }, [profile?.id, session?.user?.id])

  return (
    <View style={{ flex:1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, fontSize: 18, marginBottom: 8 }}>My Posted Jobs</Text>
      <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>{active} active • {closed} closed</Text>
      {/* Empty state */}
      <View style={{ backgroundColor: colors.surface, borderColor: colors.stroke, borderWidth: 1, borderRadius: radius.lg, padding: 16, alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.medium }}>No posts yet. Create your first job.</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/post-job')} style={{ marginTop: 12, height: 44, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
          <Text style={{ color: '#0B0F1A', fontWeight: '700' }}>Post a Job</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({})


