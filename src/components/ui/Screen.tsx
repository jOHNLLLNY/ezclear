import React from 'react'
import { Platform, StatusBar, View, ViewStyle } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = { children: React.ReactNode; style?: ViewStyle }

export function Screen({ children, style }: Props) {
  const insets = useSafeAreaInsets()
  const extraTop = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0

  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor: '#0B0F1A',
          paddingTop: insets.top + extraTop,
          paddingBottom: insets.bottom,
        },
        style,
      ]}
      edges={['top', 'right', 'left', 'bottom']}
    >
      {children}
    </SafeAreaView>
  )
}


