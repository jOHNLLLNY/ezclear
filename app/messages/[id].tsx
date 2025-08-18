import React, { useEffect, useRef, useState } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../src/context/ThemeProvider'
import { useAuth } from '../../src/context/AuthContext'
import { db } from '../../src/lib/supabase'
import i18n from '../../i18n'

export default function ConversationScreen(){
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors, typography, spacing } = useTheme()
  const { user } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const flatRef = useRef<FlatList>(null)

  useEffect(()=>{
    if (!id) return
    ;(async()=>{ const list = await db.getMessages(String(id)); setMessages(list as any[]) })()
    const sub = db.subscribeToMessages(String(id), (payload)=>{
      const newMsg = (payload as any).new
      setMessages(prev => [...prev, newMsg])
    })
    return ()=>{ try { sub.unsubscribe() } catch{} }
  },[id])

  const send = async ()=>{
    if (!text.trim() || !user) return
    const sent = await db.sendMessage(String(id), user.id, text.trim())
    setMessages(prev=>[...prev, sent])
    setText('')
    flatRef.current?.scrollToEnd({ animated:true })
  }

  const suggest = async ()=>{
    const { isAiCapped, setAiCapped, includesCapError } = await import('../../src/lib/aiCap')
    if (await isAiCapped()) { return }
    try {
      const { aiSuggestReply } = await import('../../src/lib/ai')
      const { ensureSession } = await import('../../src/lib/supabase')
      await ensureSession();
      const history = messages.slice(-10).map((m:any)=>({ role: m.sender_id===user?.id ? 'user':'contractor', content: m.content }))
      const res = await aiSuggestReply(history, i18n.language)
      if (res?.reply) setText(res.reply)
    } catch (e:any) { if (includesCapError(e)) { await setAiCapped() } }
  }

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: colors.background }}>
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item)=> item.id}
        renderItem={({item})=> (
          <View style={{ padding: 12, alignItems: item.sender_id===user?.id ? 'flex-end':'flex-start' }}>
            <View style={{ maxWidth:'80%', backgroundColor: item.sender_id===user?.id ? colors.accent:'#1F2937', padding: 10, borderRadius: 12 }}>
              <Text style={{ color: item.sender_id===user?.id ? '#0B0F1A':'#FFFFFF' }}>{item.content}</Text>
            </View>
          </View>
        )}
      />
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} keyboardVerticalOffset={80}>
        <View style={{ flexDirection:'row', alignItems:'center', padding: 12, gap:8 }}>
          <TouchableOpacity onPress={suggest} style={{ paddingHorizontal:12, paddingVertical:10, borderRadius:999, borderWidth:1, borderColor:'#334155', flexDirection:'row', alignItems:'center', gap:6 }}>
            <Ionicons name="sparkles" size={16} color={colors.textPrimary} />
            <Text style={{ color: colors.textPrimary }} numberOfLines={1} ellipsizeMode="tail">{i18n.t('messages.suggest')}</Text>
          </TouchableOpacity>
          <TextInput value={text} onChangeText={setText} placeholder={i18n.t('messages.placeholder')} placeholderTextColor="#9CA3AF" style={{ flex:1, height:44, borderRadius:12, borderWidth:1, borderColor:'#334155', color:'#FFFFFF', paddingHorizontal:12 }} />
          <TouchableOpacity onPress={send} style={{ paddingHorizontal:16, height:44, borderRadius:12, backgroundColor: colors.accent, alignItems:'center', justifyContent:'center' }}>
            <Text style={{ color:'#0B0F1A', fontWeight:'700' }} numberOfLines={1} ellipsizeMode="tail">{i18n.t('messages.send')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

