import React from 'react'
import { View, Text, Image, Pressable, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../context/ThemeProvider'
import { useTx } from '../../../i18n/tx'

export type ContractorItem = {
  user_id: string
  full_name?: string | null
  city?: string | null
  avatar_url?: string | null
  headline?: string | null
  primary_service?: string | null
  rating?: number | null
  distance_km?: number | null
}

export function ContractorCard({ item, onPress, onInvite, onSaveToggle, saved }: {
  item: ContractorItem
  onPress: () => void
  onInvite?: () => void
  onSaveToggle?: () => void
  saved?: boolean
}){
  const { colors, typography } = useTheme()
  const txServices = useTx('services')
  const name = item.full_name || 'Unnamed'
  const subtitle = item.city || item.headline || ''
  const primary = item.primary_service ? txServices(item.primary_service) : undefined
  return (
    <Pressable onPress={onPress} android_ripple={{ color: '#00000022' }} style={{ backgroundColor: '#101826', borderRadius: 16, borderWidth: 1, borderColor: '#2A3345', padding: 12 }}>
      <View style={{ flexDirection:'row' }}>
        <Image source={{ uri: item.avatar_url || undefined }} style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#0F172A' }} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ color: 'white', fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.base }} numberOfLines={1}>
            {name}
          </Text>
          {!!subtitle && <Text style={{ color: '#9CA3AF', marginTop: 2 }} numberOfLines={1}>{subtitle}</Text>}
          <View style={{ flexDirection:'row', alignItems:'center', marginTop:6 }}>
            {typeof item.rating === 'number' && (
              <View style={{ flexDirection:'row', alignItems:'center', marginRight: 10 }}>
                <Ionicons name="star" size={16} color="#FBBF24" />
                <Text style={{ color: 'white', marginLeft: 4 }}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
            {!!primary && (
              <View style={{ borderWidth: 1, borderColor: '#2A3345', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8 }}>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{primary}</Text>
              </View>
            )}
            {typeof item.distance_km === 'number' && (
              <Text style={{ color:'#9CA3AF', marginLeft: 8, fontSize: 12 }}>{item.distance_km.toFixed(1)} km</Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={onSaveToggle} style={{ padding:8, marginLeft:8 }}>
          <Ionicons name={saved ? 'star' : 'star-outline'} size={20} color={saved ? '#F59E0B' : '#9CA3AF'} />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection:'row', justifyContent:'flex-end', gap:8, marginTop:12 }}>
        {!!onInvite && (
          <TouchableOpacity onPress={onInvite} style={{ borderWidth:1, borderColor:'#334155', borderRadius:12, paddingVertical:8, paddingHorizontal:12 }}>
            <Text style={{ color:'white' }}>Invite</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onPress} style={{ borderWidth:1, borderColor:'#334155', borderRadius:12, paddingVertical:8, paddingHorizontal:12 }}>
          <Text style={{ color:'white' }}>View profile</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  )
}

