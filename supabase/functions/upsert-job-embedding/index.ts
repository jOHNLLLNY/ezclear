import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { approxTokens, ensureBudget, recordUsage } from "../_utils/budget.ts";

serve(async (req) => {
  try {
    const { job_id } = await req.json();
    if (!job_id) return new Response(JSON.stringify({ error: 'job_id required' }), { status: 400 });

    const auth = req.headers.get('Authorization') || '';
    const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { data: user } = await sb.auth.getUser(jwt);
    const userId = user?.user?.id as string | undefined;
    if (!userId) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });

    const { data: j } = await sb
      .from('jobs')
      .select('id, title, description, city, service_slug')
      .eq('id', job_id)
      .single();
    if (!j) return new Response(JSON.stringify({ error: 'job not found' }), { status: 404 });

    const content = `${j.title}\n${j.description}\n${j.city||''}\n${j.service_slug||''}`

    const tokensIn = approxTokens(content);
    await ensureBudget({ supabaseAdmin: sb, userId, tokensIn });

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

    const r = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: content })
    })
    const jj = await r.json();
    const vec = jj?.data?.[0]?.embedding;
    if (!Array.isArray(vec)) throw new Error('No embedding');

    await sb.from('job_embeddings').upsert({ job_id, embedding: vec });

    await recordUsage({ supabaseAdmin: sb, userId, tokensIn, tokensOut: 0 });

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = String((e as any)?.message || e);
    const code = msg.includes('BUDGET_EXCEEDED') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status: code });
  }
});
