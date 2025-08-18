// Budget and usage tracking utilities for Supabase Edge Functions
// Minimal, dependency-free helpers. Keep in sync with secrets:
// USAGE_PRICE_PER_1K_INPUT, USAGE_PRICE_PER_1K_OUTPUT, USAGE_USER_MONTHLY_CAP_CENTS, USAGE_PROJECT_MONTHLY_CAP_CENTS

export type UsageRecord = {
  user_id: string;
  ym: string; // YYYY-MM
  calls: number;
  tokens_in: number;
  tokens_out: number;
  cost_cents: number;
};

export function ymNowUTC(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// Quick rough token estimate: ~4 chars per token; UTF-8 length is close enough for caps
export function approxTokens(text: string | undefined | null): number {
  if (!text) return 0;
  const len = new TextEncoder().encode(String(text)).length;
  return Math.max(1, Math.ceil(len / 4));
}

export function approxTokensArray(arr: Array<string | undefined | null>): number {
  return arr.reduce((sum, s) => sum + approxTokens(s), 0);
}

export async function ensureBudget(args: {
  supabaseAdmin: any;
  userId: string;
  tokensIn: number;
  tokensOut?: number;
}): Promise<void> {
  const { supabaseAdmin, userId, tokensIn, tokensOut = 0 } = args;
  const ym = ymNowUTC();

  // Prices and caps from secrets (in USD cents per 1k tokens)
  const inPer1k = Number(Deno.env.get('USAGE_PRICE_PER_1K_INPUT') || '0.00015');
  const outPer1k = Number(Deno.env.get('USAGE_PRICE_PER_1K_OUTPUT') || '0.00060');
  const userCap = Number(Deno.env.get('USAGE_USER_MONTHLY_CAP_CENTS') || '500');
  const projectCap = Number(Deno.env.get('USAGE_PROJECT_MONTHLY_CAP_CENTS') || '3000');

  // Current totals
  const { data: me } = await supabaseAdmin
    .from('ai_usage')
    .select('calls, tokens_in, tokens_out, cost_cents')
    .eq('user_id', userId)
    .eq('ym', ym)
    .maybeSingle();

  const { data: projectTotal } = await supabaseAdmin.rpc('sum_ai_cost_cents', { p_ym: ym });
  const projectSoFar = Number(Array.isArray(projectTotal) ? projectTotal[0]?.sum ?? 0 : projectTotal?.sum ?? projectTotal ?? 0);

  const nextTokensIn = (me?.tokens_in ?? 0) + tokensIn;
  const nextTokensOut = (me?.tokens_out ?? 0) + tokensOut;
  const nextCostCents =
    Math.round(((nextTokensIn / 1000) * inPer1k + (nextTokensOut / 1000) * outPer1k) * 100);

  const userSoFar = me?.cost_cents ?? 0;

  if (userSoFar + nextCostCents > userCap) {
    throw new Error('USER_BUDGET_EXCEEDED');
  }
  if (projectSoFar + nextCostCents > projectCap) {
    throw new Error('PROJECT_BUDGET_EXCEEDED');
  }
}

export async function recordUsage(args: {
  supabaseAdmin: any;
  userId: string;
  tokensIn: number;
  tokensOut: number;
}): Promise<void> {
  const { supabaseAdmin, userId, tokensIn, tokensOut } = args;
  const ym = ymNowUTC();

  const inPer1k = Number(Deno.env.get('USAGE_PRICE_PER_1K_INPUT') || '0.00015');
  const outPer1k = Number(Deno.env.get('USAGE_PRICE_PER_1K_OUTPUT') || '0.00060');
  const addCost = Math.round(((tokensIn / 1000) * inPer1k + (tokensOut / 1000) * outPer1k) * 100);

  await supabaseAdmin
    .from('ai_usage')
    .upsert({ user_id: userId, ym, calls: 0 })
    .eq('user_id', userId)
    .eq('ym', ym);

  await supabaseAdmin.rpc('increment_ai_usage', {
    p_user: userId,
    p_ym: ym,
    p_calls: 1,
    p_tokens_in: tokensIn,
    p_tokens_out: tokensOut,
    p_cost_cents: addCost,
  });
}

