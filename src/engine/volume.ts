import { exercise } from './exercises';
import { LoggedExercise, Mode, Muscle, Session } from './types';

// ------------------------------------------------------------------
// Weekly hard-set targets and the rolling 7-day count.
//
// Ranges are [start of block, peak of block]. Each block starts near the
// low end and ramps up, so you aren't starting at your maximum volume.
// Cut ranges sit a bit lower than build: in a calorie deficit, extra sets
// buy less muscle and cost more recovery. They still start around 10 sets
// for the big muscles, well above the minimum needed to keep muscle, since
// John is an experienced lifter. See science.ts.
// Front delts have no target of their own; pressing covers them.
// ------------------------------------------------------------------

export const TARGETS: Record<Mode, Partial<Record<Muscle, [number, number]>>> = {
  cut: {
    chest: [10, 14],
    back: [12, 16],
    sideDelts: [10, 16],
    rearDelts: [6, 10],
    triceps: [6, 10],
    biceps: [6, 10],
    quads: [10, 14],
    hamstrings: [8, 12],
    glutes: [4, 8],
    calves: [6, 10],
    abs: [4, 8],
  },
  build: {
    chest: [12, 18],
    back: [14, 20],
    sideDelts: [12, 20],
    rearDelts: [8, 14],
    triceps: [8, 14],
    biceps: [8, 14],
    quads: [12, 18],
    hamstrings: [10, 14],
    glutes: [6, 12],
    calves: [8, 14],
    abs: [6, 10],
  },
};

export const RAMP_WEEKS = 4; // weeks to go from the low end to the peak

export function weeklyTarget(muscle: Muscle, mode: Mode, blockWeek: number, deload: boolean): number {
  const range = TARGETS[mode][muscle];
  if (!range) return 0;
  const [lo, hi] = range;
  if (deload) return Math.round(lo / 2);
  const t = Math.min(Math.max(blockWeek, 0), RAMP_WEEKS) / RAMP_WEEKS;
  return Math.round(lo + (hi - lo) * t);
}

export const DAY_MS = 24 * 60 * 60 * 1000;

// A set counts once it's checked off with at least one rep
export function hardSets(ex: LoggedExercise) {
  return ex.sets.filter((s) => s.done && (s.reps ?? 0) > 0).length;
}

export function creditFor(exerciseId: string, sets: number): Partial<Record<Muscle, number>> {
  const e = exercise(exerciseId);
  const out: Partial<Record<Muscle, number>> = { [e.primary]: sets };
  for (const m of e.secondary) out[m] = (out[m] ?? 0) + sets * 0.5;
  return out;
}

export function addCredit(total: Partial<Record<Muscle, number>>, add: Partial<Record<Muscle, number>>) {
  for (const [m, v] of Object.entries(add) as [Muscle, number][]) total[m] = (total[m] ?? 0) + v;
  return total;
}

// Hard sets per muscle finished in the last `days` days
export function rollingVolume(sessions: Session[], now: Date, days = 7): Partial<Record<Muscle, number>> {
  const since = now.getTime() - days * DAY_MS;
  const total: Partial<Record<Muscle, number>> = {};
  for (const s of sessions) {
    const t = new Date(s.finishedAt).getTime();
    if (t <= since || t > now.getTime()) continue;
    for (const ex of s.exercises) addCredit(total, creditFor(ex.exerciseId, hardSets(ex)));
  }
  return total;
}
