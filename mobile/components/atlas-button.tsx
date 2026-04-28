/**
 * Primary CTA button matching the web's neon-cyan filled style + neon glow.
 * Variants: primary (cyan), secondary (outlined), ghost (transparent).
 */

import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
};

const VARIANT_BG: Record<Variant, string> = {
  primary: 'bg-neon-cyan/20 border-neon-cyan/40',
  secondary: 'bg-white/[0.06] border-white/[0.12]',
  ghost: 'bg-transparent border-transparent',
};

const VARIANT_TEXT: Record<Variant, string> = {
  primary: 'text-neon-cyan',
  secondary: 'text-foreground',
  ghost: 'text-text-secondary',
};

export function AtlasButton({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      className={`${fullWidth ? 'w-full' : 'self-start'} flex-row items-center justify-center gap-2 rounded-xl border px-4 py-3.5 ${VARIANT_BG[variant]} ${isDisabled ? 'opacity-50' : 'active:opacity-80'}`}
    >
      {loading ? (
        <ActivityIndicator color="#06b6d4" />
      ) : (
        <Text className={`text-sm font-semibold ${VARIANT_TEXT[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
