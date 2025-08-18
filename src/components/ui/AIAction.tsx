import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export function AIAction({ onPress }: { onPress: () => void }){
  return (
    <TouchableOpacity onPress={onPress} hitSlop={8} style={{ paddingHorizontal:8 }} accessibilityRole="button" accessibilityLabel="AI action">
      <Ionicons name="sparkles" size={20} color="#6B21A8"/>
    </TouchableOpacity>
  )
}

