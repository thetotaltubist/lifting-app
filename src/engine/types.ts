// ------------------------------------------------------------------
// Shapes shared by the training engine and the screens.
// Weights are always stored in pounds; screens convert for kg.
// ------------------------------------------------------------------

export type Muscle =
  | 'chest'
  | 'back'
  | 'frontDelts'
  | 'sideDelts'
  | 'rearDelts'
  | 'triceps'
  | 'biceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs';

export type Exercise = {
  id: string;
  name: string;
  primary: Muscle;
  secondary: Muscle[]; // each set counts as half a set for these
  repMin: number;
  repMax: number;
  kind: 'compound' | 'isolation';
  increment: number; // lb added when the top of the rep range is reached
  shoulderCheck?: boolean; // ask about AC joint pain after this exercise
  tip?: string;
};

export type DayTemplate = {
  id: string;
  name: string;
  exercises: { exerciseId: string; baseSets: number }[];
};

export type LoggedSet = {
  weight: number | null; // lb
  reps: number | null;
  rir: number | null; // reps in reserve
  done: boolean;
};

export type LoggedExercise = {
  exerciseId: string;
  sets: LoggedSet[];
  catchUpSets?: number;
  shoulderPain?: number | null; // 0-10, only for shoulderCheck exercises
};

export type Session = {
  id: string;
  dayId: string;
  startedAt: string; // ISO
  finishedAt: string; // ISO
  deload?: boolean;
  exercises: LoggedExercise[];
};

export type Mode = 'cut' | 'build';

export type Settings = {
  mode: Mode;
  unit: 'lb' | 'kg';
  blockStart: string; // ISO, start of the current training block
  deloadStart: string | null; // ISO, set while a deload week is running
  lastDeloadEnd: string | null; // ISO
  swaps: Record<string, string>; // template exercise id -> replacement id
  nextDayOverride: string | null;
};
