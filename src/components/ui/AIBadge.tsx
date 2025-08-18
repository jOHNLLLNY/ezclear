import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export function AIBadge({ label = 'AI', style }: { label?: string; style?: ViewStyle }){
  return (
    <View style={[s.badge, style]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <Ionicons name="sparkles-outline" size={14} color="#6B21A8" />
      <Text style={s.badgeText}>{label}</Text>
    </View>
  )
}
const s = StyleSheet.create({
  badge:{ flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:8, paddingVertical:4,
    borderRadius:12, backgroundColor:'#EFE8FF' },
  badgeText:{ fontSize:12, fontWeight:'600', color:'#3B0764' }
})

