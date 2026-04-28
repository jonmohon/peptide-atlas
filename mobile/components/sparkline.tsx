/**
 * Tiny SVG sparkline — line + dots for a series of {x, y} points. Auto-scales
 * to its container; reference range bands shaded in green.
 */

import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';

export type Sample = { x: number; y: number; label?: string };

export function Sparkline({
  data,
  refLow,
  refHigh,
  unit,
  accent = '#06b6d4',
  width = 320,
  height = 140,
}: {
  data: Sample[];
  refLow?: number;
  refHigh?: number;
  unit?: string;
  accent?: string;
  width?: number;
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <View className="items-center justify-center py-6">
        <Text className="text-xs text-text-secondary">Not enough data.</Text>
      </View>
    );
  }

  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const minY = Math.min(...ys, refLow ?? Infinity);
  const maxY = Math.max(...ys, refHigh ?? -Infinity);
  const range = maxY - minY || 1;
  const padTop = 16;
  const padBottom = 28;
  const padLeft = 36;
  const padRight = 12;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const xPos = (x: number) => {
    if (xs.length === 1) return padLeft + innerW / 2;
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const t = (x - minX) / (maxX - minX || 1);
    return padLeft + t * innerW;
  };
  const yPos = (y: number) => padTop + (1 - (y - minY) / range) * innerH;

  const refRectY =
    refLow !== undefined && refHigh !== undefined
      ? { y: yPos(refHigh), height: yPos(refLow) - yPos(refHigh) }
      : null;

  const points = data.map((d) => `${xPos(d.x)},${yPos(d.y)}`).join(' ');

  return (
    <View>
      <Svg width={width} height={height}>
        {refRectY && refRectY.height > 0 && (
          <Rect
            x={padLeft}
            y={refRectY.y}
            width={innerW}
            height={refRectY.height}
            fill="rgba(16,185,129,0.10)"
          />
        )}

        {/* Y axis labels */}
        <SvgText x={padLeft - 6} y={padTop + 4} fill="#737373" fontSize="10" textAnchor="end">
          {formatN(maxY)}
        </SvgText>
        <SvgText x={padLeft - 6} y={padTop + innerH + 4} fill="#737373" fontSize="10" textAnchor="end">
          {formatN(minY)}
        </SvgText>

        {/* X axis */}
        <Line x1={padLeft} y1={padTop + innerH} x2={padLeft + innerW} y2={padTop + innerH} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

        <Polyline points={points} fill="none" stroke={accent} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {data.map((d, i) => (
          <Circle key={i} cx={xPos(d.x)} cy={yPos(d.y)} r={3.5} fill={accent} stroke="#0a0a0a" strokeWidth={1.5} />
        ))}
      </Svg>
      {unit && (
        <Text className="mt-1 text-[10px] text-text-muted text-right">{unit}</Text>
      )}
    </View>
  );
}

function formatN(n: number): string {
  if (Math.abs(n) >= 1000) return n.toFixed(0);
  if (Math.abs(n) >= 100) return n.toFixed(0);
  if (Math.abs(n) >= 10) return n.toFixed(1);
  return n.toFixed(2);
}
