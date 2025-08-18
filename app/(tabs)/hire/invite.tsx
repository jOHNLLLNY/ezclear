import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useTheme } from '../../../src/context/ThemeProvider'
import * as Clipboard from 'expo-clipboard'

export default function HireInviteScreen() {
  const { colors, typography, radius } = useTheme()
  const [email, setEmail] = useState('')

  const isValid = /.+@.+\..+/.test(email)

  const sendInvite = async () => {
    if (!isValid) { Alert.alert('Invalid email'); return }
    Alert.alert('Invite sent', `Invitation sent to ${email}`)
  }

  const copyLink = async () => {
    const link = 'https://ezclear.app/invite/ABC123'
    await Clipboard.setStringAsync(link)
    Alert.alert('Link copied')
  }

  return (
    <View style={{ flex:1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, fontSize: 18, marginBottom: 12 }}>Invite a Contractor</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="contractor@email.com"
        placeholderTextColor="#FFFFFF"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ backgroundColor: '#1F2937', borderColor: '#334155', borderWidth: 1, borderRadius: radius.lg, color: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 12 }}
      />
      <TouchableOpacity onPress={sendInvite} disabled={!isValid} style={{ marginTop: 12, height: 48, borderRadius: 14, backgroundColor: isValid ? '#00E6CF' : '#334155', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: isValid ? '#0B0F1A' : '#9CA3AF', fontWeight: '700' }}>Send Invite</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={copyLink} style={{ marginTop: 10, height: 48, borderRadius: 14, borderWidth: 1, borderColor: '#00E6CF', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#00E6CF', fontWeight: '700' }}>Copy Invite Link</Text>
      </TouchableOpacity>
    </View>
  )
}


