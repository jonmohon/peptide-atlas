/**
 * Notes — list, create, pin, delete personal research notes. Backed by
 * UserNote (DynamoDB via Amplify Data, owner-scoped). Pinned notes float
 * to top. Tap a note to expand inline; long-press for delete confirmation.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Link, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import {
  deleteNote as apiDeleteNote,
  fetchNotes,
  togglePinNote,
  type NoteRow,
} from '@/lib/amplify-data';

export default function NotesScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const rows = await fetchNotes();
      setNotes(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notes');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setLoading(true);
      load().finally(() => alive && setLoading(false));
      return () => {
        alive = false;
      };
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handlePin = async (n: NoteRow) => {
    const next = !n.pinned;
    setNotes((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, pinned: next } : x))
    );
    try {
      await togglePinNote(n.id, next);
      await load();
    } catch {
      // Revert on failure
      await load();
    }
  };

  const handleDelete = (n: NoteRow) => {
    Alert.alert('Delete note?', n.title || n.content.slice(0, 60), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setNotes((prev) => prev.filter((x) => x.id !== n.id));
          try {
            await apiDeleteNote(n.id);
          } catch {
            await load();
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(168,85,247,0.06)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View className="flex-row items-center justify-between border-b border-white/5 px-5 py-3">
        <Pressable onPress={() => router.back()} className="active:opacity-60">
          <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
        </Pressable>
        <Text className="text-base font-semibold text-foreground">Notes</Text>
        <Link href="/notes/new" asChild>
          <Pressable className="active:opacity-60">
            <Ionicons name="add" size={22} color="#06b6d4" />
          </Pressable>
        </Link>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />}
      >
        {error && (
          <GlassCard className="mb-3 p-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
              <Text className="flex-1 text-xs text-red-400">{error}</Text>
            </View>
          </GlassCard>
        )}

        {loading && notes.length === 0 ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#06b6d4" />
          </View>
        ) : notes.length === 0 ? (
          <GlassCard className="items-center p-8" bright>
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-neon-cyan/15">
              <Ionicons name="document-text-outline" size={26} color="#06b6d4" />
            </View>
            <Text className="mt-4 text-base font-semibold text-foreground">No notes yet</Text>
            <Text className="mt-2 text-center text-xs leading-relaxed text-text-secondary">
              Capture observations, dosing tweaks, side effects, or research takeaways. Pin the
              important ones.
            </Text>
            <Link href="/notes/new" asChild>
              <Pressable className="mt-4 active:opacity-70">
                <View className="rounded-full border border-neon-cyan/40 bg-neon-cyan/15 px-4 py-2">
                  <Text className="text-xs font-semibold text-neon-cyan">Add your first note</Text>
                </View>
              </Pressable>
            </Link>
          </GlassCard>
        ) : (
          <View className="gap-3">
            {notes.map((n) => (
              <NoteCard key={n.id} note={n} onPin={() => handlePin(n)} onDelete={() => handleDelete(n)} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NoteCard({
  note,
  onPin,
  onDelete,
}: {
  note: NoteRow;
  onPin: () => void;
  onDelete: () => void;
}) {
  return (
    <Pressable onLongPress={onDelete}>
      <GlassCard className="p-4" bright={!!note.pinned}>
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1">
            {note.title && (
              <Text className="text-sm font-semibold text-foreground">{note.title}</Text>
            )}
            <Text
              className={`text-xs leading-relaxed text-text-secondary ${note.title ? 'mt-1' : ''}`}
            >
              {note.content}
            </Text>
            {note.tags && note.tags.length > 0 && (
              <View className="mt-2.5 flex-row flex-wrap" style={{ gap: 4 }}>
                {note.tags.map((t) => (
                  <View key={t} className="rounded-full bg-white/[0.06] px-2 py-0.5">
                    <Text className="text-[10px] text-text-secondary">#{t}</Text>
                  </View>
                ))}
              </View>
            )}
            {note.updatedAt && (
              <Text className="mt-2 text-[10px] text-text-muted">
                {formatRelative(note.updatedAt)}
              </Text>
            )}
          </View>
          <Pressable onPress={onPin} hitSlop={8} className="active:opacity-60">
            <Ionicons
              name={note.pinned ? 'pin' : 'pin-outline'}
              size={16}
              color={note.pinned ? '#06b6d4' : '#737373'}
            />
          </Pressable>
        </View>
      </GlassCard>
    </Pressable>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = (now - then) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}
