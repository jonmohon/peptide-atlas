'use client';

/**
 * Bloodwork tracker — lets users log lab panels with common and custom markers,
 * then streams an AI interpretation from /api/ai/bloodwork. Results are cached in DynamoDB.
 */

import { useState, useEffect } from 'react';
import { dataClient } from '@/lib/amplify-data';
import { cn } from '@/lib/utils';
import { BloodworkUploadParser } from '@/components/bloodwork/upload-parser';
import type { BloodworkParse } from '@/lib/ai/schemas';
import { maybeUnlock } from '@/lib/achievements';

interface Marker {
  name: string;
  value: number;
  unit: string;
  referenceRange: string;
  flag: 'normal' | 'high' | 'low';
}

interface BloodworkEntry {
  id: string;
  date: string;
  labName: string | null;
  markers: Marker[];
  aiInterpretation: string | null;
  notes: string | null;
}

const COMMON_MARKERS = [
  { name: 'IGF-1', unit: 'ng/mL', ref: '83-456' },
  { name: 'Testosterone (Total)', unit: 'ng/dL', ref: '300-1000' },
  { name: 'Testosterone (Free)', unit: 'pg/mL', ref: '5-21' },
  { name: 'Estradiol (E2)', unit: 'pg/mL', ref: '10-40' },
  { name: 'Fasting Glucose', unit: 'mg/dL', ref: '70-100' },
  { name: 'HbA1c', unit: '%', ref: '4.0-5.6' },
  { name: 'ALT', unit: 'U/L', ref: '7-56' },
  { name: 'AST', unit: 'U/L', ref: '10-40' },
  { name: 'GGT', unit: 'U/L', ref: '9-48' },
  { name: 'Total Cholesterol', unit: 'mg/dL', ref: '<200' },
  { name: 'LDL', unit: 'mg/dL', ref: '<100' },
  { name: 'HDL', unit: 'mg/dL', ref: '>40' },
  { name: 'Triglycerides', unit: 'mg/dL', ref: '<150' },
  { name: 'TSH', unit: 'mIU/L', ref: '0.4-4.0' },
  { name: 'Free T4', unit: 'ng/dL', ref: '0.8-1.8' },
  { name: 'Creatinine', unit: 'mg/dL', ref: '0.7-1.3' },
  { name: 'BUN', unit: 'mg/dL', ref: '7-20' },
  { name: 'Hemoglobin', unit: 'g/dL', ref: '13.5-17.5' },
  { name: 'Hematocrit', unit: '%', ref: '38-50' },
  { name: 'CRP (hs)', unit: 'mg/L', ref: '<3.0' },
];

export default function BloodworkPage() {
  const [panels, setPanels] = useState<BloodworkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<BloodworkEntry | null>(null);

  // New panel form
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLabName, setNewLabName] = useState('');
  const [newMarkers, setNewMarkers] = useState<Marker[]>([]);
  const [newNotes, setNewNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // AI interpretation
  const [interpreting, setInterpreting] = useState(false);
  const [interpretation, setInterpretation] = useState('');

  useEffect(() => { loadPanels(); }, []);

  async function loadPanels() {
    try {
      const { data } = await dataClient.models.BloodworkPanel.list();
      const mapped: BloodworkEntry[] = (data ?? []).map((p) => ({
        id: p.id,
        date: p.date,
        labName: p.labName ?? null,
        markers: (p.markers as Marker[]) ?? [],
        aiInterpretation: p.aiInterpretation ?? null,
        notes: p.notes ?? null,
      })).sort((a, b) => b.date.localeCompare(a.date));
      setPanels(mapped);
    } catch (err) {
      console.error('Failed to load bloodwork:', err);
    } finally {
      setLoading(false);
    }
  }

  function addMarkerRow() {
    setNewMarkers((prev) => [...prev, { name: '', value: 0, unit: '', referenceRange: '', flag: 'normal' }]);
  }

  function addCommonMarker(common: typeof COMMON_MARKERS[0]) {
    setNewMarkers((prev) => [...prev, { name: common.name, value: 0, unit: common.unit, referenceRange: common.ref, flag: 'normal' }]);
  }

  function updateMarker(index: number, field: keyof Marker, value: string | number) {
    setNewMarkers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function removeMarker(index: number) {
    setNewMarkers((prev) => prev.filter((_, i) => i !== index));
  }

  function handleParsed(parsed: BloodworkParse) {
    const mapped: Marker[] = parsed.markers.map((m) => ({
      name: m.name,
      value: m.value,
      unit: m.unit,
      referenceRange: m.referenceRange,
      flag: m.flag,
    }));
    setNewMarkers(mapped);
    if (parsed.labName) setNewLabName(parsed.labName);
    if (parsed.collectionDate) setNewDate(parsed.collectionDate);
    if (parsed.warnings?.length) setNewNotes(`Parse warnings: ${parsed.warnings.join(' • ')}`);
    setShowAdd(true);
  }

  async function handleSave() {
    if (newMarkers.length === 0) return;
    setSaving(true);
    try {
      await dataClient.models.BloodworkPanel.create({
        date: newDate,
        labName: newLabName || null,
        markers: JSON.stringify(newMarkers),
        notes: newNotes || null,
        parsedByAi: false,
      });
      await maybeUnlock('FIRST_BLOODWORK');
      setShowAdd(false);
      setNewMarkers([]);
      setNewNotes('');
      setNewLabName('');
      await loadPanels();
    } catch (err) {
      console.error('Failed to save bloodwork:', err);
    } finally {
      setSaving(false);
    }
  }

  async function getInterpretation(panel: BloodworkEntry) {
    setSelectedPanel(panel);
    if (panel.aiInterpretation) {
      setInterpretation(panel.aiInterpretation);
      return;
    }

    setInterpreting(true);
    setInterpretation('');
    try {
      const res = await fetch('/api/ai/bloodwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markers: panel.markers, labDate: panel.date }),
      });

      if (!res.ok) return;

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setInterpretation(text);
      }

      // Cache interpretation
      await dataClient.models.BloodworkPanel.update({
        id: panel.id,
        aiInterpretation: text,
      });
    } catch {
      setInterpretation('Failed to get interpretation.');
    } finally {
      setInterpreting(false);
    }
  }

  const flagColor = (flag: string) => {
    if (flag === 'high') return 'text-red-400';
    if (flag === 'low') return 'text-amber-400';
    return 'text-neon-green';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => window.history.back()} className="text-xs text-text-secondary hover:text-neon-cyan transition-colors">
          &larr; Journal
        </button>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bloodwork Tracker</h1>
          <p className="text-sm text-text-secondary mt-1">Log lab results and get AI-powered interpretation.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all text-sm font-semibold"
        >
          + Add Panel
        </button>
      </div>

      {/* AI PDF Upload & Parse */}
      <div className="mb-6">
        <BloodworkUploadParser onParsed={handleParsed} />
      </div>

      {/* Add Panel Form */}
      {showAdd && (
        <div className="glass-bright rounded-2xl p-6 mb-6 border border-neon-cyan/20">
          <h2 className="text-sm font-semibold text-foreground mb-4">New Bloodwork Panel</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Lab Date</label>
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Lab Name</label>
              <input type="text" value={newLabName} onChange={(e) => setNewLabName(e.target.value)} placeholder="e.g., Quest, LabCorp"
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50" />
            </div>
          </div>

          {/* Quick-add common markers */}
          <div className="mb-4">
            <label className="block text-xs text-text-secondary mb-2">Quick Add Common Markers</label>
            <div className="flex flex-wrap gap-1">
              {COMMON_MARKERS.filter((cm) => !newMarkers.some((m) => m.name === cm.name)).slice(0, 12).map((cm) => (
                <button
                  key={cm.name}
                  onClick={() => addCommonMarker(cm)}
                  className="px-2 py-1 rounded-full bg-white/[0.04] text-[10px] text-text-secondary hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all border border-white/[0.06]"
                >
                  + {cm.name}
                </button>
              ))}
            </div>
          </div>

          {/* Marker table */}
          {newMarkers.length > 0 && (
            <div className="mb-4 space-y-2">
              {newMarkers.map((marker, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input type="text" value={marker.name} onChange={(e) => updateMarker(i, 'name', e.target.value)} placeholder="Marker"
                    className="col-span-3 px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-foreground focus:outline-none focus:border-neon-cyan/50" />
                  <input type="number" value={marker.value || ''} onChange={(e) => updateMarker(i, 'value', Number(e.target.value))} placeholder="Value"
                    className="col-span-2 px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-foreground focus:outline-none focus:border-neon-cyan/50" />
                  <input type="text" value={marker.unit} onChange={(e) => updateMarker(i, 'unit', e.target.value)} placeholder="Unit"
                    className="col-span-2 px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-foreground focus:outline-none focus:border-neon-cyan/50" />
                  <input type="text" value={marker.referenceRange} onChange={(e) => updateMarker(i, 'referenceRange', e.target.value)} placeholder="Ref range"
                    className="col-span-2 px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-foreground focus:outline-none focus:border-neon-cyan/50" />
                  <select value={marker.flag} onChange={(e) => updateMarker(i, 'flag', e.target.value)}
                    className="col-span-2 px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-foreground focus:outline-none focus:border-neon-cyan/50">
                    <option value="normal" className="bg-[#111827]">Normal</option>
                    <option value="high" className="bg-[#111827]">High</option>
                    <option value="low" className="bg-[#111827]">Low</option>
                  </select>
                  <button onClick={() => removeMarker(i)} className="col-span-1 p-1 text-text-secondary hover:text-red-400 transition-colors text-center">&times;</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <button onClick={addMarkerRow} className="text-xs text-neon-cyan hover:text-neon-cyan/80">+ Add Custom Marker</button>
          </div>

          <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Notes about this panel..." rows={2}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50 resize-none mb-4" />

          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs text-text-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving || newMarkers.length === 0}
              className="px-4 py-1.5 rounded-lg bg-neon-green/20 text-neon-green text-xs font-medium border border-neon-green/30 hover:bg-neon-green/30 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Panel'}
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Panels list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Your Panels</h2>
          {loading ? (
            <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-24 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
          ) : panels.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-text-secondary">No bloodwork panels yet. Add your first panel above.</p>
            </div>
          ) : (
            panels.map((panel) => (
              <button
                key={panel.id}
                onClick={() => getInterpretation(panel)}
                className={cn(
                  'w-full text-left glass rounded-xl p-4 hover:bg-white/[0.03] transition-colors',
                  selectedPanel?.id === panel.id && 'border border-neon-cyan/30'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {new Date(panel.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {panel.labName && <span className="text-[10px] text-text-secondary">{panel.labName}</span>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {panel.markers.slice(0, 5).map((m, i) => (
                    <span key={i} className={cn('text-[10px] px-1.5 py-0.5 rounded', flagColor(m.flag), m.flag === 'normal' ? 'bg-neon-green/10' : m.flag === 'high' ? 'bg-red-500/10' : 'bg-amber-500/10')}>
                      {m.name}: {m.value}
                    </span>
                  ))}
                  {panel.markers.length > 5 && (
                    <span className="text-[10px] text-text-secondary">+{panel.markers.length - 5} more</span>
                  )}
                </div>
                {panel.aiInterpretation && (
                  <div className="mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-[10px] text-purple-400">AI interpreted</span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Interpretation panel */}
        <div>
          {selectedPanel ? (
            <div className="glass-bright rounded-2xl p-6 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">AI Interpretation</h2>
                {!interpreting && (
                  <button
                    onClick={() => { setInterpretation(''); getInterpretation(selectedPanel); }}
                    className="text-[10px] text-purple-400 hover:text-purple-300"
                  >
                    Regenerate
                  </button>
                )}
              </div>
              {interpreting && !interpretation && (
                <div className="flex items-center gap-2 py-8 justify-center">
                  <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                  <span className="text-xs text-text-secondary">Analyzing your bloodwork...</span>
                </div>
              )}
              {interpretation && (
                <div className="prose prose-invert prose-sm max-w-none text-text-secondary whitespace-pre-wrap text-xs leading-relaxed">
                  {interpretation}
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-sm text-text-secondary">Select a panel to see AI interpretation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
