import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

// ------------------------------------------------------------------
// Keep the loading screen up a bit longer on the first open of the day.
// To change how long, edit SPLASH_HOLD_MS. To turn it off, set it to 0.
// Later opens that day (like coming back between sets) skip the wait.
// ------------------------------------------------------------------

export const SPLASH_HOLD_MS = 4000;

const LAST_SHOWN = 'splash-last-shown';
const startedAt = Date.now();

// Must run before the first screen renders, so the splash doesn't hide on its own.
SplashScreen.preventAutoHideAsync().catch(() => {});

function localDay(d = new Date()) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// applyUpdate (from updates.ts) restarts into a new over-the-air update
// if one finishes downloading while the loading screen is still up.
export async function hideSplash(applyUpdate?: (ms: number) => Promise<boolean>) {
  let left = 0;
  try {
    const today = localDay();
    const last = await AsyncStorage.getItem(LAST_SHOWN);
    if (last !== today && SPLASH_HOLD_MS > 0) {
      await AsyncStorage.setItem(LAST_SHOWN, today);
      left = Math.max(0, SPLASH_HOLD_MS - (Date.now() - startedAt));
    }
  } catch {
    // If storage fails, just carry on without the wait.
  }
  if (applyUpdate) {
    if (await applyUpdate(left)) return; // restarting into the update
  } else if (left > 0) {
    await new Promise((r) => setTimeout(r, left));
  }
  await SplashScreen.hideAsync().catch(() => {});
}
