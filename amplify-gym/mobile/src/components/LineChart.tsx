import React, { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { colors } from '../theme';

export interface LinePoint {
  label: string;
  value: number;
}

interface Props {
  data: LinePoint[];
  height?: number;
  /** Formatea el valor mostrado en min/max. */
  formatValue?: (v: number) => string;
}

/** Gráfica de línea ligera con SVG propio. Solo azules. */
export function LineChart({ data, height = 140, formatValue }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const pad = { top: 12, bottom: 22, left: 8, right: 8 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = Math.max(0, height - pad.top - pad.bottom);

  const values = data.map((d) => d.value);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const range = max - min || 1;
  const fmt = formatValue ?? ((v: number) => String(Math.round(v * 10) / 10));

  const points = data.map((d, i) => {
    const x = pad.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = pad.top + innerH - ((d.value - min) / range) * innerH;
    return { x, y };
  });

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
              stroke={colors.surfaceBorder}
              strokeWidth={1}
            />
            {points.length > 1 ? (
              <Polyline
                points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={colors.accent}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}
            {points.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={colors.primary} />
            ))}
          </Svg>
          <View style={styles.labels}>
            <Text style={styles.label}>{data[0]?.label}</Text>
            <Text style={styles.label}>{data[data.length - 1]?.label}</Text>
          </View>
          <View style={styles.minMax}>
            <Text style={styles.minMaxText}>máx {fmt(max)}</Text>
            <Text style={styles.minMaxText}>mín {fmt(min)}</Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    position: 'absolute',
    bottom: 2,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: { fontSize: 10, color: colors.textMuted },
  minMax: { position: 'absolute', top: 0, right: 8, alignItems: 'flex-end' },
  minMaxText: { fontSize: 10, color: colors.textMuted },
});
