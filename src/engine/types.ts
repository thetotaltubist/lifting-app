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
  shoulderCheck?: boolean; // no longer used: every exercise asks about pain now
  tip?: string;
};

export type DayTemplate = {
  id: string;
  name: string;
  // reps overrides the goal's rep range for this slot (5x5 is always 5)
  exercises: { exerciseId: string; baseSets: number; reps?: [number, number] }[];
  painAreas?: string[]; // body parts offered for a pain rating; missing uses the day id
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
  pain?: number | null; // 0-10, joint or muscle pain during this exercise
  painArea?: string | null; // where it hurt, e.g. 'Shoulder'
  shoulderPain?: number | null; // older logs, before pain covered any joint or muscle
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

// What the block is for. Changes reps, rest, how close to failure, and
// how many weekly sets the app aims for. See programs.ts.
export type Goal = 'strength' | 'hypertrophy' | 'endurance';

export type Settings = {
  mode: Mode;
  unit: 'lb' | 'kg';
  blockStart: string; // ISO, start of the current training block
  deloadStart: string | null; // ISO, set while a deload week is running
  lastDeloadEnd: string | null; // ISO
  swaps: Record<string, string>; // template exercise id -> replacement id, on every day it appears
  customExercises: Exercise[]; // exercises and machines John added himself
  nextDayOverride: string | null;
  rotation?: string[]; // day ids in John's order; missing means the program's order
  program?: string; // program id; missing means Push / Pull / Legs
  goal?: Goal; // missing means hypertrophy
  daysPerWeek?: number; // how many days a week he plans to lift; missing means 5
};
