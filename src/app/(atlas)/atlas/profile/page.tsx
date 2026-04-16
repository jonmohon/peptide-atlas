'use client';

/**
 * User profile page — collects goals, experience level, body stats, health conditions,
 * allergies, and current protocol summary that are injected into every AI prompt.
 */

import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { dataClient } from '@/lib/amplify-data';
import { cn } from '@/lib/utils';

const GOAL_OPTIONS = [
  'Healing & Recovery', 'Muscle Growth', 'Fat Loss', 'Cognitive Enhancement',
  'Anti-Aging', 'Sleep & Recovery', 'Immune Support', 'Sexual Health',
  'Gut Health', 'Joint Health', 'Skin & Hair', 'Athletic Performance',
];

const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'];

interface ProfileData {
  id?: string;
  goals: string[];
  experienceLevel: string;
  currentProtocolSummary: string;
  healthConditions: string[];
  allergies: string[];
  weight: number | null;
  heightCm: number | null;
  age: number | null;
  sex: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    goals: [], experienceLevel: 'beginner', currentProtocolSummary: '',
    healthConditions: [], allergies: [], weight: null, heightCm: null, age: null, sex: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [conditionInput, setConditionInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: profiles } = await dataClient.models.UserProfile.list();
      const p = profiles?.[0];
      if (p) {
        setProfile({
          id: p.id,
          goals: (p.goals ?? []).filter((g): g is string => g !== null),
          experienceLevel: p.experienceLevel ?? 'beginner',
          currentProtocolSummary: p.currentProtocolSummary ?? '',
          healthConditions: (p.healthConditions ?? []).filter((h): h is string => h !== null),
          allergies: (p.allergies ?? []).filter((a): a is string => a !== null),
          weight: p.weight ?? null,
          heightCm: p.heightCm ?? null,
          age: p.age ?? null,
          sex: p.sex ?? '',
        });
      } else {
        // Create initial profile
        const user = await getCurrentUser();
        const { data: created } = await dataClient.models.UserProfile.create({
          email: user.signInDetails?.loginId ?? '',
          name: user.username ?? null,
          tier: 'FREE',
        });
        if (created) setProfile((prev) => ({ ...prev, id: created.id }));
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!profile.id) return;
    setSaving(true);
    try {
      await dataClient.models.UserProfile.update({
        id: profile.id,
        goals: profile.goals,
        experienceLevel: profile.experienceLevel,
        currentProtocolSummary: profile.currentProtocolSummary || null,
        healthConditions: profile.healthConditions,
        allergies: profile.allergies,
        weight: profile.weight,
        heightCm: profile.heightCm,
        age: profile.age,
        sex: profile.sex || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  }

  const toggleGoal = (goal: string) => {
    setProfile((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const addCondition = () => {
    if (!conditionInput.trim()) return;
    setProfile((prev) => ({ ...prev, healthConditions: [...prev.healthConditions, conditionInput.trim()] }));
    setConditionInput('');
  };

  const addAllergy = () => {
    if (!allergyInput.trim()) return;
    setProfile((prev) => ({ ...prev, allergies: [...prev.allergies, allergyInput.trim()] }));
    setAllergyInput('');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/[0.05] rounded w-48" />
          <div className="h-40 bg-white/[0.05] rounded-xl" />
          <div className="h-40 bg-white/[0.05] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
          <p className="text-sm text-text-secondary mt-1">
            This information helps the AI personalize every recommendation to you.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'px-5 py-2 rounded-xl text-sm font-semibold transition-all',
            saved
              ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
              : 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30'
          )}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Goals */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Your Goals</h2>
          <p className="text-xs text-text-secondary mb-4">Select all that apply. The AI will prioritize recommendations based on these.</p>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                  profile.goals.includes(goal)
                    ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30'
                    : 'bg-white/[0.03] text-text-secondary border-white/[0.06] hover:bg-white/[0.06]'
                )}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Experience Level</h2>
          <div className="flex gap-3">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setProfile((prev) => ({ ...prev, experienceLevel: level }))}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border capitalize',
                  profile.experienceLevel === level
                    ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30'
                    : 'bg-white/[0.03] text-text-secondary border-white/[0.06] hover:bg-white/[0.06]'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Body Stats */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Body Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Age</label>
              <input
                type="number"
                value={profile.age ?? ''}
                onChange={(e) => setProfile((prev) => ({ ...prev, age: e.target.value ? Number(e.target.value) : null }))}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Sex</label>
              <select
                value={profile.sex}
                onChange={(e) => setProfile((prev) => ({ ...prev, sex: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
              >
                <option value="" className="bg-[#111827]">—</option>
                <option value="male" className="bg-[#111827]">Male</option>
                <option value="female" className="bg-[#111827]">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Weight (lbs)</label>
              <input
                type="number"
                value={profile.weight ?? ''}
                onChange={(e) => setProfile((prev) => ({ ...prev, weight: e.target.value ? Number(e.target.value) : null }))}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Height (cm)</label>
              <input
                type="number"
                value={profile.heightCm ?? ''}
                onChange={(e) => setProfile((prev) => ({ ...prev, heightCm: e.target.value ? Number(e.target.value) : null }))}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
                placeholder="—"
              />
            </div>
          </div>
        </div>

        {/* Health Conditions */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Health Conditions</h2>
          <p className="text-xs text-text-secondary mb-3">The AI will avoid recommending peptides that conflict with your conditions.</p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={conditionInput}
              onChange={(e) => setConditionInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCondition()}
              placeholder="e.g., Type 2 Diabetes, Hypertension..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50"
            />
            <button onClick={addCondition} className="px-3 py-2 rounded-lg bg-white/[0.05] text-xs text-text-secondary hover:text-foreground">Add</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.healthConditions.map((c) => (
              <span key={c} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs">
                {c}
                <button onClick={() => setProfile((prev) => ({ ...prev, healthConditions: prev.healthConditions.filter((h) => h !== c) }))} className="hover:text-red-400">&times;</button>
              </span>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Allergies & Sensitivities</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addAllergy()}
              placeholder="e.g., Shellfish, Penicillin..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50"
            />
            <button onClick={addAllergy} className="px-3 py-2 rounded-lg bg-white/[0.05] text-xs text-text-secondary hover:text-foreground">Add</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.allergies.map((a) => (
              <span key={a} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 text-xs">
                {a}
                <button onClick={() => setProfile((prev) => ({ ...prev, allergies: prev.allergies.filter((al) => al !== a) }))} className="hover:text-red-400">&times;</button>
              </span>
            ))}
          </div>
        </div>

        {/* Current Protocol */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Current Protocol</h2>
          <p className="text-xs text-text-secondary mb-3">Describe what you are currently taking. The AI will reference this in every conversation.</p>
          <textarea
            value={profile.currentProtocolSummary}
            onChange={(e) => setProfile((prev) => ({ ...prev, currentProtocolSummary: e.target.value }))}
            placeholder="e.g., BPC-157 250mcg subQ AM, Ipamorelin 200mcg subQ before bed, 5 days on / 2 days off, currently on week 3..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50 resize-none"
          />
        </div>

        {/* AI Context Preview */}
        <div className="glass rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 className="text-sm font-semibold text-foreground">What the AI Knows About You</h2>
          </div>
          <div className="text-xs text-text-secondary space-y-1 font-mono bg-white/[0.02] rounded-lg p-3">
            {profile.goals.length > 0 && <p>Goals: {profile.goals.join(', ')}</p>}
            {profile.experienceLevel && <p>Experience: {profile.experienceLevel}</p>}
            {profile.sex && <p>Sex: {profile.sex}</p>}
            {profile.age && <p>Age: {profile.age}</p>}
            {profile.weight && <p>Weight: {profile.weight} lbs</p>}
            {profile.healthConditions.length > 0 && <p>Conditions: {profile.healthConditions.join(', ')}</p>}
            {profile.allergies.length > 0 && <p>Allergies: {profile.allergies.join(', ')}</p>}
            {profile.currentProtocolSummary && <p>Protocol: {profile.currentProtocolSummary}</p>}
            {!profile.goals.length && !profile.sex && !profile.weight && (
              <p className="text-white/20">Fill in your profile above to see what the AI will know about you.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
