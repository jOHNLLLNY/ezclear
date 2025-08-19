import React, { useMemo, useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/context/ThemeProvider'
import { useRouter } from 'expo-router'
import { SERVICES_FLAT } from '../../src/constants/categories'
import { supabase } from '../../src/lib/supabase'
import { SearchBar } from '../../src/components/ui/SearchBar'
import { useAuth } from '../../src/context/AuthContext'
import { useTx } from '../../i18n/tx'

const SEGMENTS = [
  { id: 'all', labelKey: 'All' },
  { id: 'Renovation', labelKey: 'Renovation' },
  { id: 'exterior', labelKey: 'Outdoor' },
  { id: 'Maintenance', labelKey: 'Maintenance' },
] as const

export default function ServicesScreen() {
  const { colors, spacing, typography, radius } = useTheme()
  const router = useRouter()
  const { profile, session } = useAuth()
  const txServices = useTx('services')
  const isHire = ((profile?.user_type as any) || (session?.user?.user_metadata?.user_type as any)) === 'hirer'
  const [q, setQ] = useState('')
  const [segment, setSegment] = useState<'all' | 'Renovation' | 'exterior' | 'Maintenance'>('all')

  const [categories, setCategories] = useState<any[]>([])
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('categories').select('id, name').order('name')
      if (!error && data) setCategories(data)
    })()
  }, [])

  const list = useMemo(() => {
    const ql = String(q || '').toLowerCase();
    const fallback = SERVICES_FLAT.map(s => ({ id: s.slug, name: s.label }));
    const filtered = (categories.length ? categories : fallback)
      .filter((c: any) => !ql || String(c.name || '').toLowerCase().includes(ql));
    return [{ key: 'all', items: filtered.map((c: any) => ({ id: c.id, label: i18n.t(`services.${c.id}`) || c.name, shortDescription: '', icon: 'list-circle-outline' })) }];
  }, [q, segment, categories])

  // Optional: load from DB if services table exists
  // useEffect(() => {
  //   (async () => {
  //     const { data } = await supabase.from('services').select('id,label: name, icon, category, shortDescription');
  //     if (data && data.length) {
  //       // You could replace SERVICES with db result if desired
  //     }
  //   })();
  // }, [])

  const renderItem = ({ item }: { item: any }) => (
    <View style={{ marginTop: 16 }}>
      <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, fontSize: 18, marginBottom: 10 }}>
        {txServices(item.key)}
      </Text>
      {item.items.map((s: any) => (
        <Pressable
          key={s.id}
          onPress={() => {
            if (isHire) {
              router.push(`/(tabs)/contractors?service=${encodeURIComponent(s.id)}`)
            } else {
              router.push(`/(tabs)/jobs?category=${encodeURIComponent(s.id)}`)
            }
          }}
          android_ripple={{ color: '#00000022' }}
          style={{ backgroundColor: '#111827', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#2A3345', flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
          accessibilityLabel={`${s.label}. ${s.category}. ${s.shortDescription || ''}`}
        >
          <View style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Ionicons name={s.icon as any} size={28} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: typography.fontFamily.medium }}>{s.label}</Text>
            {!!s.shortDescription && (
              <Text style={{ color: '#FFFFFF', marginTop: 4 }}>{s.shortDescription}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      ))}
    </View>
  )

  return (
    <View style={[styles.container]}> 
      <SafeAreaView edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingBottom: 12, paddingTop: spacing[4] }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ color: colors.textPrimary, fontSize: 22, fontFamily: typography.fontFamily.semibold, marginLeft: 4 }}>{i18n.t('home.services')}</Text>
        </View>
      </SafeAreaView>

      <View style={{ paddingHorizontal: spacing[4] }}>
        <SearchBar
          placeholder={i18n.t('home.searchPlaceholder')}
          value={q}
          onChangeText={setQ}
          rightIcon="options-outline"
          onPressRight={() => {}}
          style={{ backgroundColor: '#1F2937', borderColor: '#334155', borderWidth: 1, borderRadius: 16 }}
        />

        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          {SEGMENTS.map(seg => {
            const selected = segment === seg.id
            return (
              <TouchableOpacity
                key={seg.id}
                onPress={() => setSegment(seg.id as any)}
                style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginRight: 8, backgroundColor: selected ? colors.accent : 'transparent', borderWidth: 1, borderColor: selected ? colors.accent : '#334155' }}
              >
                <Text style={{ color: selected ? '#FFFFFF' : '#00E6CF', fontFamily: typography.fontFamily.medium }}>{i18n.t(`serviceGroups.${seg.id}`) || seg.id}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(g) => g.key}
        renderItem={renderItem}
        style={{ flex: 1, paddingHorizontal: 16, marginTop: 8 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F1A' },
})


