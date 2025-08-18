import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { approxTokens, ensureBudget, recordUsage } from "../_utils/budget.ts";

serve(async (req) => {
  try {
    const body = await req.json();
    const { jobId } = body || {};
    if (!jobId) return new Response(JSON.stringify({ error: 'jobId required' }), { status: 400 });

    const auth = req.headers.get('Authorization') || '';
    const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { data: user } = await sb.auth.getUser(jwt);
    const userId = user?.user?.id as string | undefined;
    if (!userId) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });

    // Budget check (heuristic small input)
    const tokensIn = 64; // cheap fixed allowance for a ranking call
    await ensureBudget({ supabaseAdmin: sb, userId, tokensIn });

    // Fetch job and basic candidates (workers)
    const { data: job } = await sb.from('jobs').select('id, title, description, city, service_slug').eq('id', jobId).single();
    if (!job) return new Response(JSON.stringify({ error: 'job not found' }), { status: 404 });

    const { data: candidates } = await sb
      .from('profiles')
      .select('id, rating, service_slugs')
      .eq('user_type','worker');

    const filtered = (candidates || []).map((c) => {
      const hasService = Array.isArray(c.service_slugs) && job.service_slug ? c.service_slugs.includes(job.service_slug) : false;
      const rating = typeof c.rating === 'number' ? c.rating : 0;
      let score = 0.6 * (hasService ? 1 : 0) + 0.4 * (rating / 5);
      return { contractor_id: c.id, score };
    }).sort((a, b) => b.score - a.score).slice(0, 50);

    // Record minimal usage
    await recordUsage({ supabaseAdmin: sb, userId, tokensIn, tokensOut: 32 });

    return new Response(JSON.stringify(filtered), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const msg = String((e as any)?.message || e);
    const code = msg.includes('BUDGET_EXCEEDED') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status: code });
  }
});
