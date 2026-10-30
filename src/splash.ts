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

export async function hideSplash() {
  try {
    const today = localDay();
    const last = await AsyncStorage.getItem(LAST_SHOWN);
    if (last !== today && SPLASH_HOLD_MS > 0) {
      await AsyncStorage.setItem(LAST_SHOWN, today);
      const left = SPLASH_HOLD_MS - (Date.now() - startedAt);
      if (left > 0) await new Promise((r) => setTimeout(r, left));
    }
  } catch {
    // If storage fails, just carry on without the wait.
  }
  await SplashScreen.hideAsync().catch(() => {});
}
