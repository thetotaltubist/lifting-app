import { exercise } from './exercises';
import { Exercise, Goal, Settings } from './types';

// ------------------------------------------------------------------
// Programs and goals.
//
// A program is a list of days in rotation (still no calendar). A goal
// changes how those days are lifted: reps, rest, how close to failure,
// and how many weekly sets the app aims for. Days per week sets how
// often each muscle comes up, so the per-session dose and catch-up work
// the same way whatever the program. All names are generic.
// ------------------------------------------------------------------

export type Program = {
  id: string;
  name: string;
  short: string; // one line under the name
  days: string[]; // rotation order
  fits: [number, number]; // days a week it works for
  ideal: number[]; // days a week it's built for
  goals: Goal[]; // goals it suits
  focus?: Goal; // built for this goal, so it ranks first for it
  fixedSets?: boolean; // keeps its own sets every session (5x5), no scaling or catch-up
  guidance: string;
};

export const PROGRAMS: Program[] = [
  {
    id: 'full-body',
    name: 'Full body',
    short: 'Every main muscle, every session',
    days: ['full-a', 'full-b', 'full-c'],
    fits: [2, 3],
    ideal: [2, 3],
    goals: ['strength', 'hypertrophy', 'endurance'],
    guidance:
      'Each muscle gets trained 2 to 3 times a week, even on a short week. Twice a week builds at least as much muscle as once, so this is the best use of 2 or 3 days. Sessions are longer, with one exercise per muscle.',
  },
  {
    id: 'five-by-five',
    name: '5x5',
    short: 'A few big lifts, 5 sets of 5',
    days: ['five-a', 'five-b'],
    fits: [3, 3],
    ideal: [3],
    goals: ['strength'],
    focus: 'strength',
    fixedSets: true,
    guidance:
      'A classic strength program. You squat every session, then alternate a press and a row with a shoulder press and a deadlift. Get all 5 reps on every set and the weight goes up next time. Heavy sets of about 5 build strength best, and strength needs fewer sets than size does. There is little arm or shoulder work, so it builds less muscle. Presses use machines instead of a barbell, which is easier on the shoulder.',
  },
  {
    id: 'upper-lower',
    name: 'Upper / Lower',
    short: 'Upper body, then lower body',
    days: ['upper-a', 'lower-a', 'upper-b', 'lower-b'],
    fits: [3, 5],
    ideal: [4],
    goals: ['strength', 'hypertrophy', 'endurance'],
    guidance:
      'Each muscle gets trained twice a week in 4 sessions, which is where the research puts the sweet spot for size and strength. Sessions are shorter than full body, and it fits easily around a busy week.',
  },
  {
    id: 'hybrid',
    name: '5-day hybrid',
    short: 'Upper, Lower, Push, Pull, Legs',
    days: ['upper-a', 'lower-a', 'push-a', 'pull-a', 'legs-b'],
    fits: [5, 5],
    ideal: [5],
    goals: ['strength', 'hypertrophy'],
    guidance:
      'An upper and a lower day, then push, pull and legs. Each muscle comes up twice in the 5 days, with more room for arm and shoulder work than upper / lower alone.',
  },
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    short: 'Your original split',
    days: ['push-a', 'pull-a', 'legs-a', 'push-b', 'pull-b', 'legs-b'],
    fits: [5, 6],
    ideal: [6],
    goals: ['strength', 'hypertrophy', 'endurance'],
    guidance:
      'Push, pull and legs, twice through. Each muscle comes up twice in 6 sessions, or about 1.7 times a week at 5. The most room for weekly sets per muscle, so it suits experienced lifters going for size.',
  },
  {
    id: 'bro-split',
    name: 'Bro split',
    short: 'One body part a day',
    days: ['bro-chest', 'bro-back', 'bro-shoulders', 'bro-arms', 'bro-legs'],
    fits: [5, 6],
    ideal: [5],
    goals: ['hypertrophy'],
    guidance:
      'Chest, back, shoulders, arms and legs, each on its own day. When weekly sets are the same, training a muscle once a week builds nearly as much as twice; one well-known study found a small edge for twice. Big single sessions put more sets past the point where extra sets add much, so side delts and calves get a second day here. The app caps a muscle at 10 sets in one session, so back and legs can sit a little under their weekly target.',
  },
];

export const DEFAULT_PROGRAM = 'ppl';
export const DEFAULT_GOAL: Goal = 'hypertrophy';
export const DEFAULT_DAYS = 5;
export const DAY_CHOICES = [2, 3, 4, 5, 6];

export function program(id: string | undefined): Program {
  return PROGRAMS.find((p) => p.id === id) ?? PROGRAMS.find((p) => p.id === DEFAULT_PROGRAM)!;
}

export function programFor(settings: Settings): Program {
  return program(settings.program);
}

export function goalFor(settings: Settings): Goal {
  return settings.goal ?? DEFAULT_GOAL;
}

export function daysFor(settings: Settings): number {
  const d = settings.daysPerWeek ?? DEFAULT_DAYS;
  return Math.min(7, Math.max(1, Math.round(d)));
}

// ------------------------------------------------------------------
// Goals
// ------------------------------------------------------------------

export const GOALS: { id: Goal; name: string; short: string; guidance: string }[] = [
  {
    id: 'strength',
    name: 'Strength',
    short: 'Heavier weights, 4-6 reps on big lifts, longer rest, fewer sets',
    guidance:
      'Big lifts move to 4 to 6 reps with about 3 minutes of rest, and the app aims for about 30% fewer weekly sets. Strength comes mostly from lifting heavy, and it needs fewer sets than size does. Heavy sets stay 2 to 3 reps short of failure, since going all the way adds little strength.',
  },
  {
    id: 'hypertrophy',
    name: 'Hypertrophy',
    short: 'Moderate weights, 6-15 reps, the most weekly sets',
    guidance:
      'Moderate weights for about 6 to 15 reps, close to failure, with the most weekly sets. Weekly hard sets are what drive growth, and anywhere from about 5 to 30 reps works when the sets are hard.',
  },
  {
    id: 'endurance',
    name: 'Endurance',
    short: 'Lighter weights, 12-25 reps, short rest',
    guidance:
      'Lighter weights for 12 to 25 reps with about a minute of rest, and slightly fewer weekly sets. Higher reps and short rest build the ability to keep going, and still build some muscle when sets get close to failure.',
  },
];

export function goalInfo(goal: Goal) {
  return GOALS.find((g) => g.id === goal)!;
}

// How much of the hypertrophy weekly sets each goal aims for
export const GOAL_VOLUME: Record<Goal, number> = { strength: 0.7, hypertrophy: 1, endurance: 0.8 };

// With fewer days, the app aims for fewer weekly sets so sessions stay a
// sensible length. Small doses still build muscle and strength.
export function daysVolume(days: number) {
  if (days <= 2) return 0.5;
  if (days === 3) return 0.7;
  if (days === 4) return 0.85;
  return 1;
}

export const DAYS_GUIDANCE =
  'Pick what you can usually do. With fewer days the app aims for fewer weekly sets so sessions stay a sensible length (2 days is about half of 5 or 6). If you miss a day, the next sessions add catch-up sets, the same as always.';

// The exercise with this goal's rep range. A program slot can fix the reps (5x5).
export function withGoalReps(id: string, goal: Goal, reps?: [number, number]): Exercise {
  const e = exercise(id);
  if (reps) return { ...e, repMin: reps[0], repMax: reps[1] };
  if (goal === 'strength') return e.kind === 'compound' ? { ...e, repMin: 4, repMax: 6 } : { ...e, repMin: 8, repMax: 12 };
  if (goal === 'endurance') return e.kind === 'compound' ? { ...e, repMin: 12, repMax: 20 } : { ...e, repMin: 15, repMax: 25 };
  return e;
}

// ------------------------------------------------------------------
// Suggestions: which programs fit a goal and a number of days
// ------------------------------------------------------------------

export type ProgramFit = { program: Program; fit: 'best' | 'good' | 'other' };

export function suggestPrograms(goal: Goal, days: number): ProgramFit[] {
  const score = (p: Program) =>
    (p.goals.includes(goal) ? 10 : 0) + (days >= p.fits[0] && days <= p.fits[1] ? 5 : 0) + (p.ideal.includes(days) ? 3 : 0) + (p.focus === goal ? 1 : 0);
  const ranked = PROGRAMS.map((p, i) => ({ p, s: score(p), i })).sort((a, b) => b.s - a.s || a.i - b.i);
  return ranked.map(({ p, s }, k) => ({
    program: p,
    fit: s >= 15 ? (k === 0 ? 'best' : 'good') : 'other',
  }));
}
