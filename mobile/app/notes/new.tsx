/**
 * Create note — title (optional), content (required), tags (comma-separated),
 * pin toggle. Saves to UserNote with attachedTo='GENERAL' for now; later
 * versions will let you attach to a peptide or stack from the detail screen.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { createNote } from '@/lib/amplify-data';

export default function NewNoteScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Content is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createNote({
        title: title.trim() || undefined,
        content: content.trim(),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        pinned,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-white/5 px-5 py-3">
        <Pressable onPress={() => router.back()} className="active:opacity-60">
          <Text className="text-sm text-text-secondary">Cancel</Text>
        </Pressable>
        <Text className="text-base font-semibold text-foreground">New note</Text>
        <Pressable
          onPress={handleSave}
          disabled={saving || !content.trim()}
          className={`active:opacity-60 ${saving || !content.trim() ? 'opacity-40' : ''}`}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#06b6d4" />
          ) : (
            <Text className="text-sm font-semibold text-neon-cyan">Save</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          {error && (
            <View className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3">
              <Text className="text-xs text-red-400">{error}</Text>
            </View>
          )}

          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Title (optional)
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Tirzepatide week 4 observations"
            placeholderTextColor="#737373"
            className="mb-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground"
          />

          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Content
          </Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Write your observation, dosing change, side effect, or research takeaway."
            placeholderTextColor="#737373"
            multiline
            autoFocus
            className="mb-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground"
            style={{ minHeight: 160, textAlignVertical: 'top' }}
          />

          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Tags
          </Text>
          <TextInput
            value={tags}
            onChangeText={setTags}
            placeholder="comma, separated, tags"
            placeholderTextColor="#737373"
            autoCapitalize="none"
            className="mb-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground"
          />

          <Pressable onPress={() => setPinned((p) => !p)} className="active:opacity-70">
            <GlassCard className="p-4">
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name={pinned ? 'pin' : 'pin-outline'}
                  size={18}
                  color={pinned ? '#06b6d4' : '#a3a3a3'}
                />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground">Pin to top</Text>
                  <Text className="mt-0.5 text-[11px] text-text-secondary">
                    Pinned notes always appear first.
                  </Text>
                </View>
                <View
                  className="h-5 w-9 rounded-full p-0.5"
                  style={{ backgroundColor: pinned ? '#06b6d4' : 'rgba(255,255,255,0.1)' }}
                >
                  <View
                    className="h-4 w-4 rounded-full bg-white"
                    style={{ alignSelf: pinned ? 'flex-end' : 'flex-start' }}
                  />
                </View>
              </View>
            </GlassCard>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
