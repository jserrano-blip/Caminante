import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_BASE_URL = 'http://localhost:4000/api';
const BASE_URL_KEY = 'amplify.baseUrl';
const API_KEY_KEY = 'amplify.apiKey';

let cachedBaseUrl: string | null = null;
let cachedApiKey: string | null = null;
let apiKeyLoaded = false;

export async function getBaseUrl(): Promise<string> {
  if (cachedBaseUrl) return cachedBaseUrl;
  try {
    const stored = await AsyncStorage.getItem(BASE_URL_KEY);
    cachedBaseUrl = stored && stored.trim() ? stored.trim() : DEFAULT_BASE_URL;
  } catch {
    cachedBaseUrl = DEFAULT_BASE_URL;
  }
  return cachedBaseUrl;
}

export async function setBaseUrl(url: string): Promise<void> {
  const clean = url.trim().replace(/\/+$/, '');
  cachedBaseUrl = clean || DEFAULT_BASE_URL;
  await AsyncStorage.setItem(BASE_URL_KEY, cachedBaseUrl);
}

/** Clave de API opcional (header x-api-key). null = sin clave. */
export async function getApiKey(): Promise<string | null> {
  if (apiKeyLoaded) return cachedApiKey;
  try {
    const stored = await AsyncStorage.getItem(API_KEY_KEY);
    cachedApiKey = stored && stored.trim() ? stored.trim() : null;
  } catch {
    cachedApiKey = null;
  }
  apiKeyLoaded = true;
  return cachedApiKey;
}

export async function setApiKey(key: string): Promise<void> {
  const clean = key.trim();
  cachedApiKey = clean || null;
  apiKeyLoaded = true;
  if (cachedApiKey) await AsyncStorage.setItem(API_KEY_KEY, cachedApiKey);
  else await AsyncStorage.removeItem(API_KEY_KEY);
}

export class ApiError extends Error {
  status: number | null;
  /** true cuando ni siquiera hubo respuesta del servidor (red caída / URL mala) */
  isNetwork: boolean;

  constructor(message: string, status: number | null = null, isNetwork = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetwork = isNetwork;
  }
}

export const NETWORK_ERROR_MESSAGE =
  'Sin conexión con el servidor — revisa la URL en Ajustes';

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const [baseUrl, apiKey] = await Promise.all([getBaseUrl(), getApiKey()]);
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (apiKey) headers['x-api-key'] = apiKey;
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(NETWORK_ERROR_MESSAGE, null, true);
  }

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `Error del servidor (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return data as T;
}

export const get = <T>(path: string) => request<T>('GET', path);
export const post = <T>(path: string, body?: unknown) => request<T>('POST', path, body);
export const patch = <T>(path: string, body?: unknown) => request<T>('PATCH', path, body);
export const put = <T>(path: string, body?: unknown) => request<T>('PUT', path, body);
export const del = <T>(path: string) => request<T>('DELETE', path);

/** Prueba la conexión con el servidor: intenta <baseUrl>/health y <host>/health. */
export async function testConnection(baseUrl: string): Promise<boolean> {
  const clean = baseUrl.trim().replace(/\/+$/, '');
  const candidates = [`${clean}/health`, `${clean.replace(/\/api$/, '')}/health`, clean];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch {
      // sigue probando
    }
  }
  return false;
}

/**
 * Prueba la clave de API: GET <baseUrl>/users con x-api-key.
 * 'ok' = autorizado, 'unauthorized' = 401 (clave incorrecta), 'error' = otro fallo.
 */
export async function testApiKey(
  baseUrl: string,
  apiKey: string | null
): Promise<'ok' | 'unauthorized' | 'error'> {
  const clean = baseUrl.trim().replace(/\/+$/, '');
  try {
    const res = await fetch(`${clean}/users`, {
      method: 'GET',
      headers: apiKey ? { 'x-api-key': apiKey } : undefined,
    });
    if (res.status === 401) return 'unauthorized';
    return res.ok ? 'ok' : 'error';
  } catch {
    return 'error';
  }
}
