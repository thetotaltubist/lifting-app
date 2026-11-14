import { AppState } from 'react-native';
import * as Updates from 'expo-updates';

// ------------------------------------------------------------------
// Over-the-air updates (EAS Update).
//
// JS-only changes can be sent straight to the phones with `npm run ota`
// instead of a new TestFlight build. Each update only goes to the build
// it was made for (runtime version = app version + build number), so a
// phone never gets JS that needs native code it doesn't have.
//
// How a phone picks one up:
// - On open, it checks for an update while the loading screen is up.
//   If it finishes downloading before the loading screen would hide,
//   the app restarts into it right away.
// - Otherwise it keeps downloading quietly and the update is used the
//   next time the app is opened fresh.
// - Coming back to the app (for example between sets) checks again,
//   but never restarts the app mid-workout.
// ------------------------------------------------------------------

let busy = false;
let ready = false;

async function checkAndFetch(): Promise<boolean> {
  if (!Updates.isEnabled || __DEV__) return false;
  if (ready) return true;
  if (busy) return false;
  busy = true;
  try {
    const check = await Updates.checkForUpdateAsync();
    if (!check.isAvailable) return false;
    const fetched = await Updates.fetchUpdateAsync();
    ready = fetched.isNew;
    return ready;
  } catch {
    // Offline or the server didn't answer. Try again next time.
    return false;
  } finally {
    busy = false;
  }
}

/**
 * Starts checking for an update on launch. Returns a function that takes
 * how long the loading screen will still be up (ms) and resolves to true
 * if an update downloaded in that time and the app is restarting into it.
 */
export function startLaunchUpdateCheck() {
  const pending = checkAndFetch();

  AppState.addEventListener('change', (state) => {
    if (state === 'active') checkAndFetch();
  });

  return async function applyIfReadyWithin(ms: number): Promise<boolean> {
    // Only a finished download ends the wait early; "no update" still
    // lets the loading screen stay up for its full time.
    const done = await Promise.race([
      pending.then((ok) => (ok ? true : new Promise<never>(() => {}))),
      new Promise<false>((r) => setTimeout(() => r(false), Math.max(0, ms))),
    ]);
    if (!done) return false;
    try {
      await Updates.reloadAsync({
        reloadScreenOptions: { backgroundColor: '#121212', fade: true, spinner: { enabled: true, color: '#ffffff' } },
      });
      return true;
    } catch {
      return false;
    }
  };
}

/** One line for Settings, like "1.0.0 (14) · update Nov 14, 3:20 PM". */
export function versionLine(appVersion: string, build: string | undefined) {
  const base = `Version ${appVersion}${build ? ` (${build})` : ''}`;
  if (!Updates.isEnabled || Updates.isEmbeddedLaunch || !Updates.createdAt) return base;
  const when = Updates.createdAt.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${base} · update ${when}`;
}
