/**
 * Glass-morphism surface — translucent panel with a subtle hairline border,
 * a soft inner highlight, and a blurred background. The web app's `.glass`
 * class is its inspiration: rgba(255,255,255,0.04) fill, 1px white/[0.08] border,
 * 24px blur. expo-blur handles the backdrop-filter work natively.
 */

import { BlurView } from 'expo-blur';
import { View, type ViewProps } from 'react-native';

type Props = ViewProps & {
  intensity?: number;
  bright?: boolean;
};

export function GlassCard({ children, className = '', intensity = 24, bright = false, ...rest }: Props) {
  return (
    <View
      className={`overflow-hidden rounded-2xl border ${bright ? 'border-white/15' : 'border-white/10'} ${className}`}
      {...rest}
    >
      <BlurView
        intensity={intensity}
        tint="dark"
        className="absolute inset-0"
      />
      <View className={`${bright ? 'bg-white/[0.08]' : 'bg-white/[0.04]'}`}>
        {children}
      </View>
    </View>
  );
}
