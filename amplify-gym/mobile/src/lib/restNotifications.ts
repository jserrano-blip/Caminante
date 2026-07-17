// Notificación local al terminar el descanso. Todo con guard para web y
// try/catch: si las notificaciones fallan, el timer sigue funcionando igual.
import { Platform } from 'react-native';

const isNative = Platform.OS !== 'web';

let configured = false;
let permissionRequested = false;
let permissionGranted = false;

const ANDROID_CHANNEL_ID = 'rest-timer';

async function ensureReady(): Promise<boolean> {
  if (!isNative) return false;
  try {
    const Notifications = await import('expo-notifications');
    if (!configured) {
      configured = true;
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
          name: 'Fin del descanso',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
        });
      }
    }
    if (!permissionRequested) {
      permissionRequested = true;
      const settings = await Notifications.getPermissionsAsync();
      if (settings.granted) {
        permissionGranted = true;
      } else {
        const res = await Notifications.requestPermissionsAsync();
        permissionGranted = res.granted;
      }
    }
    return permissionGranted;
  } catch {
    return false;
  }
}

/**
 * Programa la notificación "Descanso terminado" en `seconds` segundos.
 * Devuelve el id de la notificación, o null si no se pudo programar.
 */
export async function scheduleRestEndNotification(seconds: number): Promise<string | null> {
  if (!isNative || seconds < 1) return null;
  try {
    if (!(await ensureReady())) return null;
    const Notifications = await import('expo-notifications');
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Descanso terminado',
        body: 'Hora de la siguiente serie',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.round(seconds)),
        repeats: false,
        channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
      },
    });
  } catch {
    return null;
  }
}

/** Cancela una notificación programada (id devuelto por schedule). */
export async function cancelRestNotification(id: string | null): Promise<void> {
  if (!isNative || !id) return;
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // nada que hacer
  }
}
