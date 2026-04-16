export type Tier = 'FREE' | 'PRO' | 'PRO_PLUS';

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  tier: Tier;
}

export const TIER_LIMITS = {
  FREE: {
    aiCallsPerDay: 5,
    maxSavedStacks: 0,
    maxSavedProtocols: 0,
    journalHistoryDays: 7,
    maxNotes: 10,
    maxBloodworkPanels: 0,
    maxPhotosPerMonth: 0,
  },
  PRO: {
    aiCallsPerDay: Infinity,
    maxSavedStacks: 50,
    maxSavedProtocols: 20,
    journalHistoryDays: Infinity,
    maxNotes: Infinity,
    maxBloodworkPanels: 2,
    maxPhotosPerMonth: 5,
  },
  PRO_PLUS: {
    aiCallsPerDay: Infinity,
    maxSavedStacks: Infinity,
    maxSavedProtocols: Infinity,
    journalHistoryDays: Infinity,
    maxNotes: Infinity,
    maxBloodworkPanels: Infinity,
    maxPhotosPerMonth: Infinity,
  },
} as const;

export function canAccessFeature(tier: Tier, feature: PremiumFeature): boolean {
  return FEATURE_ACCESS[feature].includes(tier);
}

export type PremiumFeature =
  | 'ai_unlimited'
  | 'save_stacks'
  | 'save_protocols'
  | 'reconstitution_calc'
  | 'cycle_planner'
  | 'dosing_schedule'
  | 'comparison_insights'
  | 'mechanism_advanced'
  | 'bloodwork_tracker'
  | 'bloodwork_ai'
  | 'research_digest'
  | 'community_publish'
  | 'journal_full'
  | 'journal_metrics'
  | 'journal_photos'
  | 'ai_insight_weekly'
  | 'ai_insight_monthly'
  | 'notes_full'
  | 'ai_profile_full'
  | 'protocol_chat'
  | 'trend_charts_full';

const FEATURE_ACCESS: Record<PremiumFeature, Tier[]> = {
  ai_unlimited: ['PRO', 'PRO_PLUS'],
  save_stacks: ['PRO', 'PRO_PLUS'],
  save_protocols: ['PRO', 'PRO_PLUS'],
  reconstitution_calc: ['PRO', 'PRO_PLUS'],
  cycle_planner: ['PRO', 'PRO_PLUS'],
  dosing_schedule: ['PRO', 'PRO_PLUS'],
  comparison_insights: ['PRO', 'PRO_PLUS'],
  mechanism_advanced: ['PRO', 'PRO_PLUS'],
  bloodwork_tracker: ['PRO_PLUS'],
  bloodwork_ai: ['PRO_PLUS'],
  research_digest: ['PRO_PLUS'],
  community_publish: ['PRO_PLUS'],
  journal_full: ['PRO', 'PRO_PLUS'],
  journal_metrics: ['PRO', 'PRO_PLUS'],
  journal_photos: ['PRO', 'PRO_PLUS'],
  ai_insight_weekly: ['PRO_PLUS'],
  ai_insight_monthly: ['PRO', 'PRO_PLUS'],
  notes_full: ['PRO', 'PRO_PLUS'],
  ai_profile_full: ['PRO', 'PRO_PLUS'],
  protocol_chat: ['PRO', 'PRO_PLUS'],
  trend_charts_full: ['PRO_PLUS'],
};
