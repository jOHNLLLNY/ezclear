import React, { ReactNode } from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { AIBadge } from './AIBadge'

export function AICard({ title, children, style }: { title: string; children?: ReactNode; style?: ViewStyle }){
  return (
    <View style={[s.card, style]}
      accessibilityRole="summary"
      accessibilityLabel={title}
    >
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <AIBadge label={title} />
      </View>
      {typeof children === 'string' ? (
        <Text style={s.text}>{children}</Text>
      ) : (
        <View>{children}</View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  card:{ borderRadius:16, padding:16, backgroundColor:'#0F172A', borderWidth:1, borderColor:'#2A3345' },
  text:{ color:'#E5E7EB', lineHeight:20 }
})

