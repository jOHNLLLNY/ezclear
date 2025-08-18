import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../../../src/context/ThemeProvider'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { z } from 'zod'

const ALL_SKILLS = ['Drywall','Taping','Plastering','Painting','Flooring','Tile','Plumbing','Electrical','Roofing','Landscaping','Snow Removal','Framing','Windows & Doors','Demolition','Handyman','Fencing','Decks','Insulation','Siding','Masonry']

const Schema = z.object({
  primary_category: z.string().min(2),
  experience_level: z.enum(['Junior','Mid','Senior']),
  skills: z.array(z.string().min(2).max(30)).min(3, 'Pick at least 3').max(5, 'Max 5 skills'),
  service_radius_km: z.number().min(5).max(100),
  company_name: z.string().optional(),
  website_url: z.string().url().optional(),
})

type Form = z.infer<typeof Schema>

function Chip({ label, selected, disabled, onToggle }: { label: string; selected: boolean; disabled?: boolean; onToggle(): void }) {
  const { colors, typography } = useTheme()
  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, margin: 6, backgroundColor: selected ? '#00E6CF' : 'transparent', borderWidth: 1, borderColor: selected ? '#00E6CF' : '#334155', opacity: disabled && !selected ? 0.4 : 1 }}
    >
      <Text style={{ color: selected ? '#0B0F1A' : '#FFFFFF', fontFamily: typography.fontFamily.medium }}>{label}</Text>
    </TouchableOpacity>
  )
}

export default function WorkerProfessional() {
  const { colors, typography, spacing, radius } = useTheme()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Form>({ primary_category: '', experience_level: 'Mid', skills: [], service_radius_km: 25, company_name: undefined, website_url: undefined })

  useEffect(() => {
    (async () => {
      const cached = await AsyncStorage.getItem('onboarding_worker_professional')
      if (cached) try { setForm({ ...form, ...JSON.parse(cached) }) } catch {}
    })()
  }, [])

  // persist draft (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      AsyncStorage.setItem('onboarding_worker_professional', JSON.stringify(form)).catch(() => {})
    }, 300)
    return () => clearTimeout(t)
  }, [form])

  const filtered = useMemo(() => ALL_SKILLS.filter(s => !q || String(s||'').toLowerCase().includes(String(q||'').toLowerCase())), [q])
  const count = form.skills.length
  const maxed = count >= 5

  const toggleSkill = (s: string) => {
    setForm((prev) => {
      const has = prev.skills.includes(s)
      const next = has ? prev.skills.filter(x => x !== s) : (maxed ? prev.skills : [...prev.skills, s])
      return { ...prev, skills: next }
    })
  }

  const validateAndNext = async () => {
    try {
      setError(null)
      const parsed = Schema.parse(form)
      // optionally upsert draft to Supabase profiles.onboarding_draft here
      router.push('/(auth)/onboarding/worker/review')
    } catch (e: any) {
      setError(e.errors?.[0]?.message || 'Please fill all required fields')
    }
  }

  return (
    <View style={{ flex:1, backgroundColor: '#0B0F1A' }}>
      <SafeAreaView edges={['top']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700' }}>Professional</Text>
          <Text style={{ color: '#9CA3AF', marginTop: 4 }}>Step 2 of 5</Text>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Category & Experience */}
        <View style={{ backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#2A3345', padding: 14, marginBottom: 16 }}>
          <Text style={{ color: '#FFFFFF', marginBottom: 6 }}>Primary Category</Text>
          <TextInput value={form.primary_category} onChangeText={(v) => setForm(f => ({ ...f, primary_category: v }))} placeholder="Renovation / Landscaping ..." placeholderTextColor="#FFFFFF" style={{ backgroundColor: '#1F2937', borderColor: '#334155', borderWidth: 1, borderRadius: 12, color: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 10 }} />
          <Text style={{ color: '#FFFFFF', marginTop: 12, marginBottom: 6 }}>Experience Level</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['Junior','Mid','Senior'] as const).map(l => (
              <TouchableOpacity key={l} onPress={() => setForm(f => ({ ...f, experience_level: l }))} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: form.experience_level===l ? '#00E6CF' : 'transparent', borderWidth: 1, borderColor: form.experience_level===l ? '#00E6CF' : '#334155' }}>
                <Text style={{ color: form.experience_level===l ? '#0B0F1A' : '#FFFFFF' }}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Skills selector */}
        <View style={{ backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#2A3345', padding: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Skills</Text>
            <Text style={{ color: maxed ? '#00E6CF' : '#9CA3AF' }}>{count}/5</Text>
          </View>
          <TextInput placeholder="Search skills..." placeholderTextColor="#FFFFFF" value={q} onChangeText={setQ} style={{ backgroundColor: '#1F2937', borderColor: '#334155', borderWidth: 1, borderRadius: 12, color: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 10, marginTop: 10, marginBottom: 8 }} />
          {maxed && <Text style={{ color: '#00E6CF', marginBottom: 6 }}>Maximum 5 skills</Text>}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[...form.skills, ...filtered.filter(s => !form.skills.includes(s))].map(s => (
              <Chip key={s} label={s} selected={form.skills.includes(s)} disabled={!form.skills.includes(s) && maxed} onToggle={() => toggleSkill(s)} />
            ))}
          </View>
          {!!count && (
            <TouchableOpacity onPress={() => setForm(f => ({ ...f, skills: [] }))} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
              <Text style={{ color: '#9CA3AF' }}>Clear all</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Radius */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ color: '#FFFFFF', marginBottom: 6 }}>Service Radius (km)</Text>
          <TextInput value={String(form.service_radius_km)} onChangeText={(v) => setForm(f => ({ ...f, service_radius_km: Math.max(5, Math.min(100, Number(v)||0)) }))} keyboardType="numeric" placeholderTextColor="#FFFFFF" style={{ backgroundColor: '#1F2937', borderColor: '#334155', borderWidth: 1, borderRadius: 12, color: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 10 }} />
        </View>

        {!!error && <Text style={{ color: '#F87171', marginTop: 10 }}>{error}</Text>}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Footer */}
      <SafeAreaView edges={['bottom']} style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ flex: 1, height: 52, borderRadius: 14, borderWidth: 1, borderColor: '#334155', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#FFFFFF' }}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={validateAndNext} style={{ flex: 1, height: 52, borderRadius: 14, backgroundColor: '#00E6CF', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#0B0F1A', fontWeight: '700' }}>Next</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({})


