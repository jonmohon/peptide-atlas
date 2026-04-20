/**
 * Achievement catalog + unlock helpers. Achievements are tied to meaningful milestones
 * (first bloodwork, first visible improvement, cycle completion) — not participation.
 * Client-side `maybeUnlock` performs idempotent checks against the Achievement model.
 */

import { dataClient } from '@/lib/amplify-data';

export type AchievementCode =
  | 'FIRST_JOURNAL'
  | 'WEEK_STREAK'
  | 'MONTH_STREAK'
  | 'FIRST_PROTOCOL'
  | 'FIRST_PUBLISHED_PROTOCOL'
  | 'FIRST_BLOODWORK'
  | 'FIRST_BLOODWORK_IMPROVEMENT'
  | 'FIRST_UPVOTE_RECEIVED'
  | 'CYCLE_COMPLETER'
  | 'FIRST_PHOTO'
  | 'FIRST_EXECUTION_PLAN';

interface AchievementDef {
  code: AchievementCode;
  title: string;
  description: string;
  iconKey: string;
}

export const ACHIEVEMENTS: Record<AchievementCode, AchievementDef> = {
  FIRST_JOURNAL: {
    code: 'FIRST_JOURNAL',
    title: 'First Entry',
    description: 'Logged your first journal entry.',
    iconKey: '📝',
  },
  WEEK_STREAK: {
    code: 'WEEK_STREAK',
    title: 'Week Streak',
    description: 'Logged 7 consecutive days.',
    iconKey: '🔥',
  },
  MONTH_STREAK: {
    code: 'MONTH_STREAK',
    title: 'Month Streak',
    description: 'Logged 30 consecutive days.',
    iconKey: '🏆',
  },
  FIRST_PROTOCOL: {
    code: 'FIRST_PROTOCOL',
    title: 'First Protocol',
    description: 'Saved your first peptide protocol.',
    iconKey: '📋',
  },
  FIRST_PUBLISHED_PROTOCOL: {
    code: 'FIRST_PUBLISHED_PROTOCOL',
    title: 'First Publication',
    description: 'Shared a protocol with the community.',
    iconKey: '🌐',
  },
  FIRST_BLOODWORK: {
    code: 'FIRST_BLOODWORK',
    title: 'Data-Driven',
    description: 'Logged your first bloodwork panel.',
    iconKey: '🧪',
  },
  FIRST_BLOODWORK_IMPROVEMENT: {
    code: 'FIRST_BLOODWORK_IMPROVEMENT',
    title: 'Measurable Progress',
    description: 'A marker improved from abnormal to normal between panels.',
    iconKey: '📈',
  },
  FIRST_UPVOTE_RECEIVED: {
    code: 'FIRST_UPVOTE_RECEIVED',
    title: 'Community Validated',
    description: 'Someone upvoted your published protocol.',
    iconKey: '👍',
  },
  CYCLE_COMPLETER: {
    code: 'CYCLE_COMPLETER',
    title: 'Cycle Completer',
    description: 'Completed a 12+ week cycle with consistent journaling.',
    iconKey: '🎯',
  },
  FIRST_PHOTO: {
    code: 'FIRST_PHOTO',
    title: 'Visual Baseline',
    description: 'Uploaded your first progress photo.',
    iconKey: '📸',
  },
  FIRST_EXECUTION_PLAN: {
    code: 'FIRST_EXECUTION_PLAN',
    title: 'Protocol Active',
    description: 'Turned a stack into a live execution plan.',
    iconKey: '🚀',
  },
};

export async function maybeUnlock(
  code: AchievementCode,
  meta?: Record<string, unknown>,
): Promise<boolean> {
  try {
    const { data } = await dataClient.models.Achievement.list({
      filter: { code: { eq: code } },
      limit: 1,
    });
    if (data && data.length > 0) return false;

    const def = ACHIEVEMENTS[code];
    await dataClient.models.Achievement.create({
      code,
      title: def.title,
      description: def.description,
      iconKey: def.iconKey,
      unlockedAt: new Date().toISOString(),
      meta: meta ?? null,
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('atlas-achievement', {
          detail: { code, title: def.title, description: def.description, iconKey: def.iconKey },
        }),
      );
    }
    return true;
  } catch (err) {
    console.warn('maybeUnlock failed:', err);
    return false;
  }
}
