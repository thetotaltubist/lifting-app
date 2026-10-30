import AsyncStorage from '@react-native-async-storage/async-storage';
import { Step } from './engine';
import { HerSession, HerSettings, Level, MoveLog } from './types';

// ------------------------------------------------------------------
// Her data, saved on the phone under its own keys so it never mixes
// with John's workouts, settings, or history.
// ------------------------------------------------------------------

const SESSIONS = 'her:sessions';
const SETTINGS = 'her:settings';
const ACTIVE = 'her:active-workout';

export function defaultHerSettings(): HerSettings {
  const now = new Date().toISOString();
  return { name: 'Mandy', programStart: now, round: 1, level: 1, levelSince: now, nextOverride: null, gymDays: [0, 6] };
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

export async function loadHerSessions() {
  return read<HerSession[]>(SESSIONS, []);
}

export async function saveHerSession(session: HerSession) {
  const all = await loadHerSessions();
  await write(SESSIONS, [...all.filter((s) => s.id !== session.id), session]);
}

export async function deleteHerSession(id: string) {
  const all = await loadHerSessions();
  await write(SESSIONS, all.filter((s) => s.id !== id));
}

export async function loadHerSettings(): Promise<HerSettings> {
  const saved = await read<Partial<HerSettings> | null>(SETTINGS, null);
  if (!saved) {
    const fresh = defaultHerSettings();
    await write(SETTINGS, fresh);
    return fresh;
  }
  return { ...defaultHerSettings(), ...saved };
}

export async function updateHerSettings(change: Partial<HerSettings>) {
  const next = { ...(await loadHerSettings()), ...change };
  await write(SETTINGS, next);
  return next;
}

// ---------- The workout in progress (survives closing the app) ----------

export type HerActive = {
  workoutId: string;
  startedAt: string;
  level: Level;
  week: number;
  gym: boolean;
  steps: Step[];
  index: number; // the step she's on
  logs: Record<number, MoveLog>; // by step index
};

export async function loadHerActive() {
  return read<HerActive | null>(ACTIVE, null);
}

export async function saveHerActive(active: HerActive) {
  await write(ACTIVE, active);
}

export async function clearHerActive() {
  await AsyncStorage.removeItem(ACTIVE);
}
