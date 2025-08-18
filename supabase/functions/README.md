# Edge Functions for AI Copilot

This app expects the following Supabase Edge Functions to be deployed:

1) classify-job
- Input JSON: { title, description, city, photos? }
- Output JSON: { service_slug, tags: string[], refined_description: string, risks: string[], missing_info: string[] }

2) match-contractors
- Input JSON: { jobId }
- Output JSON: [{ contractor_id: string, score: number }]

3) estimate-job
- Input JSON: { title, description, city, service_slug, photos? }
- Output JSON: { cost_low: number, cost_high: number, days: number, assumptions: string[], exclusions: string[] }

4) (optional) suggest-reply
- Input JSON: { threadHistory: {role: 'user'|'contractor'|'system', content: string}[], locale?: string }
- Output JSON: { reply: string }

Deployment:
- Create each function under supabase/functions/<name>/index.ts based on the templates below.
- Deploy with: supabase functions deploy <name>
- Call with: POST {SUPABASE_URL}/functions/v1/<name> using service role or anon with RLS-safe logic.

Security:
- Store OPENAI_API_KEY in Supabase secrets: supabase secrets set --env-file .env
- Do not expose OPENAI_API_KEY in the mobile app.

