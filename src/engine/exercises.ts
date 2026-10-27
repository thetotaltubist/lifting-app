import { DayTemplate, Exercise, Muscle } from './types';

// ------------------------------------------------------------------
// Exercise library. No barbell pressing and no dips because of the AC
// joint. Every exercise offers an optional pain rating afterward.
// Secondary muscles get half credit per set (an estimate, not exact).
// ------------------------------------------------------------------

export const EXERCISES: Exercise[] = [
  // Chest
  { id: 'pl-incline-press', name: 'Plate-loaded incline press', primary: 'chest', secondary: ['frontDelts', 'triceps'], repMin: 6, repMax: 10, kind: 'compound', increment: 10, tip: 'Stop the handles an inch above where your shoulder starts to pinch.' },
  { id: 'pl-flat-press', name: 'Plate-loaded flat press', primary: 'chest', secondary: ['frontDelts', 'triceps'], repMin: 6, repMax: 10, kind: 'compound', increment: 10 },
  { id: 'db-incline-press', name: 'Incline DB press (neutral grip)', primary: 'chest', secondary: ['frontDelts', 'triceps'], repMin: 8, repMax: 12, kind: 'compound', increment: 5, tip: 'Palms facing each other is usually easiest on the AC joint.' },
  { id: 'db-flat-press', name: 'Flat DB press (neutral grip)', primary: 'chest', secondary: ['frontDelts', 'triceps'], repMin: 8, repMax: 12, kind: 'compound', increment: 5 },
  { id: 'cable-fly', name: 'Cable fly', primary: 'chest', secondary: [], repMin: 10, repMax: 15, kind: 'isolation', increment: 5, tip: 'Stop when your hands are about shoulder-width apart. Crossing over loads the AC joint.' },
  { id: 'pec-deck', name: 'Pec deck', primary: 'chest', secondary: [], repMin: 10, repMax: 15, kind: 'isolation', increment: 5, tip: 'Stop before the handles touch.' },

  // Shoulders
  { id: 'machine-shoulder-press', name: 'Shoulder press (machine or plate-loaded)', primary: 'frontDelts', secondary: ['sideDelts', 'triceps'], repMin: 8, repMax: 12, kind: 'compound', increment: 10 },
  { id: 'db-shoulder-press', name: 'Seated DB shoulder press (neutral grip)', primary: 'frontDelts', secondary: ['sideDelts', 'triceps'], repMin: 8, repMax: 12, kind: 'compound', increment: 5 },
  { id: 'landmine-press', name: 'Landmine press', primary: 'frontDelts', secondary: ['chest', 'triceps'], repMin: 8, repMax: 12, kind: 'compound', increment: 5, tip: 'The angled path is often the easiest press for a sore AC joint.' },
  { id: 'db-lateral-raise', name: 'DB lateral raise', primary: 'sideDelts', secondary: [], repMin: 12, repMax: 20, kind: 'isolation', increment: 5 },
  { id: 'cable-lateral-raise', name: 'Cable lateral raise', primary: 'sideDelts', secondary: [], repMin: 12, repMax: 20, kind: 'isolation', increment: 5 },
  { id: 'reverse-pec-deck', name: 'Reverse pec deck', primary: 'rearDelts', secondary: [], repMin: 12, repMax: 20, kind: 'isolation', increment: 5 },
  { id: 'face-pull', name: 'Face pull', primary: 'rearDelts', secondary: [], repMin: 12, repMax: 20, kind: 'isolation', increment: 5 },

  // Triceps
  { id: 'triceps-pushdown', name: 'Triceps pushdown', primary: 'triceps', secondary: [], repMin: 10, repMax: 15, kind: 'isolation', increment: 5 },
  { id: 'overhead-cable-ext', name: 'Overhead cable triceps extension', primary: 'triceps', secondary: [], repMin: 10, repMax: 15, kind: 'isolation', increment: 5 },
  { id: 'single-arm-pushdown', name: 'Single-arm cable pushdown', primary: 'triceps', secondary: [], repMin: 12, repMax: 15, kind: 'isolation', increment: 2.5 },

  // Back
  { id: 'assisted-pullup', name: 'Assisted pull-up', primary: 'back', secondary: ['biceps'], repMin: 6, repMax: 12, kind: 'compound', increment: -10, tip: 'Log the assistance as the weight. Progress means less assistance.' },
  { id: 'lat-pulldown', name: 'Lat pulldown', primary: 'back', secondary: ['biceps'], repMin: 8, repMax: 12, kind: 'compound', increment: 10 },
  { id: 'neutral-pulldown', name: 'Neutral-grip pulldown', primary: 'back', secondary: ['biceps'], repMin: 8, repMax: 12, kind: 'compound', increment: 10 },
  { id: 'cable-row', name: 'Seated cable row', primary: 'back', secondary: ['biceps', 'rearDelts'], repMin: 8, repMax: 12, kind: 'compound', increment: 10 },
  { id: 'chest-supported-row', name: 'Chest-supported row (machine)', primary: 'back', secondary: ['biceps', 'rearDelts'], repMin: 8, repMax: 12, kind: 'compound', increment: 10 },
  { id: 'single-arm-cable-row', name: 'Single-arm cable row', primary: 'back', secondary: ['biceps'], repMin: 10, repMax: 15, kind: 'compound', increment: 5 },

  // Biceps
  { id: 'preacher-curl', name: 'Preacher curl', primary: 'biceps', secondary: [], repMin: 8, repMax: 12, kind: 'isolation', increment: 5 },
  { id: 'db-curl', name: 'DB curl', primary: 'biceps', secondary: [], repMin: 8, repMax: 12, kind: 'isolation', increment: 5 },
  { id: 'incline-db-curl', name: 'Incline DB curl', primary: 'biceps', secondary: [], repMin: 8, repMax: 12, kind: 'isolation', increment: 5 },
  { id: 'cable-curl', name: 'Cable curl', primary: 'biceps', secondary: [], repMin: 10, repMax: 15, kind: 'isolation', increment: 5 },
  { id: 'hammer-curl', name: 'Hammer curl', primary: 'biceps', secondary: [], repMin: 8, repMax: 12, kind: 'isolation', increment: 5 },

  // Legs
  { id: 'glute-kickback', name: 'Glute kickback', primary: 'glutes', secondary: [], repMin: 10, repMax: 15, kind: 'isolation', increment: 5 },
  { id: 'hip-thrust-machine', name: 'Hip thrust (machine)', primary: 'glutes', secondary: ['hamstrings'], repMin: 8, repMax: 12, kind: 'compound', increment: 10 },
  { id: 'db-sldl', name: 'DB stiff-leg deadlift', primary: 'hamstrings', secondary: ['glutes'], repMin: 8, repMax: 12, kind: 'compound', increment: 5 },
  { id: 'seated-leg-curl', name: 'Seated leg curl', primary: 'hamstrings', secondary: [], repMin: 10, repMax: 15, kind: 'isolation', increment: 5 },
  { id: 'lying-leg-curl', name: 'Lying leg curl', primary: 'hamstrings', secondary: [], repMin: 10, repMax: 15, kind: 'isolation', increment: 5 },
  { id: 'hack-squat', name: 'Hack squat', primary: 'quads', secondary: ['glutes'], repMin: 6, repMax: 10, kind: 'compound', increment: 10 },
  { id: 'leg-press', name: 'Leg press', primary: 'quads', secondary: ['glutes'], repMin: 8, repMax: 12, kind: 'compound', increment: 10 },
  { id: 'pendulum-squat', name: 'Pendulum squat', primary: 'quads', secondary: ['glutes'], repMin: 8, repMax: 12, kind: 'compound', increment: 10 },
  { id: 'leg-extension', name: 'Leg extension', primary: 'quads', secondary: [], repMin: 10, repMax: 15, kind: 'isolation', increment: 5 },
  { id: 'standing-calf-raise', name: 'Standing calf raise', primary: 'calves', secondary: [], repMin: 8, repMax: 15, kind: 'isolation', increment: 10 },
  { id: 'seated-calf-raise', name: 'Seated calf raise', primary: 'calves', secondary: [], repMin: 10, repMax: 20, kind: 'isolation', increment: 5 },

  // Abs
  { id: 'cable-crunch', name: 'Cable crunch', primary: 'abs', secondary: [], repMin: 10, repMax: 15, kind: 'isolation', increment: 5 },
  { id: 'ab-machine', name: 'Ab crunch machine', primary: 'abs', secondary: [], repMin: 10, repMax: 15, kind: 'isolation', increment: 5 },
];

const byId = new Map(EXERCISES.map((e) => [e.id, e]));
let custom: Exercise[] = [];

// Exercises John added himself. Called whenever settings load.
export function setCustomExercises(list: Exercise[]) {
  for (const e of custom) byId.delete(e.id);
  custom = list;
  for (const e of list) byId.set(e.id, e);
}

export function allExercises(): Exercise[] {
  return [...EXERCISES, ...custom];
}

// Anything logged with an exercise that no longer exists still shows up
const UNKNOWN: Exercise = { id: 'unknown', name: 'Removed exercise', primary: 'chest', secondary: [], repMin: 8, repMax: 12, kind: 'isolation', increment: 5 };

export function exercise(id: string): Exercise {
  return byId.get(id) ?? { ...UNKNOWN, id };
}

// Swaps keep the same main muscle so the day's volume stays the same
export function alternativesFor(id: string): Exercise[] {
  const e = exercise(id);
  return allExercises().filter((x) => x.id !== id && x.primary === e.primary);
}

export function makeCustomExercise(fields: Omit<Exercise, 'id' | 'secondary'> & { secondary?: Muscle[] }): Exercise {
  return { secondary: [], ...fields, id: `custom-${Date.now()}` };
}

// ------------------------------------------------------------------
// The rotation, built from John's own split. A and B days use the same
// movements in a slightly different order or variation.
// Base sets are a starting point; the planner scales them each session.
// ------------------------------------------------------------------

export const DAYS: DayTemplate[] = [
  {
    id: 'push-a',
    name: 'Push A',
    exercises: [
      { exerciseId: 'pl-incline-press', baseSets: 3 },
      { exerciseId: 'pl-flat-press', baseSets: 3 },
      { exerciseId: 'cable-fly', baseSets: 2 },
      { exerciseId: 'machine-shoulder-press', baseSets: 2 },
      { exerciseId: 'db-lateral-raise', baseSets: 3 },
      { exerciseId: 'triceps-pushdown', baseSets: 3 },
    ],
  },
  {
    id: 'pull-a',
    name: 'Pull A',
    exercises: [
      { exerciseId: 'assisted-pullup', baseSets: 3 },
      { exerciseId: 'lat-pulldown', baseSets: 3 },
      { exerciseId: 'cable-row', baseSets: 3 },
      { exerciseId: 'reverse-pec-deck', baseSets: 3 },
      { exerciseId: 'preacher-curl', baseSets: 3 },
      { exerciseId: 'db-curl', baseSets: 2 },
    ],
  },
  {
    id: 'legs-a',
    name: 'Legs A',
    exercises: [
      { exerciseId: 'glute-kickback', baseSets: 2 },
      { exerciseId: 'db-sldl', baseSets: 3 },
      { exerciseId: 'hack-squat', baseSets: 3 },
      { exerciseId: 'leg-press', baseSets: 2 },
      { exerciseId: 'leg-extension', baseSets: 2 },
      { exerciseId: 'seated-leg-curl', baseSets: 2 },
      { exerciseId: 'standing-calf-raise', baseSets: 3 },
    ],
  },
  {
    id: 'push-b',
    name: 'Push B',
    exercises: [
      { exerciseId: 'pl-flat-press', baseSets: 3 },
      { exerciseId: 'pl-incline-press', baseSets: 3 },
      { exerciseId: 'pec-deck', baseSets: 2 },
      { exerciseId: 'db-shoulder-press', baseSets: 2 },
      { exerciseId: 'cable-lateral-raise', baseSets: 3 },
      { exerciseId: 'triceps-pushdown', baseSets: 3 },
      { exerciseId: 'cable-crunch', baseSets: 2 },
    ],
  },
  {
    id: 'pull-b',
    name: 'Pull B',
    exercises: [
      { exerciseId: 'assisted-pullup', baseSets: 3 },
      { exerciseId: 'neutral-pulldown', baseSets: 3 },
      { exerciseId: 'chest-supported-row', baseSets: 3 },
      { exerciseId: 'face-pull', baseSets: 3 },
      { exerciseId: 'preacher-curl', baseSets: 2 },
      { exerciseId: 'db-curl', baseSets: 3 },
    ],
  },
  {
    id: 'legs-b',
    name: 'Legs B',
    exercises: [
      { exerciseId: 'glute-kickback', baseSets: 2 },
      { exerciseId: 'db-sldl', baseSets: 3 },
      { exerciseId: 'hack-squat', baseSets: 3 },
      { exerciseId: 'leg-press', baseSets: 2 },
      { exerciseId: 'leg-extension', baseSets: 2 },
      { exerciseId: 'lying-leg-curl', baseSets: 2 },
      { exerciseId: 'seated-calf-raise', baseSets: 3 },
      { exerciseId: 'cable-crunch', baseSets: 2 },
    ],
  },
];

export function day(id: string): DayTemplate {
  const d = DAYS.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown day ${id}`);
  return d;
}

export const MUSCLE_NAMES: Record<Muscle, string> = {
  chest: 'Chest',
  back: 'Back',
  frontDelts: 'Front delts',
  sideDelts: 'Side delts',
  rearDelts: 'Rear delts',
  triceps: 'Triceps',
  biceps: 'Biceps',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  abs: 'Abs',
};

// Body parts to offer when John reports pain, by day type
const PAIN_AREAS: Record<string, string[]> = {
  push: ['Shoulder', 'Elbow'],
  pull: ['Back', 'Elbow'],
  legs: ['Glute', 'Knee', 'Calf'],
};

export function painAreasFor(dayId: string): string[] {
  return PAIN_AREAS[dayId.split('-')[0]] ?? [...new Set(Object.values(PAIN_AREAS).flat())];
}
