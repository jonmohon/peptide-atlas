/**
 * Stack layout for stacks index + slug detail. Push transitions only.
 */

import { Stack } from 'expo-router';

export default function StacksStackLayout() {
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
