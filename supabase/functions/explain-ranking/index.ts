/// <reference lib="deno.ns" />
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface Body { jobId: string; contractors: { id: string; score?: number; features?: Record<string, any> }[] }

Deno.serve(async (req) => {
  try {
    const auth = req.headers.get('Authorization') || ''
    const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : undefined

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const sb = createClient(supabaseUrl, supabaseKey)

    const { data: u } = await sb.auth.getUser(jwt)
    const userId = u?.user?.id
    if (!userId) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })

    const body = (await req.json()) as Body

    const openaiKey = Deno.env.get('OPENAI_API_KEY')!
    const prompt = `Given a job and a ranked list of contractors with features (distance, rating, skills, past jobs), produce 1-2 concise, plain-language reasons for each top contractor's rank.`

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages:[{ role:'user', content: prompt + '\nInput:' + JSON.stringify(body)}], temperature: 0.3 })
    })
    if (!resp.ok) return new Response(JSON.stringify({ error: await resp.text() }), { status: 400 })
    const json = await resp.json()
    const text = json?.choices?.[0]?.message?.content || ''

    return new Response(JSON.stringify({ explanations: text }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 })
  }
})

