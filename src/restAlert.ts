import * as Notifications from 'expo-notifications';

// ------------------------------------------------------------------
// A notification when rest is up, so the phone can stay in your pocket.
// While the app is open the on-screen timer does the job instead.
// ------------------------------------------------------------------

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let scheduled: string | null = null;

export async function cancelRestAlert() {
  const id = scheduled;
  scheduled = null;
  if (id) await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}

export async function scheduleRestAlert(seconds: number, next: string) {
  await cancelRestAlert();
  try {
    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted && !(await Notifications.requestPermissionsAsync()).granted) return;
    scheduled = await Notifications.scheduleNotificationAsync({
      content: { title: 'Rest is up', body: next, sound: 'default' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(1, Math.round(seconds)), repeats: false },
    });
  } catch {}
}
