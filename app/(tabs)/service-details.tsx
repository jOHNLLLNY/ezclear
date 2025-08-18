import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/context/ThemeProvider'
import { SERVICES } from '../../src/constants/services'
import i18n from '../../i18n'

export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors, typography, spacing } = useTheme()
  const router = useRouter()
  const service = SERVICES.find(s => s.slug === id)
  const title = id ? i18n.t(`services.${id}`) : 'Service'

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F1A' }}>
      <SafeAreaView edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingBottom: 12, paddingTop: spacing[4] }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ color: colors.textPrimary, fontSize: 22, fontFamily: typography.fontFamily.semibold, marginLeft: 4 }}>{title}</Text>
        </View>
      </SafeAreaView>

      <View style={{ padding: 16 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 18, fontFamily: typography.fontFamily.medium }}>{title}</Text>
        <Text style={{ color: colors.textMuted, marginTop: 8 }}>{service?.shortDescription || ''}</Text>
      </View>
    </View>
  )
}


