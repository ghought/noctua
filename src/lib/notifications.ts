import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const NOTIFICATION_ID = 1;

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  const { display } = await LocalNotifications.requestPermissions();
  return display === 'granted';
}

export async function scheduleMorningReminder(hour: number, minute: number) {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });

  await LocalNotifications.schedule({
    notifications: [
      {
        id: NOTIFICATION_ID,
        title: 'What did you dream?',
        body: 'Capture it before it fades.',
        schedule: {
          on: { hour, minute },
          repeats: true,
          allowWhileIdle: true,
        },
        sound: 'default',
        smallIcon: 'ic_stat_noctua',
      },
    ],
  });
}

export async function cancelMorningReminder() {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
}

export async function getScheduledReminder() {
  if (!Capacitor.isNativePlatform()) return null;
  const { notifications } = await LocalNotifications.getPending();
  return notifications.find(n => n.id === NOTIFICATION_ID) ?? null;
}
