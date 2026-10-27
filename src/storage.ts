import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCustomExercises } from './engine/exercises';
import { DELOAD_DAYS, Plan } from './engine/plan';
import { DAY_MS } from './engine/volume';
import { LoggedExercise, Session, Settings } from './engine/types';

// ------------------------------------------------------------------
// Everything is saved on the phone. Nothing leaves the device.
// ------------------------------------------------------------------

const SESSIONS = 'sessions';
const SETTINGS = 'settings';
const ACTIVE = 'active-workout';

export function defaultSettings(): Settings {
  return {
    mode: 'cut',
    unit: 'lb',
    blockStart: new Date().toISOString(),
    deloadStart: null,
    lastDeloadEnd: null,
    swaps: {},
    customExercises: [],
    nextDayOverride: null,
  };
}

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function write(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadSessions() {
  return read<Session[]>(SESSIONS, []);
}

export async function saveSession(session: Session) {
  const all = await loadSessions();
  await write(SESSIONS, [...all.filter((s) => s.id !== session.id), session]);
}

export async function deleteSession(id: string) {
  const all = await loadSessions();
  await write(SESSIONS, all.filter((s) => s.id !== id));
}

export async function loadSettings(): Promise<Settings> {
  const saved = await read<Partial<Settings> | null>(SETTINGS, null);
  if (!saved) {
    const fresh = defaultSettings();
    await write(SETTINGS, fresh);
    return fresh;
  }
  const settings = { ...defaultSettings(), ...saved };
  setCustomExercises(settings.customExercises);
  // A finished deload week starts a fresh block
  if (settings.deloadStart && Date.now() - new Date(settings.deloadStart).getTime() >= DELOAD_DAYS * DAY_MS) {
    const end = new Date(new Date(settings.deloadStart).getTime() + DELOAD_DAYS * DAY_MS).toISOString();
    return updateSettings({ deloadStart: null, lastDeloadEnd: end, blockStart: end });
  }
  return settings;
}

export async function updateSettings(change: Partial<Settings>) {
  const saved = await read<Partial<Settings> | null>(SETTINGS, null);
  const next = { ...defaultSettings(), ...saved, ...change };
  await write(SETTINGS, next);
  setCustomExercises(next.customExercises);
  return next;
}

// ---------- The workout in progress (survives closing the app) ----------

export type ActiveWorkout = {
  dayId: string;
  startedAt: string;
  deload: boolean;
  plan: Plan;
  exercises: LoggedExercise[];
};

export async function loadActive() {
  return read<ActiveWorkout | null>(ACTIVE, null);
}

export async function saveActive(active: ActiveWorkout) {
  await write(ACTIVE, active);
}

export async function clearActive() {
  await AsyncStorage.removeItem(ACTIVE);
}

// ---------- Units ----------

const LB_PER_KG = 2.20462;

export function toDisplay(lb: number | null, unit: Settings['unit']) {
  if (lb == null) return '';
  const v = unit === 'kg' ? Math.round((lb / LB_PER_KG) * 2) / 2 : lb;
  return String(Number.isInteger(v) ? v : v.toFixed(1));
}

export function fromDisplay(text: string, unit: Settings['unit']): number | null {
  const v = parseFloat(text.replace(',', '.'));
  if (!isFinite(v)) return null;
  return unit === 'kg' ? Math.round(v * LB_PER_KG * 10) / 10 : v;
}
