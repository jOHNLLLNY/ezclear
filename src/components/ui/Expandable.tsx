import React, { ReactNode, useRef, useState, useEffect } from 'react'
import { Animated, Easing, LayoutChangeEvent, View } from 'react-native'

export function Expandable({ open, children, duration=220 }: { open: boolean; children: ReactNode; duration?: number }){
  const height = useRef(new Animated.Value(0)).current
  const [contentH, setContentH] = useState(0)

  useEffect(()=>{
    Animated.timing(height, { toValue: open ? contentH : 0, duration, easing:Easing.out(Easing.cubic), useNativeDriver:false }).start()
  }, [open, contentH, duration])

  return (
    <Animated.View style={{ overflow:'hidden', height }}>
      <View onLayout={(e:LayoutChangeEvent)=> setContentH(e.nativeEvent.layout.height)}>
        {children}
      </View>
    </Animated.View>
  )
}

