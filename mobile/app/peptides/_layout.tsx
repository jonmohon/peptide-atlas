/**
 * Stack layout for peptide detail routes (push, not tab). Lives outside (tabs)
 * so swiping back returns to whichever tab launched it (Peptides, AI, etc).
 */

import { Stack } from 'expo-router';

export default function PeptidesStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a0a0a' },
        animation: 'slide_from_right',
      }}
    />
  );
}
