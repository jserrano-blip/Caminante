import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const rootNavigationRef = createNavigationContainerRef<RootStackParamList>();

/** Vuelve al selector de perfiles desde cualquier parte de la app. */
export function resetToProfileSelect(): void {
  if (rootNavigationRef.isReady()) {
    rootNavigationRef.resetRoot({ index: 0, routes: [{ name: 'ProfileSelect' }] });
  }
}
