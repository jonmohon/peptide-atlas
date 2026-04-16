'use client';

import { useState, useEffect } from 'react';
import { dataClient } from '@/lib/amplify-data';
import { peptides } from '@/data/peptides';
import { cn } from '@/lib/utils';

type AttachedTo = 'PEPTIDE' | 'STACK' | 'PROTOCOL' | 'GENERAL';

interface Note {
  id: string;
  title: string | null;
  content: string;
  attachedTo: AttachedTo | null;
  attachedId: string | null;
  tags: string[];
  pinned: boolean | null;
  createdAt: string;
  updatedAt: string;
}

const FILTER_OPTIONS: { value: AttachedTo | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'GENERAL', label: 'General' },
  { value: 'PEPTIDE', label: 'Peptides' },
  { value: 'STACK', label: 'Stacks' },
  { value: 'PROTOCOL', label: 'Protocols' },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AttachedTo | 'ALL'>('ALL');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // New note form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAttachedTo, setNewAttachedTo] = useState<AttachedTo>('GENERAL');
  const [newAttachedId, setNewAttachedId] = useState('');
  const [newTags, setNewTags] = useState('');

  useEffect(() => { loadNotes(); }, []);

  async function loadNotes() {
    try {
      const { data } = await dataClient.models.UserNote.list();
      const mapped: Note[] = (data ?? []).map((n) => ({
        id: n.id,
        title: n.title ?? null,
        content: n.content,
        attachedTo: (n.attachedTo as AttachedTo) ?? null,
        attachedId: n.attachedId ?? null,
        tags: (n.tags ?? []).filter((t): t is string => t !== null),
        pinned: n.pinned ?? false,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      }));
      // Sort: pinned first, then by updatedAt desc
      mapped.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
      setNotes(mapped);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newContent.trim()) return;
    setSaving(true);
    try {
      await dataClient.models.UserNote.create({
        title: newTitle.trim() || null,
        content: newContent.trim(),
        attachedTo: newAttachedTo,
        attachedId: newAttachedTo === 'PEPTIDE' ? newAttachedId : null,
        tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
        pinned: false,
      });
      setNewTitle(''); setNewContent(''); setNewTags(''); setShowCreate(false);
      await loadNotes();
    } catch (err) {
      console.error('Failed to create note:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await dataClient.models.UserNote.delete({ id });
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingNote?.id === id) setEditingNote(null);
  }

  async function handleTogglePin(note: Note) {
    await dataClient.models.UserNote.update({ id: note.id, pinned: !note.pinned });
    await loadNotes();
  }

  const filtered = notes.filter((n) => {
    if (filter !== 'ALL' && n.attachedTo !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (n.title?.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q)));
    }
    return true;
  });

  const getPeptideName = (id: string | null) => id ? peptides.find((p) => p.id === id)?.name ?? id : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notes</h1>
          <p className="text-sm text-text-secondary mt-1">Quick notes attached to peptides, stacks, or anything.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all text-sm font-semibold"
        >
          + New Note
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="flex-1 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50"
        />
        <div className="flex gap-1 bg-white/[0.03] rounded-xl p-0.5 border border-white/[0.06]">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                filter === opt.value
                  ? 'bg-neon-cyan/20 text-neon-cyan'
                  : 'text-text-secondary hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create note form */}
      {showCreate && (
        <div className="glass-bright rounded-2xl p-5 mb-6 border border-neon-cyan/20">
          <div className="space-y-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Note title (optional)"
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write your note..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50 resize-none"
              autoFocus
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-text-secondary mb-1">Attach to</label>
                <select
                  value={newAttachedTo}
                  onChange={(e) => setNewAttachedTo(e.target.value as AttachedTo)}
                  className="w-full px-2.5 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-foreground focus:outline-none focus:border-neon-cyan/50"
                >
                  <option value="GENERAL" className="bg-[#111827]">General</option>
                  <option value="PEPTIDE" className="bg-[#111827]">Peptide</option>
                  <option value="STACK" className="bg-[#111827]">Stack</option>
                  <option value="PROTOCOL" className="bg-[#111827]">Protocol</option>
                </select>
              </div>
              {newAttachedTo === 'PEPTIDE' && (
                <div>
                  <label className="block text-[10px] text-text-secondary mb-1">Peptide</label>
                  <select
                    value={newAttachedId}
                    onChange={(e) => setNewAttachedId(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-foreground focus:outline-none focus:border-neon-cyan/50"
                  >
                    <option value="" className="bg-[#111827]">Select...</option>
                    {peptides.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#111827]">{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-[10px] text-text-secondary mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g., dosing, important"
                  className="w-full px-2.5 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-xs text-text-secondary hover:text-foreground">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={saving || !newContent.trim()}
                className="px-4 py-1.5 rounded-lg bg-neon-cyan/20 text-neon-cyan text-xs font-medium border border-neon-cyan/30 hover:bg-neon-cyan/30 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/[0.03] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-text-secondary">
            {notes.length === 0 ? 'No notes yet. Create your first note above.' : 'No notes match your search.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((note) => (
            <div
              key={note.id}
              className={cn(
                'glass rounded-xl p-4 group relative',
                note.pinned && 'border border-neon-cyan/20'
              )}
            >
              {/* Pin indicator */}
              {note.pinned && (
                <div className="absolute top-2 right-2 text-neon-cyan text-[10px]">pinned</div>
              )}

              {/* Title */}
              {note.title && (
                <h3 className="text-sm font-semibold text-foreground mb-1 truncate">{note.title}</h3>
              )}

              {/* Content preview */}
              <p className="text-xs text-text-secondary line-clamp-3">{note.content}</p>

              {/* Meta */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {note.attachedTo && note.attachedTo !== 'GENERAL' && (
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-text-secondary">
                    {note.attachedTo === 'PEPTIDE' ? getPeptideName(note.attachedId) : note.attachedTo.toLowerCase()}
                  </span>
                )}
                {note.tags.map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 rounded bg-neon-cyan/10 text-[10px] text-neon-cyan">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleTogglePin(note)}
                  className="px-2 py-1 rounded text-[10px] text-text-secondary hover:text-neon-cyan transition-colors"
                >
                  {note.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="px-2 py-1 rounded text-[10px] text-text-secondary hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
