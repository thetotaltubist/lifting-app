// ------------------------------------------------------------------
// Shapes for her side of the app: a 5-day dumbbell + cardio program
// run as guided circuits, like a fitness class.
// ------------------------------------------------------------------

export type MoveKind = 'strength' | 'cardio' | 'core' | 'stretch';

export type Move = {
  id: string;
  name: string;
  kind: MoveKind;
  reps?: [number, number]; // rep range; moves without one are timed
  perSide?: boolean; // reps or time are for each side
  start?: number; // starting dumbbell, lb. Missing means bodyweight
  floor?: boolean; // done lying or kneeling on the mat
  cue: string; // how to do it well
  gym?: { name: string; cue: string }; // machine or cable version on gym days
};

export type Circuit = {
  name: string;
  moves: string[]; // move ids, done back to back
  rounds?: number; // fixed rounds; missing means the level's default
  note?: string;
};

export type Workout = {
  id: string;
  name: string;
  short: string; // for chips
  minutes: [number, number]; // the target length from her plan
  focus: string;
  light?: boolean; // the lighter day: shorter rests don't apply
  warmup: string[]; // move ids, timed
  circuits: Circuit[];
  finishers: [Circuit, Circuit]; // A on odd weeks, B on even weeks, for variety
  cooldown: string[]; // move ids, timed
  gymNote?: string;
};

export type Level = 1 | 2 | 3;

export type Effort = 'easy' | 'right' | 'hard' | 'tooHard';
export type Form = 'solid' | 'sloppy';
export type Symptoms = 'none' | 'mild' | 'stopped';
export type Recovery = 'fresh' | 'sore' | 'wiped';

export type CheckIn = { effort: Effort; form: Form; symptoms: Symptoms; recovery: Recovery };

// One logged round of one move
export type MoveLog = {
  moveId: string;
  gym: boolean; // done with the gym version
  weight: number | null; // lb
  reps: number | null; // null for timed moves
  seconds?: number;
};

export type HerSession = {
  id: string;
  workoutId: string;
  startedAt: string;
  finishedAt: string;
  level: Level;
  week: number;
  gym: boolean;
  completed: boolean; // made it through every circuit
  logs: MoveLog[];
  checkIn: CheckIn | null;
};

export type HerSettings = {
  name: string;
  programStart: string; // ISO, start of the current 6 weeks
  round: number; // which time through the 6 weeks
  level: Level;
  levelSince: string; // ISO
  nextOverride: string | null;
  gymDays: number[]; // 0 = Sunday. Days she's at the full gym
};
