import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { approxTokensArray, ensureBudget, recordUsage } from "../_utils/budget.ts";

serve(async (req) => {
  try {
    const body = await req.json();
    const { threadHistory = [], locale = 'en' } = body || {};

    const auth = req.headers.get('Authorization') || '';
    const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: user } = await sb.auth.getUser(jwt);
    const userId = user?.user?.id as string | undefined;
    if (!userId) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });

    const tokensIn = approxTokensArray(threadHistory.map((m:any)=>m?.content));
    await ensureBudget({ supabaseAdmin: sb, userId, tokensIn });

    const prompt = `Return STRICT JSON { reply:string } that is polite, brief, and localized to ${locale}.`;

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are helpful and concise." },
          { role: "user", content: JSON.stringify({ threadHistory, locale }) },
          { role: "user", content: prompt },
        ],
      }),
    });

    const json = await r.json();
    const content = json?.choices?.[0]?.message?.content || "{}";

    await recordUsage({ supabaseAdmin: sb, userId, tokensIn, tokensOut: 64 });

    return new Response(content, { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const msg = String((e as any)?.message || e);
    const code = msg.includes('BUDGET_EXCEEDED') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status: code });
  }
});
