import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

export interface BarPoint {
  label: string;
  value: number;
}

interface Props {
  data: BarPoint[];
  height?: number;
  formatValue?: (v: number) => string;
}

/** Gráfica de barras ligera con SVG propio. Solo azules. */
export function BarChart({ data, height = 140, formatValue }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const pad = { top: 14, bottom: 22, left: 8, right: 8 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = Math.max(0, height - pad.top - pad.bottom);
  const max = data.length ? Math.max(...data.map((d) => d.value), 1) : 1;
  const fmt = formatValue ?? ((v: number) => String(Math.round(v)));

  const slot = data.length > 0 ? innerW / data.length : 0;
  const barW = Math.max(6, Math.min(36, slot * 0.55));

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 && data.length > 0 ? (
        <>
          <Svg width={width} height={height}>
            <Line
              x1={pad.left}
              y1={pad.top + innerH}
              x2={pad.left + innerW}
              y2={pad.top + innerH}
              stroke={c.surfaceBorder}
              strokeWidth={1}
            />
            {data.map((d, i) => {
              const h = max > 0 ? (d.value / max) * innerH : 0;
              const x = pad.left + i * slot + (slot - barW) / 2;
              const y = pad.top + innerH - h;
              return (
                <Rect
                  key={i}
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(h, d.value > 0 ? 2 : 0)}
                  rx={4}
                  fill={i === data.length - 1 ? c.primary : c.accent}
                  opacity={i === data.length - 1 ? 1 : 0.75}
                />
              );
            })}
          </Svg>
          <View style={[styles.labels, { paddingHorizontal: pad.left }]}>
            {data.map((d, i) => (
              <Text key={i} style={[styles.label, { width: slot }]} numberOfLines={1}>
                {d.label}
              </Text>
            ))}
          </View>
          <Text style={styles.max}>máx {fmt(max)}</Text>
        </>
      ) : null}
    </View>
  );
}

const createStyles = (c: ThemeColors) => {
  return StyleSheet.create({
  labels: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  label: { fontSize: 9, color: c.textMuted, textAlign: 'center' },
  max: { position: 'absolute', top: 0, right: 8, fontSize: 10, color: c.textMuted },
});
}
