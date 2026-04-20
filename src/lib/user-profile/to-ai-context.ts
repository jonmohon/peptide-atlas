/**
 * Converts an AtlasContext into a compact ~1K token block for AI system prompts.
 * Client sends this with AI requests; server injects it after the base peptide-database
 * prompt so every AI response is personalized to what we actually know.
 */

import type { AtlasContext } from './aggregate';

export function atlasContextToPrompt(ctx: AtlasContext): string {
  if (!ctx.userId && ctx.profile.goals.length === 0) return '';

  const lines: string[] = [];
  const p = ctx.profile;

  lines.push('--- USER PROFILE (what you know about this user) ---');
  if (p.name) lines.push(`Name: ${p.name}`);
  if (p.tier && p.tier !== 'FREE') lines.push(`Tier: ${p.tier}`);
  if (p.sex) lines.push(`Sex: ${p.sex}`);
  if (p.age) lines.push(`Age: ${p.age}`);
  if (p.weight) lines.push(`Weight: ${p.weight} lbs`);
  if (p.heightCm) lines.push(`Height: ${p.heightCm} cm`);
  if (p.experienceLevel) lines.push(`Peptide experience: ${p.experienceLevel}`);
  if (p.goals.length) lines.push(`Goals: ${p.goals.join(', ')}`);
  if (p.healthConditions.length)
    lines.push(`Health conditions (avoid contraindicated peptides): ${p.healthConditions.join(', ')}`);
  if (p.allergies.length) lines.push(`Allergies / sensitivities: ${p.allergies.join(', ')}`);
  if (p.currentProtocolSummary)
    lines.push(`User-declared current protocol: ${p.currentProtocolSummary}`);

  if (ctx.activeProtocol) {
    lines.push('');
    lines.push(
      `Active protocol (${ctx.activeProtocol.cycleName}, ${ctx.activeProtocol.durationWeeks}w` +
        (ctx.activeProtocol.startDate ? `, started ${ctx.activeProtocol.startDate}` : '') +
        '):',
    );
    for (const e of ctx.activeProtocol.entries) {
      lines.push(
        `  - ${e.peptide}: ${e.dose} ${e.unit}` +
          (e.pattern ? `, ${e.pattern}` : '') +
          (e.timeOfDay ? `, ${e.timeOfDay}` : ''),
      );
    }
  }

  const j = ctx.recentJournal;
  if (j.entryCount > 0) {
    lines.push('');
    lines.push(
      `Last ${j.entryCount} journal entr${j.entryCount === 1 ? 'y' : 'ies'}` +
        (j.dayRangeStart && j.dayRangeEnd
          ? ` (${j.dayRangeStart} → ${j.dayRangeEnd})`
          : '') +
        `, streak ${j.currentStreakDays}d:`,
    );
    const parts: string[] = [];
    if (j.averages.mood != null) parts.push(`mood ${j.averages.mood}/10`);
    if (j.averages.energy != null) parts.push(`energy ${j.averages.energy}/10`);
    if (j.averages.sleepQuality != null)
      parts.push(`sleep-quality ${j.averages.sleepQuality}/10`);
    if (j.averages.sleepHours != null) parts.push(`sleep ${j.averages.sleepHours}h`);
    if (j.averages.weight != null) parts.push(`weight ${j.averages.weight} lbs`);
    if (parts.length) lines.push(`  Averages: ${parts.join(', ')}`);
    if (j.recentSideEffects.length)
      lines.push(`  Recent side effects: ${j.recentSideEffects.join(', ')}`);
  }

  if (ctx.latestBloodwork) {
    lines.push('');
    lines.push(
      `Latest bloodwork (${ctx.latestBloodwork.date}${ctx.latestBloodwork.labName ? `, ${ctx.latestBloodwork.labName}` : ''}):`,
    );
    if (ctx.latestBloodwork.flaggedMarkers.length === 0) {
      lines.push(`  All markers in reference range.`);
    } else {
      lines.push(
        `  Flagged: ` +
          ctx.latestBloodwork.flaggedMarkers
            .map((m) => `${m.name} ${m.value}${m.unit} [${m.flag}]`)
            .join(', '),
      );
    }
  }

  lines.push('');
  lines.push(
    'Use this profile to personalize every response. Respect contraindications. Do not re-ask information you already know. If you suggest a new peptide or dose, explain why it matches this specific user.',
  );
  lines.push('--- END USER PROFILE ---');

  return `\n${lines.join('\n')}\n`;
}

/**
 * A lean variant (~300 tokens) for endpoints with tight token budgets.
 */
export function atlasContextToCompactPrompt(ctx: AtlasContext): string {
  const p = ctx.profile;
  const parts: string[] = [];
  if (p.experienceLevel) parts.push(`experience: ${p.experienceLevel}`);
  if (p.goals.length) parts.push(`goals: ${p.goals.slice(0, 3).join('/')}`);
  if (p.sex) parts.push(`sex: ${p.sex}`);
  if (p.age) parts.push(`age: ${p.age}`);
  if (p.weight) parts.push(`${p.weight}lbs`);
  if (p.healthConditions.length) parts.push(`conditions: ${p.healthConditions.join('/')}`);
  if (ctx.activeProtocol?.peptideNames.length)
    parts.push(`on: ${ctx.activeProtocol.peptideNames.join('+')}`);
  if (parts.length === 0) return '';
  return `\nUser: ${parts.join(' | ')}.\n`;
}
