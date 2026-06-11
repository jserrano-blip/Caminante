import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, NETWORK_ERROR_MESSAGE } from '../api/client';

export interface LoadState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Hook ligero de carga con manejo amable de errores de red. */
export function useLoad<T>(fn: () => Promise<T>, deps: readonly unknown[]): LoadState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fnRef
      .current()
      .then((result) => {
        if (!alive) return;
        setData(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setError(errorMessage(err));
        setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, reload };
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.isNetwork ? NETWORK_ERROR_MESSAGE : err.message;
  if (err instanceof Error) return err.message;
  return 'Ocurrió un error inesperado';
}
