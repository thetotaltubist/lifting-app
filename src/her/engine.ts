import { DUMBBELLS, move, ROTATION } from './program';
import { CheckIn, HerSession, HerSettings, Level, Move, MoveLog, Workout } from './types';

// ------------------------------------------------------------------
// How her plan moves forward. Nothing gets harder on a schedule: the
// level only goes up when she says yes, after workouts that were done
// in full, felt about right, with good form and no symptoms. Weights go
// up one dumbbell at a time once she owns the top of the rep range.
// ------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;
export const PROGRAM_WEEKS = 6;

export type LevelSpec = {
  name: string;
  rounds: number; // rounds for the main circuits
  finisherRounds: number;
  cardio: number; // seconds per cardio interval
  core: number; // seconds per timed core hold
  restMove: number; // seconds between moves
  restRound: number; // seconds between rounds and circuits
};

export const LEVELS: Record<Level, LevelSpec> = {
  1: { name: 'Foundation', rounds: 2, finisherRounds: 1, cardio: 30, core: 30, restMove: 30, restRound: 60 },
  2: { name: 'Build', rounds: 2, finisherRounds: 2, cardio: 45, core: 40, restMove: 20, restRound: 45 },
  3: { name: 'Strong', rounds: 2, finisherRounds: 2, cardio: 60, core: 45, restMove: 15, restRound: 45 },
};

export const WARMUP_SECONDS = 45;
export const COOLDOWN_SECONDS = 40;
const STRETCH_PER_SIDE = 30;
const SECONDS_PER_REP = 2.5;

// ---------- Where she is in the 6 weeks ----------

export function programWeek(settings: HerSettings, now: Date) {
  const days = Math.floor((now.getTime() - new Date(settings.programStart).getTime()) / DAY_MS);
  return Math.max(1, Math.floor(days / 7) + 1);
}

export function programDone(settings: HerSettings, now: Date) {
  return programWeek(settings, now) > PROGRAM_WEEKS;
}

// Finisher A on odd weeks, B on even weeks
export function finisherFor(w: Workout, week: number) {
  return w.finishers[(week - 1) % 2];
}

// ---------- Next workout: always the next one in the rotation ----------

export function nextWorkoutId(sessions: HerSession[], settings: HerSettings): string {
  if (settings.nextOverride && ROTATION.includes(settings.nextOverride)) return settings.nextOverride;
  const last = [...sessions].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))[0];
  if (!last) return ROTATION[0];
  const i = ROTATION.indexOf(last.workoutId);
  return ROTATION[(i + 1) % ROTATION.length];
}

export function isGymDay(settings: HerSettings, now: Date) {
  return settings.gymDays.includes(now.getDay());
}

// ---------- Weight and rep suggestions ----------

export type MoveSuggestion = { weight: number | null; reps: number; why: string };

// The gym version is tracked on its own, since machine weights differ
export function usesGym(m: Move, gym: boolean) {
  return gym && !!m.gym;
}

export function moveName(m: Move, gym: boolean) {
  return usesGym(m, gym) ? m.gym!.name : m.name;
}

function lastLogs(moveId: string, gym: boolean, sessions: HerSession[]) {
  const sorted = [...sessions].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));
  for (const s of sorted) {
    const logs = s.logs.filter((l) => l.moveId === moveId && l.gym === gym && l.reps != null);
    if (logs.length) return { session: s, logs };
  }
  return null;
}

function dumbbellStep(weight: number, by: 1 | -1, cap: number) {
  const owned = DUMBBELLS.filter((d) => d <= cap);
  if (by > 0) return owned.find((d) => d > weight) ?? null;
  return [...owned].reverse().find((d) => d < weight) ?? null;
}

export function suggestMove(m: Move, gym: boolean, sessions: HerSession[]): MoveSuggestion {
  const [lo, hi] = m.reps ?? [0, 0];
  const onGym = usesGym(m, gym);
  const cap = Math.min(m.maxWeight ?? Infinity, DUMBBELLS[DUMBBELLS.length - 1]);
  const last = lastLogs(m.id, onGym, sessions);

  if (!last) {
    if (onGym) return { weight: null, reps: lo, why: 'First time on this one. Pick a weight you could lift about 20 times.' };
    if (m.start == null) return { weight: null, reps: lo, why: 'Bodyweight. Focus on smooth, controlled reps.' };
    return { weight: m.start, reps: lo, why: `Start with ${m.start} lb. If the last few reps feel easy, go up a dumbbell next time.` };
  }

  const weights = last.logs.map((l) => l.weight ?? 0);
  const lastWeight = Math.max(...weights) || null;
  const minReps = Math.min(...last.logs.map((l) => l.reps ?? 0));
  const allTop = last.logs.every((l) => (l.reps ?? 0) >= hi);
  const c: CheckIn | null = last.session.checkIn;

  if (c && (c.symptoms === 'stopped' || c.effort === 'tooHard')) {
    if (lastWeight != null && !onGym) {
      const down = dumbbellStep(lastWeight, -1, cap);
      if (down) return { weight: down, reps: lo, why: `Last time was too much, so one dumbbell lighter (${down} lb). Use the easier version if anything bothers you.` };
    }
    if (lastWeight != null && onGym) return { weight: Math.max(0, lastWeight - 5), reps: lo, why: 'Last time was too much, so a little lighter.' };
    return { weight: lastWeight, reps: lo, why: 'Last time was too much. Keep it easy and use the easier version if anything bothers you.' };
  }

  if (c && (c.symptoms === 'mild' || c.form === 'sloppy' || c.recovery === 'wiped')) {
    return { weight: lastWeight, reps: Math.max(lo, Math.min(hi, minReps)), why: 'Holding here until it feels smooth and easy on your body.' };
  }

  if (allTop && c?.effort !== 'hard') {
    if (lastWeight == null) return { weight: null, reps: hi, why: 'You own the full range. Slow the lowering to 3 seconds to keep it challenging.' };
    if (onGym) return { weight: lastWeight + 5, reps: lo, why: `You hit ${hi} every round. Up 5 lb.` };
    const up = dumbbellStep(lastWeight, 1, cap);
    if (up) return { weight: up, reps: lo, why: `You hit ${hi} every round at ${lastWeight} lb. Try ${up} lb.` };
    const capped = m.maxWeight != null && lastWeight >= m.maxWeight;
    return {
      weight: lastWeight,
      reps: hi,
      why: capped
        ? `${lastWeight} lb is the top for this one to keep weight off the neck. Slow the lowering to 3 seconds instead.`
        : 'That is your heaviest dumbbell. Slow the lowering to 3 seconds to keep it challenging.',
    };
  }

  const target = Math.max(lo, Math.min(hi, minReps + 1));
  return { weight: lastWeight, reps: target, why: `Same weight. Aim for ${target} reps every round.` };
}

// ---------- The guided workout, step by step ----------

export type Step =
  | {
      kind: 'timed';
      section: 'warmup' | 'circuit' | 'cooldown';
      moveId: string;
      seconds: number;
      circuit?: string;
      round?: number;
      rounds?: number;
    }
  | {
      kind: 'reps';
      section: 'circuit';
      moveId: string;
      reps: [number, number];
      target: number;
      weight: number | null;
      why: string;
      circuit: string;
      round: number;
      rounds: number;
    }
  | { kind: 'rest'; seconds: number; label: string };

export function buildSteps(w: Workout, level: Level, week: number, gym: boolean, sessions: HerSession[]): Step[] {
  const spec = LEVELS[level];
  const steps: Step[] = [];
  const restMove = w.light ? Math.max(spec.restMove, 20) : spec.restMove;

  for (const id of w.warmup) {
    const m = move(id);
    steps.push({ kind: 'timed', section: 'warmup', moveId: id, seconds: WARMUP_SECONDS * (m.perSide ? 2 : 1) });
  }

  const circuits = [...w.circuits, finisherFor(w, week)];
  circuits.forEach((c, ci) => {
    const finisher = ci === circuits.length - 1;
    const rounds = c.rounds ?? (finisher ? spec.finisherRounds : spec.rounds);
    steps.push({ kind: 'rest', seconds: spec.restRound, label: c.note ? `Up next: ${c.name}. ${c.note}` : `Up next: ${c.name}` });
    for (let r = 1; r <= rounds; r++) {
      if (r > 1) steps.push({ kind: 'rest', seconds: spec.restRound, label: `Round ${r} of ${rounds}` });
      c.moves.forEach((id, mi) => {
        if (mi > 0) steps.push({ kind: 'rest', seconds: restMove, label: 'Quick rest' });
        const m = move(id);
        if (m.reps) {
          const s = suggestMove(m, gym, sessions);
          steps.push({ kind: 'reps', section: 'circuit', moveId: id, reps: m.reps, target: s.reps, weight: s.weight, why: s.why, circuit: c.name, round: r, rounds });
        } else {
          const base = m.kind === 'cardio' ? spec.cardio : spec.core;
          steps.push({ kind: 'timed', section: 'circuit', moveId: id, seconds: base * (m.perSide ? 2 : 1), circuit: c.name, round: r, rounds });
        }
      });
    }
  });

  steps.push({ kind: 'rest', seconds: 30, label: 'Up next: cooldown' });
  for (const id of w.cooldown) {
    const m = move(id);
    steps.push({ kind: 'timed', section: 'cooldown', moveId: id, seconds: m.perSide ? STRETCH_PER_SIDE * 2 : COOLDOWN_SECONDS });
  }
  return steps;
}

export function stepSeconds(s: Step) {
  if (s.kind !== 'reps') return s.seconds;
  return s.target * SECONDS_PER_REP * (move(s.moveId).perSide ? 2 : 1);
}

export function estimateMinutes(steps: Step[]) {
  return Math.round(steps.reduce((t, s) => t + stepSeconds(s), 0) / 60);
}

// ---------- When to suggest the next level ----------

export const MIN_WORKOUTS_PER_LEVEL = 8;

export type LevelAdvice = { kind: 'up' | 'down' | 'hold'; title: string; body: string } | null;

function good(s: HerSession) {
  const c = s.checkIn;
  return s.completed && !!c && (c.effort === 'easy' || c.effort === 'right') && c.form === 'solid' && c.symptoms === 'none';
}

export function levelAdvice(sessions: HerSession[], settings: HerSettings): LevelAdvice {
  const recent = [...sessions].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));
  const last = recent[0];
  if (!last) return null;

  if (last.checkIn?.symptoms === 'stopped') {
    return {
      kind: settings.level > 1 ? 'down' : 'hold',
      title: 'Take it easy next time',
      body:
        settings.level > 1
          ? 'You had to stop for symptoms last time. Consider stepping back a level and using the easier versions. If symptoms keep coming back, check in with your surgeon.'
          : 'You had to stop for symptoms last time. Use the easier versions and take longer rests. If symptoms keep coming back, check in with your surgeon.',
    };
  }

  const atLevel = recent.filter((s) => s.level === settings.level && s.finishedAt >= settings.levelSince);
  const lastThree = recent.slice(0, 3);
  const tooHard = lastThree.filter((s) => s.checkIn && (s.checkIn.effort === 'hard' || s.checkIn.effort === 'tooHard')).length;
  if (lastThree.length === 3 && tooHard >= 2 && settings.level > 1) {
    return { kind: 'down', title: 'Feeling like a lot?', body: 'Two of your last three workouts felt hard. Stepping back a level is a good call. You can move up again when it feels right.' };
  }

  if (settings.level < 3 && atLevel.length >= MIN_WORKOUTS_PER_LEVEL) {
    const lastFive = atLevel.slice(0, 5);
    const goodCount = lastFive.filter(good).length;
    const wiped = recent.slice(0, 3).some((s) => s.checkIn?.recovery === 'wiped');
    const anySymptoms = lastFive.some((s) => s.checkIn && s.checkIn.symptoms !== 'none');
    if (goodCount >= 4 && !wiped && !anySymptoms) {
      const next = LEVELS[(settings.level + 1) as Level];
      return {
        kind: 'up',
        title: `Ready for Level ${settings.level + 1}?`,
        body: `Your last workouts were complete, felt about right, with solid form and no symptoms. ${next.name} means ${next.cardio}-second cardio intervals, ${next.rounds} rounds, and shorter rests. Only if you feel ready.`,
      };
    }
  }
  return null;
}

// Rounds she logged, for the session record
export type MoveStep = Exclude<Step, { kind: 'rest' }>;

export function logFromStep(s: MoveStep, gym: boolean, done: { weight: number | null; reps: number | null }): MoveLog {
  const m = move(s.moveId);
  return {
    moveId: m.id,
    gym: usesGym(m, gym),
    weight: done.weight,
    reps: s.kind === 'reps' ? done.reps : null,
    seconds: s.kind === 'timed' ? s.seconds : undefined,
  };
}
