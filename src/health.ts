import AsyncStorage from '@react-native-async-storage/async-storage';
import { healthAvailable, readBodyMass, readDailyAverage, readSleep, requestHealthAccess } from '../modules/health';
import { HealthData } from './engine/health';

// ------------------------------------------------------------------
// Pulls Apple Health data and keeps the latest copy on the phone, so the
// plan still has it when Health is slow to answer.
// ------------------------------------------------------------------

const CONNECTED = 'health-connected';
const CACHE = 'health-cache';
const REFRESH_MS = 30 * 60 * 1000;

export { healthAvailable };

export async function isHealthConnected() {
  try {
    return (await AsyncStorage.getItem(CONNECTED)) === '1';
  } catch {
    return false;
  }
}

export async function connectHealth() {
  const ok = await requestHealthAccess();
  if (ok) {
    await AsyncStorage.setItem(CONNECTED, '1');
    await refreshHealth(true);
  }
  return ok;
}

export async function loadHealth(): Promise<HealthData | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE);
    return raw ? (JSON.parse(raw) as HealthData) : null;
  } catch {
    return null;
  }
}

// Reads Health again if the saved copy is more than 30 minutes old
export async function refreshHealth(force = false): Promise<HealthData | null> {
  const cached = await loadHealth();
  if (!healthAvailable() || !(await isHealthConnected())) return cached;
  if (!force && cached && Date.now() - new Date(cached.fetchedAt).getTime() < REFRESH_MS) return cached;
  const [weights, sleep, hrv, restingHR] = await Promise.all([
    readBodyMass(90),
    readSleep(21),
    readDailyAverage('hrv', 70),
    readDailyAverage('restingHeartRate', 70),
  ]);
  const data: HealthData = { fetchedAt: new Date().toISOString(), weights, sleep, hrv, restingHR };
  try {
    await AsyncStorage.setItem(CACHE, JSON.stringify(data));
  } catch {}
  return data;
}
