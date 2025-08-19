/// <reference lib="deno.ns" />
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface Body { title?: string; description?: string; city?: string; service_slug?: string; assumptions?: string[]; exclusions?: string[] }

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
    const prompt = `Give 3-5 bullet reasons that justify an estimate for a home service job. Mention possible risks and missing info. Context: ${JSON.stringify(body)}`

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages:[{ role:'user', content: prompt }], temperature: 0.3 })
    })
    if (!resp.ok) return new Response(JSON.stringify({ error: await resp.text() }), { status: 400 })
    const json = await resp.json()
    const text = json?.choices?.[0]?.message?.content || ''

    return new Response(JSON.stringify({ bullets: text.split(/\n\s*-\s*/).filter(Boolean).slice(0,5) }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 })
  }
})

