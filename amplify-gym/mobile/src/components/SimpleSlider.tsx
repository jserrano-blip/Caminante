import React, { useRef, useState, useMemo } from 'react';
import { PanResponder, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { radius, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  /** Cómo formatear el valor mostrado. */
  format?: (value: number) => string;
}

/** Slider sencillo propio (sin dependencias), arrastrable y con taps en la pista. */
export function SimpleSlider({ value, onChange, min, max, step = 1, label, format }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const valueRef = useRef(value);
  valueRef.current = value;

  const snap = (v: number) => {
    const clamped = Math.min(max, Math.max(min, v));
    const stepped = Math.round((clamped - min) / step) * step + min;
    return Math.round(stepped * 100) / 100;
  };

  const positionToValue = (x: number) => {
    const w = widthRef.current;
    if (w <= 0) return valueRef.current;
    return snap(min + (x / w) * (max - min));
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const next = positionToValue(evt.nativeEvent.locationX);
        if (next !== valueRef.current) onChange(next);
      },
      onPanResponderMove: (evt) => {
        const next = positionToValue(evt.nativeEvent.locationX);
        if (next !== valueRef.current) onChange(next);
      },
    })
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
    widthRef.current = e.nativeEvent.layout.width;
  };

  const ratio = max > min ? (value - min) / (max - min) : 0;
  const thumbX = Math.max(0, Math.min(width, ratio * width));

  return (
    <View style={styles.container}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{format ? format(value) : String(value)}</Text>
        </View>
      ) : null}
      <View style={styles.trackWrap} onLayout={onLayout} {...responder.panHandlers}>
        <View style={styles.track} />
        <View style={[styles.fill, { width: thumbX }]} />
        <View style={[styles.thumb, { left: thumbX - 12 }]} />
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) => {
  return StyleSheet.create({
  container: { marginVertical: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 14, color: c.textPrimary, fontWeight: '500' },
  value: { fontSize: 14, color: c.primary, fontWeight: '700' },
  trackWrap: { height: 36, justifyContent: 'center' },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: c.ice,
    borderWidth: 1,
    borderColor: c.surfaceBorder,
  },
  fill: {
    position: 'absolute',
    height: 6,
    borderRadius: radius.full,
    backgroundColor: c.accent,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: c.primary,
    borderWidth: 3,
    borderColor: c.white,
    shadowColor: c.navy900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
}
