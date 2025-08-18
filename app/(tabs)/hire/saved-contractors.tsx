import React from 'react'
import { View, Text } from 'react-native'
import { useTheme } from '../../../src/context/ThemeProvider'

export default function HireSavedContractorsScreen() {
  const { colors } = useTheme()
  return (
    <View style={{ flex:1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={{ color: colors.textPrimary }}>No saved contractors yet. Tap the ☆ on a contractor to save.</Text>
    </View>
  )
}


