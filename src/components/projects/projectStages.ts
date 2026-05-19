// Stage data for the Projects page hover infographic.
//
// The twist vs. the attendee map: a project isn't at ONE stage — most pick
// several ("Prototype / MVP, Active product with users, Community
// organizing"). So we model this as multi-select tags, surface a maturity
// pipeline (Idea → Prototype → Shipping), and call out how many projects
// wear multiple hats.
//
// Display-only flavor, kept local on purpose (the project dataset itself is
// KV-only and never committed).

export const RAW_STAGES: string[] = [
  'Active product with users',
  'Idea stage, Prototype / MVP, Funding / ecosystem support, Other',
  'Idea stage, Active product with users, Research project, Community organizing',
  'Prototype / MVP',
  'Prototype / MVP, Active product with users, Research project, Funding / ecosystem support, Community organizing, Other',
  'Active product with users, Research project, Funding / ecosystem support',
  'Other',
  'Other',
  'Active product with users, Other',
  'Active product with users, Research project, Funding / ecosystem support, Community organizing',
  'Other',
  'Idea stage, Prototype / MVP, Funding / ecosystem support, Community organizing',
  'Idea stage, Prototype / MVP, Active product with users, Research project, Funding / ecosystem support, Community organizing',
  'Prototype / MVP, Research project',
  'Other',
  'Active product with users',
  'Active product with users',
  'Prototype / MVP, Active product with users, Funding / ecosystem support, Community organizing',
  'Prototype / MVP',
  'Community organizing, Other',
  'Idea stage, Prototype / MVP, Research project, Funding / ecosystem support',
  'Active product with users, Research project, Funding / ecosystem support, Community organizing',
  'Idea stage, Prototype / MVP',
  'Funding / ecosystem support',
  'Prototype / MVP, Active product with users, Research project, Other',
  'Idea stage, Prototype / MVP',
  'Prototype / MVP',
  'Prototype / MVP, Active product with users',
  'Prototype / MVP, Active product with users, Research project, Funding / ecosystem support',
  'Idea stage',
  'Community organizing',
  'Prototype / MVP, Active product with users',
  'Other',
  'Funding / ecosystem support',
  'Prototype / MVP, Active product with users',
  'Prototype / MVP, Active product with users',
  'Community organizing',
  'Active product with users',
  'Idea stage, Prototype / MVP, Research project, Community organizing',
  'Idea stage, Prototype / MVP, Community organizing',
  'Idea stage, Prototype / MVP, Research project, Funding / ecosystem support',
  'Prototype / MVP, Active product with users',
  'Active product with users',
  'Active product with users',
  'Prototype / MVP, Active product with users',
  'Research project, Funding / ecosystem support, Community organizing',
  'Idea stage, Community organizing',
  'Active product with users',
  'Prototype / MVP, Active product with users, Research project',
  'Prototype / MVP',
  'Active product with users',
  'Prototype / MVP, Community organizing',
  'Prototype / MVP, Funding / ecosystem support, Community organizing',
  'Active product with users, Funding / ecosystem support',
  'Idea stage, Funding / ecosystem support, Community organizing',
  'Active product with users',
  'Prototype / MVP',
  'Active product with users',
  'Active product with users, Research project',
  'Active product with users',
  'Prototype / MVP, Active product with users, Community organizing',
  'Active product with users, Funding / ecosystem support, Community organizing',
  'Active product with users, Funding / ecosystem support, Community organizing',
  'Prototype / MVP, Active product with users, Research project, Funding / ecosystem support, Community organizing',
  'Active product with users, Community organizing, Other',
  'Prototype / MVP',
  'Active product with users, Community organizing',
  'Research project, Community organizing',
  'Active product with users',
  'Active product with users',
  'Active product with users, Community organizing',
  'Funding / ecosystem support, Community organizing',
  'Other',
  'Active product with users',
  'Active product with users, Community organizing',
  'Prototype / MVP, Active product with users',
  'Idea stage, Prototype / MVP, Active product with users, Research project, Funding / ecosystem support, Community organizing',
  'Active product with users, Community organizing',
  'Prototype / MVP, Active product with users',
  'Active product with users',
  'Prototype / MVP, Research project, Funding / ecosystem support',
  'Idea stage, Community organizing, Other',
  'Prototype / MVP, Active product with users',
  'Idea stage',
  'Prototype / MVP, Active product with users',
  'Active product with users',
  'Prototype / MVP, Active product with users, Other',
  'Active product with users',
];

export type Stage =
  | 'Idea stage'
  | 'Prototype / MVP'
  | 'Active product with users'
  | 'Research project'
  | 'Funding / ecosystem support'
  | 'Community organizing'
  | 'Other';

// The first three form a maturity ladder; the rest are cross-cutting.
export const PIPELINE: Stage[] = [
  'Idea stage',
  'Prototype / MVP',
  'Active product with users',
];

export const CROSSCUTTING: Stage[] = [
  'Research project',
  'Funding / ecosystem support',
  'Community organizing',
  'Other',
];

const STAGE_ORDER: Stage[] = [...PIPELINE, ...CROSSCUTTING];

export const STAGE_SHORT: Record<Stage, string> = {
  'Idea stage': 'Idea',
  'Prototype / MVP': 'Prototype / MVP',
  'Active product with users': 'Shipping to users',
  'Research project': 'Research',
  'Funding / ecosystem support': 'Funding / ecosystem',
  'Community organizing': 'Community organizing',
  Other: 'Other',
};

function parseStages(raw: string): Stage[] {
  const out: Stage[] = [];
  for (const part of raw.split(',')) {
    const t = part.trim();
    const match = STAGE_ORDER.find((s) => s === t);
    if (match && !out.includes(match)) out.push(match);
  }
  return out;
}

export interface StageTally {
  stage: Stage;
  count: number;
}

export interface StageStats {
  total: number;
  byStage: StageTally[]; // every stage, ranked by count desc
  pipeline: StageTally[]; // Idea → Prototype → Shipping, in ladder order
  crosscutting: StageTally[]; // research/funding/community/other, ranked
  shippingCount: number; // projects with "Active product with users"
  ideaOnlyCount: number; // projects whose only pipeline stage is Idea
  multiHatCount: number; // projects spanning 3+ stages
  avgStages: number;
  maxStages: number;
}

export function computeStageStats(): StageStats {
  const counts = new Map<Stage, number>();
  let stagesSum = 0;
  let maxStages = 0;
  let multiHat = 0;

  for (const raw of RAW_STAGES) {
    const stages = parseStages(raw);
    stagesSum += stages.length;
    maxStages = Math.max(maxStages, stages.length);
    if (stages.length >= 3) multiHat += 1;
    for (const s of stages) counts.set(s, (counts.get(s) ?? 0) + 1);
  }

  const tally = (stage: Stage): StageTally => ({
    stage,
    count: counts.get(stage) ?? 0,
  });

  const byStage = STAGE_ORDER.map(tally).sort((a, b) => b.count - a.count);

  return {
    total: RAW_STAGES.length,
    byStage,
    pipeline: PIPELINE.map(tally),
    crosscutting: CROSSCUTTING.map(tally).sort((a, b) => b.count - a.count),
    shippingCount: counts.get('Active product with users') ?? 0,
    ideaOnlyCount: RAW_STAGES.filter((r) => {
      const s = parseStages(r);
      return s.includes('Idea stage') && !s.includes('Active product with users');
    }).length,
    multiHatCount: multiHat,
    avgStages: stagesSum / RAW_STAGES.length,
    maxStages,
  };
}
