import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { AIBadge } from './AIBadge'
import i18n from '../../../i18n'

export function AIEstimate({ low, high, days }: { low?: number; high?: number; days?: number }){
  return (
    <View style={est.card}>
      <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:8 }}>
        <AIBadge label={i18n.t('ai.estimate')} />
        {!!days && <Text style={est.days}>{days} d</Text>}
      </View>
      <Text style={est.range}>{typeof low==='number' && typeof high==='number' ? `$${low} – $${high}` : '—'}</Text>
      <Text style={est.note}>{i18n.t('ai.note')}</Text>
    </View>
  )
}
const est = StyleSheet.create({
  card:{ borderRadius:16, padding:16, backgroundColor:'#F7F5FF' },
  range:{ fontSize:24, fontWeight:'700', marginBottom:4, color:'#111827' },
  days:{ fontSize:14, opacity:.7, color:'#111827' },
  note:{ fontSize:12, opacity:.7, color:'#111827' }
})

