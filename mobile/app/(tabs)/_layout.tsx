/**
 * Tab navigator. If the user isn't signed in, route them to /(auth)/sign-in.
 * Five tabs match the web's primary surfaces: Dashboard, Journal, Peptides,
 * AI, Profile. Body map / stacks / compare are reachable from the dashboard.
 */

import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { hasAcceptedDisclaimer } from '@/app/medical-disclaimer';
import { useAuth } from '@/lib/auth-context';

export default function TabLayout() {
  const { user, loading } = useAuth();
  const [disclaimerOk, setDisclaimerOk] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    hasAcceptedDisclaimer().then((ok) => {
      if (alive) setDisclaimerOk(ok);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (loading || disclaimerOk === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#06b6d4" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }
  if (!disclaimerOk) {
    return <Redirect href="/medical-disclaimer" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#06b6d4',
        tabBarInactiveTintColor: '#737373',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Atlas',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => <Ionicons name="journal-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="peptides"
        options={{
          title: 'Peptides',
          tabBarIcon: ({ color, size }) => <Ionicons name="flask-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
