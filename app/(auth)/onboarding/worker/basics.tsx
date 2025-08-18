import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../../../src/context/ThemeProvider'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { z } from 'zod'

const Schema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  city: z.string().min(2),
  province: z.string().min(2),
  phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Use E.164 format'),
  bio: z.string().min(40),
})
type Form = z.infer<typeof Schema>

export default function WorkerBasics() {
  const { colors } = useTheme()
  const router = useRouter()
  const [form, setForm] = useState<Form>({ first_name:'', last_name:'', city:'', province:'', phone:'', bio:'' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { (async () => { const c = await AsyncStorage.getItem('onboarding_worker_basics'); if (c) try { setForm({ ...form, ...JSON.parse(c) }) } catch {} })() }, [])
  useEffect(() => { const t = setTimeout(() => AsyncStorage.setItem('onboarding_worker_basics', JSON.stringify(form)).catch(()=>{}), 300); return () => clearTimeout(t) }, [form])

  const next = () => {
    try { Schema.parse(form); router.push('/(auth)/onboarding/worker/professional') } catch (e: any) { setError(e.errors?.[0]?.message || 'Fill all required fields') }
  }

  return (
    <View style={{ flex:1, backgroundColor: '#0B0F1A' }}>
      <SafeAreaView edges={['top']}><View style={{ padding:16 }}><Text style={{ color:'#FFFFFF', fontSize:22, fontWeight:'700' }}>Basics</Text><Text style={{ color:'#9CA3AF' }}>Step 1 of 5</Text></View></SafeAreaView>
      <ScrollView contentContainerStyle={{ padding:16 }}>
        {(['first_name','last_name','city','province','phone'] as const).map((k) => (
          <View key={k} style={{ marginBottom: 12 }}>
            <Text style={{ color:'#FFFFFF', marginBottom: 6 }}>{k.replace('_',' ')}</Text>
            <TextInput value={(form as any)[k]} onChangeText={(v)=>setForm(f=>({ ...f, [k]: v }))} placeholderTextColor="#FFFFFF" style={{ backgroundColor:'#1F2937', borderColor:'#334155', borderWidth:1, borderRadius:12, color:'#FFFFFF', paddingHorizontal:12, paddingVertical:10 }} />
          </View>
        ))}
        <Text style={{ color:'#FFFFFF', marginBottom: 6 }}>bio</Text>
        <TextInput value={form.bio} onChangeText={(v)=>setForm(f=>({ ...f, bio: v }))} multiline placeholderTextColor="#FFFFFF" style={{ backgroundColor:'#1F2937', borderColor:'#334155', borderWidth:1, borderRadius:12, color:'#FFFFFF', paddingHorizontal:12, paddingVertical:10, minHeight:100, textAlignVertical:'top' }} />
        {!!error && <Text style={{ color:'#F87171', marginTop: 10 }}>{error}</Text>}
        <View style={{ height: 80 }} />
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={{ padding:16 }}>
        <TouchableOpacity onPress={next} style={{ height:52, borderRadius:14, backgroundColor:'#00E6CF', alignItems:'center', justifyContent:'center' }}><Text style={{ color:'#0B0F1A', fontWeight:'700' }}>Next</Text></TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}


