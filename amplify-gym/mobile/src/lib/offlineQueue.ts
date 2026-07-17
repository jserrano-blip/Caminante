// Cola offline de series: persiste en AsyncStorage las series que no se
// pudieron enviar por falta de red y las reintenta (flush) más tarde.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError } from '../api/client';
import { addSet } from '../api/endpoints';
import type { WorkoutSetInput } from '../api/types';

const STORAGE_KEY = 'amplify.pendingSets';

export interface PendingSet {
  /** Clave local de la serie en la UI (para reconciliar). */
  tempId: string;
  sessionId: string;
  body: WorkoutSetInput;
}

type Listener = (pending: PendingSet[]) => void;

const listeners = new Set<Listener>();
let flushing: Promise<PendingSet[]> | null = null;

async function read(): Promise<PendingSet[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as PendingSet[]) : [];
  } catch {
    return [];
  }
}

async function write(list: PendingSet[]): Promise<void> {
  try {
    if (list.length === 0) await AsyncStorage.removeItem(STORAGE_KEY);
    else await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // sin persistencia no hay nada más que hacer
  }
  for (const cb of listeners) cb(list);
}

/** Lista actual de series pendientes de sincronizar. */
export function getPending(): Promise<PendingSet[]> {
  return read();
}

/** Agrega una serie a la cola (reemplaza si el tempId ya existe). */
export async function enqueue(item: PendingSet): Promise<void> {
  const list = await read();
  await write([...list.filter((p) => p.tempId !== item.tempId), item]);
}

/** Quita una serie de la cola por tempId. */
export async function remove(tempId: string): Promise<void> {
  const list = await read();
  const next = list.filter((p) => p.tempId !== tempId);
  if (next.length !== list.length) await write(next);
}

/**
 * Suscripción a cambios de la cola. Devuelve la función para desuscribirse.
 */
export function subscribe(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/**
 * Reintenta enviar cada serie pendiente; quita las que logra.
 * Ejecuciones concurrentes se deduplican (comparten la misma promesa).
 * Devuelve las que siguen pendientes.
 */
export function flush(): Promise<PendingSet[]> {
  if (flushing) return flushing;
  flushing = (async () => {
    const list = await read();
    if (list.length === 0) return list;
    const remaining: PendingSet[] = [];
    for (const item of list) {
      try {
        await addSet(item.sessionId, item.body);
      } catch (err) {
        remaining.push(item);
        if (err instanceof TypeError || (err instanceof ApiError && err.isNetwork)) {
          // sigue sin red: no tiene caso intentar el resto
          remaining.push(...list.slice(list.indexOf(item) + 1));
          break;
        }
      }
    }
    await write(remaining);
    return remaining;
  })().finally(() => {
    flushing = null;
  });
  return flushing;
}
