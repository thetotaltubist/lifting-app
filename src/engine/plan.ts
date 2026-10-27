import { DAYS, day, exercise } from './exercises';
import { catchUpPause, HealthData } from './health';
import { suggest, Suggestion } from './progression';
import { DAY_MS, addCredit, creditFor, rollingVolume, weeklyTarget } from './volume';
import { DayTemplate, Muscle, Session, Settings } from './types';

// ------------------------------------------------------------------
// Builds the next workout.
//
// 1. Pick the next day in the rotation (no calendar).
// 2. For each muscle that day trains, compare the last 7 days of hard sets
//    with the weekly target. A normal session gives the target divided by
//    how often that muscle comes up in a week (about 1.7 times at 5 sessions).
// 3. If a muscle is behind (missed days), add catch-up sets: at most 3 per
//    muscle per session, and never more than 10 for one muscle in a
//    session. The rest carries to the next time that muscle comes up.
// 4. After a break of 3+ days the first session back is normal volume,
//    and catch-up starts the session after.
// 5. Apple Health can pause catch-up: losing weight too fast, or 3 short
//    nights in a row (see health.ts).
// ------------------------------------------------------------------

export const MAX_CATCH_UP = 3;
export const MAX_SETS_PER_MUSCLE_SESSION = 10;
export const COMEBACK_GAP_DAYS = 3;
export const DELOAD_DAYS = 7;
export const ROTATION = DAYS.map((d) => d.id);
export const SESSIONS_PER_WEEK = 5; // the plan assumes at least 5 sessions a week

// How many times a muscle comes up in 7 days, at 5 sessions a week
export function hitsPerWeek(m: Muscle) {
  const days = DAYS.filter((d) => d.exercises.some((x) => exercise(x.exerciseId).primary === m)).length;
  return Math.max(1, (days / ROTATION.length) * SESSIONS_PER_WEEK);
}

export type PlannedExercise = {
  exerciseId: string;
  templateExerciseId: string; // the slot in the day, for swaps
  sets: number;
  catchUpSets: number;
  rirTarget: string;
  suggestion: Suggestion;
};

export type Plan = {
  day: DayTemplate;
  exercises: PlannedExercise[];
  blockWeek: number; // 0-based
  deload: boolean;
  comeback: boolean;
  notes: string[];
};

function sortedSessions(sessions: Session[]) {
  return [...sessions].sort((a, b) => a.finishedAt.localeCompare(b.finishedAt));
}

// John's own order if he set one, as long as it still has every day once
export function rotationFor(settings: Settings): string[] {
  const r = settings.rotation;
  const valid = r && r.length === ROTATION.length && ROTATION.every((id) => r.includes(id));
  return valid ? r : ROTATION;
}

export function nextDayId(sessions: Session[], settings: Settings): string {
  const rotation = rotationFor(settings);
  if (settings.nextDayOverride && rotation.includes(settings.nextDayOverride)) return settings.nextDayOverride;
  const last = sortedSessions(sessions).at(-1);
  if (!last) return rotation[0];
  const i = rotation.indexOf(last.dayId);
  return rotation[(i + 1) % rotation.length];
}

export function blockWeek(settings: Settings, now: Date) {
  return Math.max(0, Math.floor((now.getTime() - new Date(settings.blockStart).getTime()) / (7 * DAY_MS)));
}

export function isDeload(settings: Settings, now: Date) {
  if (!settings.deloadStart) return false;
  return now.getTime() - new Date(settings.deloadStart).getTime() < DELOAD_DAYS * DAY_MS;
}

// Reps in reserve: start the block further from failure and get closer
// as it goes on. Isolation work can go a bit closer than big presses.
export function rirTarget(kind: 'compound' | 'isolation', week: number, deload: boolean) {
  if (deload) return '3-4';
  const steps = kind === 'compound' ? ['2-3', '2', '1-2', '1-2', '1'] : ['1-2', '1', '0-1', '0-1', '0-1'];
  return steps[Math.min(week, steps.length - 1)];
}

// Split a muscle's sets across its exercises in proportion to base sets
function distribute(total: number, weights: number[], minSets: number) {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (total * w) / sum);
  const out = raw.map((r) => Math.floor(r));
  let left = Math.round(total) - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (let k = 0; left > 0 && order.length; k++, left--) out[order[k % order.length][1]]++;
  return out.map((n) => Math.max(minSets, Math.min(5, n)));
}

export function deloadSuggestion(sessions: Session[], settings: Settings, now: Date): string | null {
  if (isDeload(settings, now)) return null;
  const week = blockWeek(settings, now);
  if (week >= 6) return `You're in week ${week + 1} of this block. A lighter week will help you recover and set up the next block.`;
  if (week < 3) return null;
  // Performance slipping: several exercises lost reps at the same weight recently
  const recent = sortedSessions(sessions).filter((s) => now.getTime() - new Date(s.finishedAt).getTime() < 7 * DAY_MS);
  let slipping = 0;
  for (const s of recent) {
    for (const ex of s.exercises) {
      const r = suggest(ex.exerciseId, sessions.filter((x) => x.finishedAt <= s.finishedAt), { comeback: false, deload: false });
      if (r.stalled) slipping++;
    }
  }
  return slipping >= 3
    ? `${slipping} exercises have stalled this week. That points to fatigue, so a deload week is worth considering.`
    : null;
}

export function planNext(sessions: Session[], settings: Settings, now = new Date(), health: HealthData | null = null): Plan {
  const all = sortedSessions(sessions);
  const template = day(nextDayId(all, settings));
  const week = blockWeek(settings, now);
  const deload = isDeload(settings, now);
  const last = all.at(-1);
  const gapDays = last ? (now.getTime() - new Date(last.finishedAt).getTime()) / DAY_MS : 0;
  const comeback = !!last && gapDays >= COMEBACK_GAP_DAYS;

  // Catch-up only makes sense once there is a full week of history to
  // compare against, counted from the start, the last deload, or a break.
  const windowStart = Math.max(
    all[0] ? new Date(all[0].startedAt).getTime() : now.getTime(),
    settings.lastDeloadEnd ? new Date(settings.lastDeloadEnd).getTime() : 0,
  );
  const fullWindow = now.getTime() - windowStart >= 7 * DAY_MS;
  const done = rollingVolume(all, now);
  const pause = catchUpPause(health, now);

  const slots = template.exercises.map((x) => ({
    templateExerciseId: x.exerciseId,
    exerciseId: settings.swaps[x.exerciseId] ?? x.exerciseId,
    baseSets: x.baseSets,
  }));
  const primaries = [...new Set(slots.map((s) => exercise(s.exerciseId).primary))];

  // How many sets each muscle should get today, and how many are catch-up
  const plannedFor: Partial<Record<Muscle, { total: number; catchUp: number }>> = {};
  for (const m of primaries) {
    const target = weeklyTarget(m, settings.mode, week, deload);
    if (target === 0) continue;
    const dose = target / hitsPerWeek(m);
    let total = dose;
    if (!comeback && !deload && fullWindow && !pause) {
      const need = target - (done[m] ?? 0);
      const floor = Math.max(2, Math.ceil(dose * 0.6));
      total = Math.min(Math.max(need, floor), dose + MAX_CATCH_UP, MAX_SETS_PER_MUSCLE_SESSION);
    }
    plannedFor[m] = { total, catchUp: Math.max(0, Math.round(total - dose)) };
  }

  // First pass with base sets, to estimate the half credit muscles get
  // from other exercises today (presses count toward triceps, rows toward biceps)
  const setsFor = (credit: Partial<Record<Muscle, number>>, sizes: number[]) => {
    const out = new Map<string, number>();
    for (const m of primaries) {
      const idx = slots.map((s, i) => (exercise(s.exerciseId).primary === m ? i : -1)).filter((i) => i >= 0);
      const p = plannedFor[m];
      if (!p) {
        idx.forEach((i) => out.set(String(i), sizes[i]));
        continue;
      }
      const direct = Math.round(p.total - (credit[m] ?? 0));
      distribute(direct, idx.map((i) => slots[i].baseSets), deload ? 1 : 2).forEach((n, k) => out.set(String(idx[k]), n));
    }
    return slots.map((_, i) => out.get(String(i)) ?? slots[i].baseSets);
  };
  const secondaryCredit = (sizes: number[]) => {
    const total: Partial<Record<Muscle, number>> = {};
    slots.forEach((s, i) => {
      const c = creditFor(s.exerciseId, sizes[i]);
      delete c[exercise(s.exerciseId).primary];
      addCredit(total, c);
    });
    return total;
  };
  const firstPass = setsFor({}, slots.map((s) => s.baseSets));
  const sizes = setsFor(secondaryCredit(firstPass), firstPass);

  // Hand each muscle's catch-up sets to its exercises, first ones first
  const catchUpLeft: Partial<Record<Muscle, number>> = {};
  for (const m of primaries) catchUpLeft[m] = plannedFor[m]?.catchUp ?? 0;

  const exercises: PlannedExercise[] = slots.map((s, i) => {
    const e = exercise(s.exerciseId);
    const left = catchUpLeft[e.primary] ?? 0;
    const catchUpSets = Math.min(left, Math.max(0, sizes[i] - 1));
    catchUpLeft[e.primary] = left - catchUpSets;
    return {
      exerciseId: s.exerciseId,
      templateExerciseId: s.templateExerciseId,
      sets: deload ? Math.max(1, sizes[i]) : sizes[i],
      catchUpSets,
      rirTarget: rirTarget(e.kind, week, deload),
      suggestion: suggest(s.exerciseId, all, { comeback, deload }),
    };
  });

  const notes: string[] = [];
  if (deload) notes.push('Deload week: about half the sets, same weights, 3-4 reps in reserve.');
  if (comeback) notes.push(`${Math.floor(gapDays)} days since your last workout. Today is normal volume. Catch-up sets start next session.`);
  if (!fullWindow && !comeback && !deload) notes.push('Building your first week of history. Catch-up starts once there are 7 days to compare.');
  if (pause && !comeback && !deload) notes.push(pause);
  const caught = exercises.reduce((t, e) => t + e.catchUpSets, 0);
  if (caught > 0) notes.push(`${caught} catch-up ${caught === 1 ? 'set' : 'sets'} added for muscles that fell behind this week.`);

  return { day: template, exercises, blockWeek: week, deload, comeback, notes };
}
