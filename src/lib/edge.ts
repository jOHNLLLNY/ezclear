import { supabase } from './supabase'

const base = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`

export async function callEdge<T>(name: string, payload: any, signal?: AbortSignal): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
  const res = await fetch(`${base}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload ?? {}),
    signal,
  })
  if (!res.ok) {
    const text = await res.text().catch(()=> '')
    throw new Error(`${name} failed: ${res.status} ${text}`)
  }
  return res.json() as Promise<T>
}

