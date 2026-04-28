/**
 * Screen wrapper — applies the global dark background and a subtle radial-glow
 * gradient (mirrors the web's body::before fixed gradient at globals.css L60).
 * Use as the outermost element of every route.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = ScrollViewProps & {
  scroll?: boolean;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
};

export function Screen({ children, scroll = true, edges = ['top'], contentContainerStyle, ...rest }: Props) {
  const Container = scroll ? ScrollView : View;
  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(6,182,212,0.08)', 'transparent', 'rgba(168,85,247,0.06)']}
        locations={[0, 0.5, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <SafeAreaView edges={edges} className="flex-1">
        <Container
          {...(scroll ? { contentContainerStyle: [{ padding: 20, paddingBottom: 80 }, contentContainerStyle] } : {})}
          className={scroll ? '' : 'flex-1 px-5 pt-5'}
          {...rest}
        >
          {children}
        </Container>
      </SafeAreaView>
    </View>
  );
}
