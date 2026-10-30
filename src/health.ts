import AsyncStorage from '@react-native-async-storage/async-storage';
import { healthAvailable, readBodyMass, readDailyAverage, readSleep, requestHealthAccess } from '../modules/health';
import { HealthData } from './engine/health';
import { Person } from './person';

// ------------------------------------------------------------------
// Pulls Apple Health data and keeps the latest copy on the phone, so the
// plan still has it when Health is slow to answer. John and her each
// connect and cache separately. Health only ever has the data of the
// phone's owner, so her side shows her data on her own iPhone.
// ------------------------------------------------------------------

const REFRESH_MS = 30 * 60 * 1000;
const keys = (p: Person) => (p === 'her' ? { CONNECTED: 'her:health-connected', CACHE: 'her:health-cache' } : { CONNECTED: 'health-connected', CACHE: 'health-cache' });

export { healthAvailable };

export async function isHealthConnected(person: Person = 'john') {
  const { CONNECTED } = keys(person);
  try {
    return (await AsyncStorage.getItem(CONNECTED)) === '1';
  } catch {
    return false;
  }
}

export async function connectHealth(person: Person = 'john') {
  const ok = await requestHealthAccess();
  if (ok) {
    await AsyncStorage.setItem(keys(person).CONNECTED, '1');
    await refreshHealth(true, person);
  }
  return ok;
}

export async function loadHealth(person: Person = 'john'): Promise<HealthData | null> {
  const { CACHE } = keys(person);
  try {
    const raw = await AsyncStorage.getItem(CACHE);
    return raw ? (JSON.parse(raw) as HealthData) : null;
  } catch {
    return null;
  }
}

// Reads Health again if the saved copy is more than 30 minutes old
export async function refreshHealth(force = false, person: Person = 'john'): Promise<HealthData | null> {
  const cached = await loadHealth(person);
  if (!healthAvailable() || !(await isHealthConnected(person))) return cached;
  if (!force && cached && Date.now() - new Date(cached.fetchedAt).getTime() < REFRESH_MS) return cached;
  const [weights, sleep, hrv, restingHR] = await Promise.all([
    readBodyMass(90),
    readSleep(21),
    readDailyAverage('hrv', 70),
    readDailyAverage('restingHeartRate', 70),
  ]);
  const data: HealthData = { fetchedAt: new Date().toISOString(), weights, sleep, hrv, restingHR };
  try {
    await AsyncStorage.setItem(keys(person).CACHE, JSON.stringify(data));
  } catch {}
  return data;
}
