import { Move, Workout } from './types';

// ------------------------------------------------------------------
// Her program: high-rep dumbbell circuits with cardio, in the style of a
// guided home fitness class. Mat work is grouped into its own circuit so
// the flow doesn't keep going down to the floor and back up.
// ------------------------------------------------------------------

export const DUMBBELLS = [5, 8, 10, 12, 15, 20];

const M: Move[] = [
  // ---------- Warm-up (timed) ----------
  { id: 'wu-march', name: 'Jog in place', kind: 'cardio', cue: 'Easy jog, pump the arms. Pick up the pace for the last 15 seconds.' },
  { id: 'wu-shoulder-rolls', name: 'Arm swings', kind: 'stretch', cue: 'Swing the arms open wide, then hug across the chest. Big and loose.' },
  { id: 'wu-step-touch', name: 'Jumping jacks, easy pace', kind: 'cardio', cue: 'Light and steady to get the heart rate up.' },
  { id: 'wu-hip-circles', name: 'Leg swings', kind: 'stretch', perSide: true, cue: 'Hand on a wall, swing one leg forward and back, then side to side.' },
  { id: 'wu-arm-circles', name: 'Arm circles', kind: 'stretch', cue: 'Arms out to the sides. Small circles forward, then big circles back.' },
  { id: 'wu-chair-squat', name: 'Bodyweight squats', kind: 'cardio', cue: 'Full depth, steady pace, arms forward for balance.' },
  { id: 'wu-good-morning', name: 'Inchworms', kind: 'stretch', cue: 'Hinge down, walk the hands out to a plank, walk them back and stand up.' },

  // ---------- Cardio (timed) ----------
  // Some ids keep an older move's name (step-jacks, w-raise, clamshell...)
  // so workouts already logged still find them
  { id: 'step-jacks', name: 'Jumping jacks', kind: 'cardio', cue: 'Jump the feet out wide as the arms sweep up, then jump back in. Land softly on the balls of your feet.' },
  { id: 'boxer-shuffle', name: 'Boxer shuffle with punches', kind: 'cardio', cue: 'Light bounce on the balls of the feet, quick punches at chest height. No weights.' },
  { id: 'knee-drives', name: 'High knees', kind: 'cardio', cue: 'Run in place, knees to hip height, quick arms.' },
  { id: 'skater-steps', name: 'Skaters', kind: 'cardio', cue: 'Hop side to side, landing on one foot with the other leg sweeping behind. Land softly.' },
  { id: 'side-shuffle', name: 'Lateral shuffle with floor touch', kind: 'cardio', cue: 'Shuffle three steps, drop low and touch the floor, shuffle back.' },
  { id: 'fast-march', name: 'Butt kicks', kind: 'cardio', cue: 'Jog in place, heels up to your seat. Quick feet.' },
  { id: 'heel-digs', name: 'Squat jacks', kind: 'cardio', cue: 'Jump the feet wide into a squat, jump them back together. Hands at your chest.' },
  { id: 'grapevine', name: 'Burpees', kind: 'cardio', cue: 'Squat, hands down, jump back to a plank, jump the feet in, stand and reach up. Steady pace.' },
  { id: 'squat-hold', name: 'Squat jumps', kind: 'cardio', cue: 'Squat down, jump up, land softly back into the squat.' },

  // ---------- Upper body ----------
  { id: 'bent-row', name: 'Bent-over row', kind: 'strength', reps: [12, 15], start: 15, cue: 'Hinge to about 45° with a flat back. Pull the elbows back to the ribs.', gym: { name: 'Seated cable row', cue: 'Sit tall, pull the handle to your belly button.' } },
  { id: 'single-row', name: 'Single-arm row', kind: 'strength', reps: [12, 15], perSide: true, start: 15, cue: 'Hand on a bench or couch, pull the dumbbell to the hip. Squeeze at the top.', gym: { name: 'Lat pulldown', cue: 'Wide grip, pull to the top of the chest. Chest up.' } },
  { id: 'lateral-raise', name: 'Lateral raise', kind: 'strength', reps: [12, 15], start: 8, cue: 'Raise out to the sides to shoulder height. Slight bend in the elbows.', gym: { name: 'Cable lateral raise', cue: 'One arm at a time, to shoulder height.' } },
  { id: 'front-raise', name: 'Front raise', kind: 'strength', reps: [12, 15], start: 8, cue: 'Raise in front to shoulder height, then lower slowly.' },
  { id: 'shoulder-press', name: 'Standing shoulder press', kind: 'strength', reps: [12, 15], start: 10, cue: 'Dumbbells at shoulder height, press straight up, lower with control. Brace the core.', gym: { name: 'Machine shoulder press', cue: 'Back against the pad. Press up, lower with control.' } },
  { id: 'reverse-fly', name: 'Reverse fly', kind: 'strength', reps: [15, 20], start: 8, cue: 'Hinge forward with a flat back. Open the arms out wide, squeeze the shoulder blades.', gym: { name: 'Reverse pec deck', cue: 'Chest against the pad, open the arms wide.' } },
  { id: 'w-raise', name: 'Overhead triceps extension', kind: 'strength', reps: [12, 15], start: 12, cue: 'One dumbbell in both hands overhead. Lower behind your head, elbows pointing up, then extend.', gym: { name: 'Overhead cable extension', cue: 'Rope behind your head, extend forward and up.' } },
  { id: 'biceps-curl', name: 'Biceps curl', kind: 'strength', reps: [12, 15], start: 12, cue: 'Elbows pinned at your sides. Lower slowly.', gym: { name: 'Cable curl', cue: 'Elbows at your sides, slow on the way down.' } },
  { id: 'hammer-curl', name: 'Hammer curl', kind: 'strength', reps: [12, 15], start: 12, cue: 'Palms facing in. Elbows stay still.', gym: { name: 'Rope hammer curl', cue: 'Rope on a low cable. Elbows at your sides.' } },
  { id: 'zottman-curl', name: 'Zottman curl', kind: 'strength', reps: [12, 15], start: 10, cue: 'Curl up palms up, turn palms down at the top, lower slowly.' },
  { id: 'kickback', name: 'Triceps kickback', kind: 'strength', reps: [12, 15], start: 10, cue: 'Hinge forward, upper arms by your sides, straighten the arms back.', gym: { name: 'Triceps pushdown', cue: 'Elbows at your sides, push the bar or rope down.' } },

  // ---------- Chest (on the mat) ----------
  { id: 'floor-press', name: 'Floor chest press', kind: 'strength', reps: [12, 15], start: 15, floor: true, cue: 'Lie on your back, knees bent. Press up, lower until the elbows touch the floor.', gym: { name: 'Dumbbell bench press', cue: 'Flat bench, lower to the chest, press up.' } },
  { id: 'floor-fly', name: 'Floor fly', kind: 'strength', reps: [12, 15], start: 10, floor: true, cue: 'Arms open wide with a soft elbow until the upper arms touch the mat, then hug back up.', gym: { name: 'Pec deck', cue: 'Slow squeeze, pause at the middle.' } },
  { id: 'close-press', name: 'Push-ups', kind: 'strength', reps: [10, 15], floor: true, cue: 'Hands just wider than the shoulders, body in a straight line, chest to the floor.', gym: { name: 'Chest press machine', cue: 'Press out, slow on the way back.' } },

  // ---------- Lower body ----------
  { id: 'goblet-squat', name: 'Goblet squat', kind: 'strength', reps: [12, 15], start: 20, cue: 'Hold one dumbbell at your chest. Sit back and down, chest up.', gym: { name: 'Leg press', cue: 'Feet shoulder-width, lower until the knees are at 90°, press up.' } },
  { id: 'sumo-squat', name: 'Sumo squat', kind: 'strength', reps: [15, 20], start: 20, cue: 'Wide stance, toes out, hold one dumbbell between your legs. Sit straight down.', gym: { name: 'Hip abduction machine', cue: 'Sit tall, push the knees out, slow on the way back.' } },
  { id: 'rdl', name: 'Romanian deadlift', kind: 'strength', reps: [12, 15], start: 15, cue: 'Soft knees, push the hips back with a flat back. Dumbbells slide down the thighs.', gym: { name: 'Seated leg curl', cue: 'Curl down, slow on the way back.' } },
  { id: 'staggered-rdl', name: 'Single-leg Romanian deadlift', kind: 'strength', reps: [10, 12], perSide: true, start: 15, cue: 'Balance on one leg, hinge forward as the back leg lifts. Keep the hips level.' },
  { id: 'reverse-lunge', name: 'Reverse lunge', kind: 'strength', reps: [10, 12], perSide: true, start: 12, cue: 'Step back, lower the back knee toward the floor, push through the front heel. Torso tall.', gym: { name: 'Smith machine split squat', cue: 'Feet staggered, straight down and up.' } },
  { id: 'curtsy-lunge', name: 'Curtsy lunge', kind: 'strength', reps: [10, 12], perSide: true, start: 10, cue: 'Step one leg behind and across. Hips stay square.' },
  { id: 'calf-raise', name: 'Single-leg calf raise', kind: 'strength', reps: [15, 20], perSide: true, start: 20, cue: 'Dumbbell in one hand, up onto the toes of one foot, pause, lower slowly.', gym: { name: 'Calf raise machine', cue: 'Full stretch at the bottom, pause at the top.' } },
  { id: 'standing-kickback', name: 'Bulgarian split squat', kind: 'strength', reps: [10, 12], perSide: true, start: 10, cue: 'Back foot up on a bench or couch. Lower straight down, push through the front heel.' },

  // ---------- Glutes and core on the mat ----------
  { id: 'glute-bridge', name: 'Glute bridge', kind: 'strength', reps: [15, 20], start: 20, floor: true, cue: 'Dumbbell across the hips. Drive through the heels, squeeze hard at the top.', gym: { name: 'Hip thrust machine', cue: 'Squeeze at the top, lower with control.' } },
  { id: 'single-bridge', name: 'Single-leg glute bridge', kind: 'strength', reps: [10, 12], perSide: true, floor: true, cue: 'One foot down, the other knee hugged in or leg extended. Lift and squeeze.' },
  { id: 'side-leg-lift', name: 'Side-lying leg lift', kind: 'strength', reps: [15, 20], perSide: true, floor: true, cue: 'Head resting on your bottom arm. Lift the top leg slightly behind you.' },
  { id: 'clamshell', name: 'Donkey kicks', kind: 'strength', reps: [15, 20], perSide: true, floor: true, cue: 'On hands and knees, kick one heel up toward the ceiling, squeeze the glute.' },
  { id: 'dead-bug', name: 'Dead bug', kind: 'core', reps: [10, 12], perSide: true, floor: true, cue: 'Head stays on the mat. Low back pressed down. Lower opposite arm and leg slowly.' },
  { id: 'bird-dog', name: 'Bicycle crunch', kind: 'core', reps: [12, 15], perSide: true, floor: true, cue: 'Elbow to the opposite knee as the other leg extends. Slow and controlled.' },
  { id: 'plank', name: 'Forearm plank', kind: 'core', floor: true, cue: 'Elbows under shoulders, straight line from head to heels. Eyes on the mat between your hands. Keep breathing.' },
  { id: 'side-plank', name: 'Side plank', kind: 'core', perSide: true, floor: true, cue: 'Elbow under shoulder, feet stacked, lift the hips into a straight line.' },
  { id: 'bridge-march', name: 'Bridge march', kind: 'core', floor: true, cue: 'Hold a bridge and slowly lift one foot at a time. Hips stay level.' },

  // ---------- Standing core ----------
  { id: 'oblique-crunch', name: 'Dumbbell woodchop', kind: 'core', reps: [12, 15], perSide: true, start: 10, cue: 'Dumbbell in both hands, chop from high on one side down across to the opposite knee.' },
  { id: 'suitcase-march', name: 'Suitcase march', kind: 'core', start: 20, cue: 'One dumbbell in one hand, march with high knees without leaning. Switch hands halfway.' },
  { id: 'side-bend', name: 'Standing side bend', kind: 'core', reps: [12, 15], perSide: true, start: 15, cue: 'Dumbbell in one hand, slide it down the leg and come back up.' },
  { id: 'cross-knee', name: 'Standing bicycle', kind: 'core', reps: [12, 15], perSide: true, cue: 'Hands behind the head, drive one knee up to the opposite elbow. Quick pace.' },

  // ---------- Cooldown (timed) ----------
  { id: 'cd-walk', name: 'Walk it out', kind: 'stretch', cue: 'Walk around and bring the heart rate down. Deep breaths.' },
  { id: 'cd-chest', name: 'Standing chest opener', kind: 'stretch', cue: 'Clasp hands behind you, open the chest.' },
  { id: 'cd-cross-arm', name: 'Cross-body shoulder stretch', kind: 'stretch', perSide: true, cue: 'Pull one arm across your chest. Relax the shoulders.' },
  { id: 'cd-triceps', name: 'Overhead triceps stretch', kind: 'stretch', perSide: true, cue: 'Reach one hand down your back, gently press the elbow with the other hand.' },
  { id: 'cd-quad', name: 'Standing quad stretch', kind: 'stretch', perSide: true, cue: 'Pull one heel toward your seat, knees together.' },
  { id: 'cd-hamstring', name: 'Standing hamstring stretch', kind: 'stretch', perSide: true, cue: 'One heel forward, toes up, hinge with a flat back.' },
  { id: 'cd-figure4', name: 'Figure-4 stretch', kind: 'stretch', perSide: true, cue: 'Ankle over the opposite knee, sit back into it and lean forward with a flat back.' },
  { id: 'cd-child', name: "Child's pose", kind: 'stretch', floor: true, cue: 'Knees wide, forehead resting on the mat or your hands.' },
  { id: 'cd-breathe', name: 'Belly breathing', kind: 'stretch', floor: true, cue: 'Lie down, knees bent, one hand on your belly. Slow breaths in and out.' },
];

export const MOVES = M;
const byId = new Map(M.map((m) => [m.id, m]));

// Anything logged with a move that no longer exists still shows up
const UNKNOWN: Move = { id: 'unknown', name: 'Removed move', kind: 'strength', cue: '' };

export function move(id: string): Move {
  return byId.get(id) ?? UNKNOWN;
}

const WARMUP_UPPER = ['wu-march', 'wu-shoulder-rolls', 'wu-arm-circles', 'wu-step-touch', 'wu-good-morning'];
const WARMUP_LOWER = ['wu-march', 'wu-hip-circles', 'wu-step-touch', 'wu-chair-squat', 'wu-good-morning'];
const WARMUP_FULL = ['wu-march', 'wu-shoulder-rolls', 'wu-hip-circles', 'wu-step-touch', 'wu-chair-squat'];
const COOLDOWN_UPPER = ['cd-walk', 'cd-chest', 'cd-cross-arm', 'cd-triceps', 'cd-child', 'cd-breathe'];
const COOLDOWN_LOWER = ['cd-walk', 'cd-quad', 'cd-hamstring', 'cd-figure4', 'cd-child', 'cd-breathe'];
const COOLDOWN_FULL = ['cd-walk', 'cd-chest', 'cd-quad', 'cd-hamstring', 'cd-figure4', 'cd-breathe'];

const GYM_CARDIO = 'At the gym, you can do the cardio intervals on a bike, elliptical, or incline walk instead.';

export const WORKOUTS: Workout[] = [
  {
    id: 'upper',
    name: 'Upper Body Strength + Cardio',
    short: 'Upper',
    minutes: [35, 40],
    focus: 'Chest, back, shoulders, biceps and triceps, with short cardio bursts.',
    warmup: WARMUP_UPPER,
    circuits: [
      { name: 'Back and shoulders', moves: ['bent-row', 'lateral-raise', 'biceps-curl', 'step-jacks'] },
      { name: 'Shoulders and arms', moves: ['shoulder-press', 'hammer-curl', 'kickback', 'boxer-shuffle'] },
      { name: 'Chest on the mat', moves: ['floor-press', 'close-press', 'floor-fly'] },
    ],
    finishers: [
      { name: 'Finisher', moves: ['reverse-fly', 'front-raise', 'fast-march'] },
      { name: 'Finisher', moves: ['zottman-curl', 'w-raise', 'heel-digs'] },
    ],
    cooldown: COOLDOWN_UPPER,
    gymNote: GYM_CARDIO,
  },
  {
    id: 'lower',
    name: 'Lower Body + Glutes',
    short: 'Lower',
    minutes: [35, 40],
    focus: 'Quads, hamstrings, glutes and calves, with a little cardio.',
    warmup: WARMUP_LOWER,
    circuits: [
      { name: 'Squat and hinge', moves: ['goblet-squat', 'rdl', 'skater-steps'] },
      { name: 'Lunges and calves', moves: ['reverse-lunge', 'sumo-squat', 'calf-raise', 'side-shuffle'] },
      { name: 'Glutes on the mat', moves: ['glute-bridge', 'single-bridge', 'clamshell'] },
    ],
    finishers: [
      { name: 'Finisher', moves: ['standing-kickback', 'squat-hold'] },
      { name: 'Finisher', moves: ['curtsy-lunge', 'staggered-rdl'] },
    ],
    cooldown: COOLDOWN_LOWER,
    gymNote: GYM_CARDIO,
  },
  {
    id: 'cardio-core',
    name: 'Cardio + Core',
    short: 'Cardio + Core',
    minutes: [25, 35],
    focus: 'Cardio intervals and core stability. A lighter day for the muscles.',
    light: true,
    warmup: WARMUP_FULL,
    circuits: [
      { name: 'Cardio intervals', moves: ['fast-march', 'step-jacks', 'knee-drives', 'skater-steps'] },
      { name: 'Standing core', moves: ['oblique-crunch', 'suitcase-march', 'side-bend'], rounds: 1 },
      { name: 'Core on the mat', moves: ['dead-bug', 'bird-dog', 'plank', 'side-plank'], rounds: 1 },
    ],
    finishers: [
      { name: 'Cardio finisher', moves: ['heel-digs', 'side-shuffle', 'fast-march'], rounds: 1 },
      { name: 'Cardio finisher', moves: ['grapevine', 'cross-knee', 'boxer-shuffle'], rounds: 1 },
    ],
    cooldown: COOLDOWN_FULL,
    gymNote: GYM_CARDIO,
  },
  {
    id: 'total',
    name: 'Total Body Strength Endurance',
    short: 'Total Body',
    minutes: [35, 40],
    focus: 'Every major muscle with higher reps and short rests.',
    warmup: WARMUP_FULL,
    circuits: [
      { name: 'Squat, row, hinge', moves: ['goblet-squat', 'single-row', 'rdl', 'lateral-raise'] },
      { name: 'Lunge and arms', moves: ['reverse-lunge', 'biceps-curl', 'kickback', 'step-jacks'] },
      { name: 'On the mat', moves: ['floor-press', 'glute-bridge', 'dead-bug'] },
    ],
    finishers: [
      { name: 'Finisher', moves: ['sumo-squat', 'hammer-curl'] },
      { name: 'Finisher', moves: ['staggered-rdl', 'reverse-fly'] },
    ],
    cooldown: COOLDOWN_FULL,
  },
  {
    id: 'cardio-strength',
    name: 'Cardio Strength Circuit',
    short: 'Cardio Strength',
    minutes: [30, 40],
    focus: 'Strength moves traded off with cardio. The most cardio-heavy day.',
    warmup: WARMUP_FULL,
    circuits: [
      { name: 'Round 1', moves: ['goblet-squat', 'skater-steps', 'bent-row', 'knee-drives'] },
      { name: 'Round 2', moves: ['reverse-lunge', 'boxer-shuffle', 'lateral-raise', 'step-jacks'] },
      { name: 'Round 3', moves: ['sumo-squat', 'side-shuffle', 'hammer-curl', 'fast-march'] },
    ],
    finishers: [
      { name: 'Finisher', moves: ['squat-hold', 'heel-digs'] },
      { name: 'Finisher', moves: ['curtsy-lunge', 'grapevine'] },
    ],
    cooldown: COOLDOWN_FULL,
    gymNote: GYM_CARDIO,
  },
];

export const ROTATION = WORKOUTS.map((w) => w.id);

export function workout(id: string): Workout {
  return WORKOUTS.find((w) => w.id === id) ?? WORKOUTS[0];
}
