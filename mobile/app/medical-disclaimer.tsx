/**
 * Medical disclaimer screen. Shown once at first run; user must check the box
 * and tap Continue before any AI feature unlocks. Acceptance is persisted in
 * AsyncStorage so we don't re-prompt.
 *
 * Required by Apple App Store Review Guideline 1.4 (Medical apps): apps must
 * include a clear disclaimer that the content is for educational purposes
 * only and is not a substitute for professional medical advice.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'atlas_medical_disclaimer_v1';

export async function hasAcceptedDisclaimer(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === 'accepted';
  } catch {
    return false;
  }
}

export async function recordDisclaimerAccepted(): Promise<void> {
  await AsyncStorage.setItem(KEY, 'accepted');
}

export default function MedicalDisclaimerScreen() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alreadyAccepted, setAlreadyAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    hasAcceptedDisclaimer().then((ok) => {
      if (alive) {
        setAlreadyAccepted(ok);
        if (ok) setChecked(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleContinue = async () => {
    if (!checked) return;
    setSaving(true);
    try {
      await recordDisclaimerAccepted();
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  if (alreadyAccepted === null) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#06b6d4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(249,115,22,0.10)', 'transparent', 'rgba(6,182,212,0.06)']}
        locations={[0, 0.5, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 32, flexGrow: 1 }}>
        <View className="mb-6 items-center">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/15 border border-orange-500/30">
            <Ionicons name="warning-outline" size={32} color="#f97316" />
          </View>
        </View>

        <Text className="text-center text-2xl font-bold text-foreground">
          Important: Read before using
        </Text>
        <Text className="mt-3 text-center text-sm leading-relaxed text-text-secondary">
          Peptide Atlas is an educational tool. The information here is not medical advice.
        </Text>

        <View className="mt-8 gap-4">
          <Card icon="school-outline" color="#06b6d4" title="Educational use only">
            All content — peptide profiles, AI responses, protocol suggestions, bloodwork
            interpretations — is provided for educational purposes. It is NOT medical advice,
            diagnosis, or treatment.
          </Card>

          <Card icon="medkit-outline" color="#f97316" title="Consult a licensed clinician">
            Before starting, changing, or stopping any peptide, medication, or protocol, you
            must consult a licensed healthcare professional who knows your medical history.
            Many of the peptides referenced here are not FDA-approved for human use.
          </Card>

          <Card icon="alert-circle-outline" color="#ef4444" title="AI can be wrong">
            Atlas AI is grounded in our peptide catalog and your profile, but AI systems can
            make mistakes — wrong dose ranges, missed contraindications, factual errors in
            mechanism. Verify every recommendation with your clinician before acting on it.
          </Card>

          <Card icon="shield-outline" color="#10b981" title="Emergencies">
            Do not use Peptide Atlas for medical emergencies. If you think you may have a
            medical emergency, call your local emergency number or go to the nearest
            emergency department immediately.
          </Card>
        </View>

        <Pressable
          onPress={() => setChecked((v) => !v)}
          className="mt-8 active:opacity-70"
        >
          <View
            className="flex-row items-start gap-3 rounded-2xl border px-4 py-4"
            style={{
              backgroundColor: checked ? 'rgba(16,185,129,0.10)' : 'rgba(255,255,255,0.03)',
              borderColor: checked ? 'rgba(16,185,129,0.40)' : 'rgba(255,255,255,0.10)',
            }}
          >
            <View
              className="mt-0.5 h-5 w-5 items-center justify-center rounded border"
              style={{
                backgroundColor: checked ? '#10b981' : 'transparent',
                borderColor: checked ? '#10b981' : 'rgba(255,255,255,0.25)',
              }}
            >
              {checked && <Ionicons name="checkmark" size={14} color="#0a0a0a" />}
            </View>
            <Text className="flex-1 text-sm leading-relaxed text-foreground">
              I understand that Peptide Atlas is an educational tool, not medical advice.
              I will consult a licensed clinician before acting on any information from
              the app.
            </Text>
          </View>
        </Pressable>

        <View className="mt-6">
          <Pressable
            onPress={alreadyAccepted ? () => router.back() : handleContinue}
            disabled={!checked || saving}
            className={`active:opacity-70 ${!checked || saving ? 'opacity-40' : ''}`}
          >
            <View
              className="flex-row items-center justify-center gap-2 rounded-xl border px-4 py-4"
              style={{
                backgroundColor: 'rgba(6,182,212,0.20)',
                borderColor: 'rgba(6,182,212,0.40)',
              }}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#06b6d4" />
              ) : (
                <>
                  <Text className="text-sm font-semibold text-neon-cyan">
                    {alreadyAccepted ? 'Done' : 'I understand — Continue'}
                  </Text>
                  <Ionicons name={alreadyAccepted ? 'close' : 'arrow-forward'} size={16} color="#06b6d4" />
                </>
              )}
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({
  icon,
  color,
  title,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      className="rounded-2xl border px-4 py-4"
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <View className="mb-2 flex-row items-center gap-2">
        <View
          className="h-7 w-7 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}1f` }}
        >
          <Ionicons name={icon} size={16} color={color} />
        </View>
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
      </View>
      <Text className="text-[12px] leading-relaxed text-text-secondary">{children}</Text>
    </View>
  );
}
