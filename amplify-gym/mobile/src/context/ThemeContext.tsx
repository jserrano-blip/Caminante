import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ThemeColors } from '../theme';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'amplify.themeMode';

interface ThemeContextValue {
  colors: ThemeColors;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolved: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setModeState(stored);
      }
    });
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    void AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const resolved: ResolvedTheme =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: resolved === 'dark' ? darkColors : lightColors,
      mode,
      setMode,
      resolved,
    }),
    [mode, resolved],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
