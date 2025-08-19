import { supabase } from './supabase';
import { z } from 'zod';

function extractEdgeError(err: any): Error {
  try {
    const ctx = err?.context;
    if (ctx?.body) {
      const text = typeof ctx.body === 'string' ? ctx.body : JSON.stringify(ctx.body);
      try { const j = JSON.parse(text); if (j?.error) return new Error(String(j.error)); return new Error(text) } catch { return new Error(text) }
    }
  } catch {}
  return new Error(String(err?.message || 'Edge Function error'));
}

async function invoke<T>(name: string, body: any): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw extractEdgeError(error);
  return data as T;
}

const ClassifyZ = z.object({
  service_slug: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  refined_description: z.string().optional().default(''),
  risks: z.array(z.string()).optional().default([]),
  missing_info: z.array(z.string()).optional().default([]),
});
export async function aiClassifyJob(b:{title:string;description:string;city:string;photos?:string[]}){
  const data = await invoke<any>('classify-job', b);
  return ClassifyZ.parse(data);
}

const RankZ = z.array(z.object({ contractor_id: z.string(), score: z.number() }));
export async function aiMatchContractors(jobId:string){
  const data = await invoke<any>('match-contractors', { jobId });
  return RankZ.parse(data);
}

const EstimateZ = z.object({
  cost_low:z.number().optional(), cost_high:z.number().optional(), days:z.number().optional(),
  assumptions:z.array(z.string()).optional().default([]), exclusions:z.array(z.string()).optional().default([])
});
export async function aiEstimateJob(b:{title:string;description:string;city:string;service_slug:string;photos?:string[]}){
  const data = await invoke<any>('estimate-job', b);
  return EstimateZ.parse(data);
}

const SuggestZ = z.object({ reply:z.string().optional().default('') });
export async function aiSuggestReply(history:{role:'user'|'contractor'|'system',content:string}[], locale?:string){
  const data = await invoke<any>('suggest-reply', { threadHistory:history, locale });
  return SuggestZ.parse(data);
}

export async function aiExplainEstimate(b:{title?:string;description?:string;city?:string;service_slug?:string;assumptions?:string[];exclusions?:string[]}){
  return invoke<{ bullets: string[] }>('explain-estimate', b);
}
export async function aiExplainRanking(b:{ jobId:string; contractors:{ id:string; score?:number; features?:Record<string,any> }[] }){
  return invoke<{ explanations: string }>('explain-ranking', b);
}

export async function upsertProfileEmbedding(profileId:string){
  await invoke('upsert-profile-embedding', { profileId });
}
export async function upsertJobEmbedding(jobId:string){
  await invoke('upsert-job-embedding', { jobId });
}
