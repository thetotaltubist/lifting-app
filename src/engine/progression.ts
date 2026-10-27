import { exercise } from './exercises';
import { LoggedExercise, Session } from './types';

// ------------------------------------------------------------------
// Double progression: keep the weight until every working set reaches
// the top of the rep range, then add weight and start again at the
// bottom. Shoulder pain on pressing holds or lowers the weight instead.
// ------------------------------------------------------------------

export type Performance = { date: string; ex: LoggedExercise };

export type Suggestion = {
  weight: number | null; // lb; null means pick a starting weight
  targetReps: number;
  why: string;
  swapSuggested: boolean;
  stalled: boolean;
};

// Newest first
export function historyFor(exerciseId: string, sessions: Session[]): Performance[] {
  const out: Performance[] = [];
  for (const s of sessions) {
    for (const ex of s.exercises) {
      if (ex.exerciseId === exerciseId && ex.sets.some((x) => x.done && x.weight != null && (x.reps ?? 0) > 0)) {
        out.push({ date: s.finishedAt, ex });
      }
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

function workingSets(ex: LoggedExercise) {
  return ex.sets.filter((s) => s.done && s.weight != null && (s.reps ?? 0) > 0) as {
    weight: number;
    reps: number;
    rir: number | null;
  }[];
}

// The weight most sets were done with (warm-ups and drop sets don't steer it)
function mainWeight(ex: LoggedExercise) {
  const counts = new Map<number, number>();
  for (const s of workingSets(ex)) counts.set(s.weight, (counts.get(s.weight) ?? 0) + 1);
  let best: number | null = null;
  let n = 0;
  for (const [w, c] of counts) if (c > n || (c === n && best != null && w > best)) [best, n] = [w, c];
  return best;
}

function totalReps(ex: LoggedExercise, weight: number) {
  return workingSets(ex)
    .filter((s) => s.weight === weight)
    .reduce((t, s) => t + s.reps, 0);
}

export function roundTo(weight: number, step: number) {
  const s = Math.abs(step) || 5;
  return Math.max(0, Math.round(weight / s) * s);
}

// A lighter version of the weight. For assisted movements that means more assistance.
function easier(weight: number, fraction: number, increment: number) {
  return roundTo(increment < 0 ? weight * (1 + fraction) : weight * (1 - fraction), increment);
}

export function suggest(exerciseId: string, sessions: Session[], opts: { comeback: boolean; deload: boolean }): Suggestion {
  const e = exercise(exerciseId);
  const history = historyFor(exerciseId, sessions);
  const last = history[0];
  if (!last) {
    return {
      weight: null,
      targetReps: e.repMax - 2,
      why: `First time: pick a weight you could lift for about ${e.repMax - 2} reps with 2 left in the tank. The app takes it from there.`,
      swapSuggested: false,
      stalled: false,
    };
  }

  const weight = mainWeight(last.ex)!;
  const sets = workingSets(last.ex).filter((s) => s.weight === weight);
  const minReps = Math.min(...sets.map((s) => s.reps));
  const pain = last.ex.shoulderPain ?? 0;
  const prevPain = history[1]?.ex.shoulderPain ?? 0;

  // Shoulder first: pain decides before progress does
  if (e.shoulderCheck && pain >= 5) {
    return {
      weight: easier(weight, 0.1, e.increment),
      targetReps: e.repMin,
      why: `Shoulder was ${pain}/10 last time, so the weight drops about 10%. If it still hurts, swap this exercise.`,
      swapSuggested: true,
      stalled: false,
    };
  }
  if (e.shoulderCheck && pain >= 3) {
    return {
      weight,
      targetReps: Math.min(minReps, e.repMax),
      why: `Shoulder was ${pain}/10 last time, so the weight holds until it settles.`,
      swapSuggested: prevPain >= 3,
      stalled: false,
    };
  }

  if (opts.deload) {
    return { weight, targetReps: e.repMin, why: 'Deload week: same weight, fewer sets, and stop well short of failure.', swapSuggested: false, stalled: false };
  }
  if (opts.comeback) {
    return {
      weight: easier(weight, 0.05, e.increment),
      targetReps: Math.min(minReps, e.repMax),
      why: "First session after a break: a little lighter so you can ease back in.",
      swapSuggested: false,
      stalled: false,
    };
  }

  // Stalled: three sessions at this weight without more total reps
  const sameWeight = history.slice(0, 3).filter((p) => mainWeight(p.ex) === weight);
  const stalled =
    sameWeight.length === 3 &&
    totalReps(sameWeight[0].ex, weight) <= totalReps(sameWeight[2].ex, weight);

  if (minReps >= e.repMax) {
    const next = roundTo(weight + e.increment, e.increment);
    return {
      weight: next,
      targetReps: e.repMin,
      why:
        e.increment < 0
          ? `Hit ${e.repMax} on every set, so use ${Math.abs(e.increment)} lb less assistance.`
          : `Hit ${e.repMax} on every set last time, so add ${e.increment} lb.`,
      swapSuggested: false,
      stalled: false,
    };
  }

  return {
    weight,
    targetReps: Math.min(minReps + 1, e.repMax),
    why: stalled
      ? 'Stuck at this weight for 3 sessions. That is normal in a cut. Hold it, and if nothing moves in two more sessions, swap the exercise.'
      : `Same weight. Beat last time: aim for ${Math.min(minReps + 1, e.repMax)}+ reps on each set.`,
    swapSuggested: false,
    stalled,
  };
}
