import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { approxTokens, ensureBudget, recordUsage } from "../_utils/budget.ts";

serve(async (req) => {
  try {
    const { profileId } = await req.json();
    if (!profileId) return new Response(JSON.stringify({ error: 'profileId required' }), { status: 400 });

    const auth = req.headers.get('Authorization') || '';
    const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { data: user } = await sb.auth.getUser(jwt);
    const userId = user?.user?.id as string | undefined;
    if (!userId) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });

    const { data: p } = await sb
      .from('profiles')
      .select('id, full_name, city:location, skills, service_slugs, about')
      .eq('id', profileId)
      .single();
    if (!p) return new Response(JSON.stringify({ error: 'profile not found' }), { status: 404 });

    const parts = [p.full_name, p.city, (p.about||''), JSON.stringify(p.skills||[]), JSON.stringify(p.service_slugs||[])].filter(Boolean);
    const content = parts.join('\n');

    // Budget check
    const tokensIn = approxTokens(content);
    await ensureBudget({ supabaseAdmin: sb, userId, tokensIn });

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

    const r = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: content })
    });
    const j = await r.json();
    const vec = j?.data?.[0]?.embedding;
    if (!Array.isArray(vec)) throw new Error('No embedding');

    await sb.from('profile_embeddings').upsert({ profile_id: profileId, embedding: vec });

    await recordUsage({ supabaseAdmin: sb, userId, tokensIn, tokensOut: 0 });

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = String((e as any)?.message || e);
    const code = msg.includes('BUDGET_EXCEEDED') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status: code });
  }
});
