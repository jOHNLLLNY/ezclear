import { supabase } from './supabase'

export async function fetchSavedContractorsIds(): Promise<string[]>{
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return []
  const { data, error } = await supabase.from('saved_contractors').select('contractor_id').eq('user_id', user.id)
  if (error) return []
  return (data||[]).map(r=> r.contractor_id)
}

export async function toggleSaved(contractorId: string): Promise<boolean>{
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Auth required')
  const { data: exists } = await supabase.from('saved_contractors').select('contractor_id').eq('user_id', user.id).eq('contractor_id', contractorId).maybeSingle()
  if (exists) {
    await supabase.from('saved_contractors').delete().eq('user_id', user.id).eq('contractor_id', contractorId)
    return false
  } else {
    await supabase.from('saved_contractors').insert({ user_id: user.id, contractor_id: contractorId })
    return true
  }
}

