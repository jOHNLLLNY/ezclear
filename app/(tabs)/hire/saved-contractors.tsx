import React, { useEffect, useState } from 'react'
import { View, Text, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../../src/context/ThemeProvider'
import { supabase } from '../../../src/lib/supabase'
import { ContractorCard } from '../../../src/components/contractors/ContractorCard'

export default function HireSavedContractorsScreen() {
  const { colors, spacing } = useTheme()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    (async()=>{
      const user = (await supabase.auth.getUser()).data.user
      if (!user) return
      const { data } = await supabase.from('saved_contractors').select('contractor:contractor_id(id, full_name, avatar_url, location, rating)').eq('user_id', user.id)
      setRows((data||[]).map((r:any)=> ({ ...r.contractor, _saved:true })))
      setLoading(false)
    })()
  },[])

  return (
    <View style={{ flex:1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex:1 }}>
        {(!rows.length && !loading) ? (
          <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding: spacing[4] }}>
            <Text style={{ color: colors.muted, textAlign:'center' }}>No saved contractors yet. Browse and tap the ☆ to save.</Text>
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(i)=>i.id}
            contentContainerStyle={{ padding: spacing[4], paddingBottom: spacing[6], gap: 12 }}
            renderItem={({item})=> (
              <ContractorCard item={{ user_id:item.id, full_name:item.full_name, avatar_url:item.avatar_url, city:item.location, rating:item.rating }} onPress={()=>{}} saved />
            )}
          />
        )}
      </SafeAreaView>
    </View>
  )
}
