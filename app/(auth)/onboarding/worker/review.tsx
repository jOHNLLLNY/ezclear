import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { useTheme } from '../../../../src/context/ThemeProvider'
import { supabase } from '../../../../src/lib/supabase'

export default function WorkerReview() {
  const { colors } = useTheme()
  const router = useRouter()

  const submit = async () => {
    const basics = await AsyncStorage.getItem('onboarding_worker_basics')
    const prof = await AsyncStorage.getItem('onboarding_worker_professional')
    const draft = { basics: basics && JSON.parse(basics), professional: prof && JSON.parse(prof) }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // Save draft to profiles.onboarding_draft and mark completed
    await supabase.from('profiles').update({ role: 'worker', onboarding_draft: draft, onboarding_completed: true }).eq('id', user.id)
    // Upsert worker_profiles minimal
    const p = draft.professional || {}
    await supabase.from('worker_profiles').upsert({ user_id: user.id, primary_category: p.primary_category || null, skills: p.skills || [], experience_level: p.experience_level || null, service_radius_km: p.service_radius_km || 25, company_name: p.company_name || null, website_url: p.website_url || null })
    // Clear local drafts
    await AsyncStorage.multiRemove(['onboarding_worker_basics','onboarding_worker_professional'])
    router.replace('/(tabs)/home')
  }

  return (
    <View style={{ flex:1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']}><View style={{ padding:16 }}><Text style={{ color:'#FFFFFF', fontSize:22, fontWeight:'700' }}>Review & Submit</Text><Text style={{ color:'#9CA3AF' }}>Step 5 of 5</Text></View></SafeAreaView>
      <View style={{ flex:1, padding:16 }}>
        <Text style={{ color:'#9CA3AF' }}>Your data will be saved to your profile. By submitting, you agree to the Terms and Privacy Policy.</Text>
      </View>
      <SafeAreaView edges={['bottom']} style={{ padding:16 }}>
        <TouchableOpacity onPress={submit} style={{ height:52, borderRadius:14, backgroundColor:'#00E6CF', alignItems:'center', justifyContent:'center' }}>
          <Text style={{ color:'#0B0F1A', fontWeight:'700' }}>Confirm & Finish</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}


