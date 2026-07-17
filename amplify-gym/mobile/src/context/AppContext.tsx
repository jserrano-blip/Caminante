import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_BASE_URL, getBaseUrl, setBaseUrl as persistBaseUrl } from '../api/client';
import type { Gym, User, WeightUnit } from '../api/types';

const USER_KEY = 'amplify.activeUser';
const UNIT_KEY = 'amplify.unit';
const GYM_KEY = 'amplify.activeGym';

interface AppContextValue {
  /** Perfil activo (persistido). */
  user: User | null;
  setUser: (user: User | null) => void;
  /** Unidad de presentación KG/LB (persistida). */
  unit: WeightUnit;
  setUnit: (unit: WeightUnit) => void;
  /** Gimnasio activo (persistido, incluye equipo). */
  gym: Gym | null;
  setGym: (gym: Gym | null) => void;
  /** URL base de la API (persistida vía api/client). */
  baseUrl: string;
  setBaseUrl: (url: string) => Promise<void>;
  /** true mientras se restaura el estado persistido. */
  hydrating: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [unit, setUnitState] = useState<WeightUnit>('KG');
  const [gym, setGymState] = useState<Gym | null>(null);
  const [baseUrl, setBaseUrlState] = useState(DEFAULT_BASE_URL);
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedUser, storedUnit, storedGym, storedBaseUrl] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(UNIT_KEY),
          AsyncStorage.getItem(GYM_KEY),
          getBaseUrl(),
        ]);
        if (storedUser) setUserState(JSON.parse(storedUser) as User);
        if (storedUnit === 'KG' || storedUnit === 'LB') setUnitState(storedUnit);
        if (storedGym) setGymState(JSON.parse(storedGym) as Gym);
        setBaseUrlState(storedBaseUrl);
      } catch {
        // estado por defecto
      } finally {
        setHydrating(false);
      }
    })();
  }, []);

  const setUser = useCallback((next: User | null) => {
    setUserState(next);
    if (next) {
      void AsyncStorage.setItem(USER_KEY, JSON.stringify(next));
      setUnitState(next.weightUnit);
      void AsyncStorage.setItem(UNIT_KEY, next.weightUnit);
    } else {
      void AsyncStorage.removeItem(USER_KEY);
      setGymState(null);
      void AsyncStorage.removeItem(GYM_KEY);
    }
  }, []);

  const setUnit = useCallback((next: WeightUnit) => {
    setUnitState(next);
    void AsyncStorage.setItem(UNIT_KEY, next);
  }, []);

  const setGym = useCallback((next: Gym | null) => {
    setGymState(next);
    if (next) void AsyncStorage.setItem(GYM_KEY, JSON.stringify(next));
    else void AsyncStorage.removeItem(GYM_KEY);
  }, []);

  const setBaseUrl = useCallback(async (url: string) => {
    await persistBaseUrl(url);
    setBaseUrlState(await getBaseUrl());
  }, []);

  const value = useMemo(
    () => ({ user, setUser, unit, setUnit, gym, setGym, baseUrl, setBaseUrl, hydrating }),
    [user, setUser, unit, setUnit, gym, setGym, baseUrl, setBaseUrl, hydrating]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
