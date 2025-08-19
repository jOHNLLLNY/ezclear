import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native'
import { supabase } from '../../lib/supabase'

export function InviteBottomSheet({ visible, onClose, contractorId }: { visible: boolean; onClose: ()=>void; contractorId: string }){
  const [jobs, setJobs] = useState<any[]>([])
  useEffect(()=>{ (async()=>{
    const user = (await supabase.auth.getUser()).data.user
    const { data } = await supabase.from('jobs').select('id,title').eq('poster_id', user?.id||'').eq('status','open')
    setJobs(data||[])
  })() }, [visible])

  const sendInvite = async (jobId: string) => {
    const user = (await supabase.auth.getUser()).data.user
    await supabase.from('invitations').insert({ job_id: jobId, contractor_id: contractorId, poster_id: user?.id })
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex:1, backgroundColor:'#0008', justifyContent:'flex-end' }}>
        <View style={{ backgroundColor:'#0B0F1A', borderTopLeftRadius:16, borderTopRightRadius:16, padding:16, maxHeight:'60%' }}>
          <Text style={{ color:'white', fontWeight:'600', fontSize:16, marginBottom:8 }}>Invite to job</Text>
          <FlatList data={jobs} keyExtractor={(i)=>i.id} renderItem={({item})=> (
            <TouchableOpacity onPress={()=>sendInvite(item.id)} style={{ paddingVertical:12 }}>
              <Text style={{ color:'white' }}>{item.title}</Text>
            </TouchableOpacity>
          )} />
          <TouchableOpacity onPress={onClose} style={{ paddingVertical:12, alignItems:'center' }}>
            <Text style={{ color:'#9CA3AF' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

