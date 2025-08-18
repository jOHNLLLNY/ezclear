// classify-job with budget checks
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { approxTokens, ensureBudget, recordUsage, ymNowUTC } from "../_utils/budget.ts";

serve(async (req) => {
  try {
    const body = await req.json();
    const { title = "", description = "", city = "", photos = [] } = body || {};

    const auth = req.headers.get('Authorization') || '';
    const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const { data: user } = await supabaseAdmin.auth.getUser(jwt);
    const userId = user?.user?.id as string | undefined;
    if (!userId) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });

    const tokensIn = approxTokens(title) + approxTokens(description) + approxTokens(city);
    await ensureBudget({ supabaseAdmin, userId, tokensIn });

    const prompt = `You are EZ Clear assistant. Normalize job text and return STRICT JSON with keys: service_slug, tags[], refined_description, risks[], missing_info[]. Allowed service_slugs are common home services like handyman, appliances, filters, repairs, leaf-cleanup, gutters, fencing, washing, bathroom, basement, snow-removal, lawn-care, flooring, tiling, demolition, kitchen, insulation, plastering, painting. Respond with a compact JSON only.`;

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
          { role: "user", content: JSON.stringify({ title, description, city, photos }) },
          { role: "user", content: prompt },
        ],
      }),
    });

    const json = await r.json();
    const content = json?.choices?.[0]?.message?.content || "{}";

    const outTokens = approxTokens(content);
    await recordUsage({ supabaseAdmin, userId, tokensIn, tokensOut: outTokens });

    return new Response(content, { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const msg = String((e as any)?.message || e);
    const code = msg.includes('BUDGET_EXCEEDED') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status: code });
  }
});
