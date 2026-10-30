import { Move, Workout } from './types';

// ------------------------------------------------------------------
// Her program. Built around her Chiari history and decompression
// surgery, so every move follows the same rules:
// - Neck stays long and neutral. Eyes follow the floor a few feet ahead
//   when hinged, never cranked up.
// - Nothing heavy overhead (overhead pressing is capped at 8 lb).
// - No jumping, no burpees, no fast floor-to-standing moves. Mat work is
//   grouped into its own circuit so she gets down and up once, slowly.
// - Breathe out on the effort. Never hold your breath or bear down.
// Each move lists an easier version for neck discomfort or dizziness.
// ------------------------------------------------------------------

export const DUMBBELLS = [5, 8, 10, 12, 15, 20];

const M: Move[] = [
  // ---------- Warm-up (timed) ----------
  { id: 'wu-march', name: 'March with arm swings', kind: 'cardio', cue: 'Easy pace. Swing the arms low, below shoulder height.', easier: 'March slower, hands on hips.' },
  { id: 'wu-shoulder-rolls', name: 'Shoulder rolls', kind: 'stretch', cue: 'Slow circles back, then forward. Head stays still.', easier: 'Smaller circles.' },
  { id: 'wu-step-touch', name: 'Step touch', kind: 'cardio', cue: 'Step side to side. Add a gentle arm reach forward.', easier: 'Smaller steps, no arms.' },
  { id: 'wu-hip-circles', name: 'Hip circles', kind: 'stretch', cue: 'Hands on hips, big slow circles each way.', easier: 'Hold a chair back for balance.' },
  { id: 'wu-arm-circles', name: 'Small arm circles', kind: 'stretch', cue: 'Arms out to the sides, small circles. Keep the shoulders down.', easier: 'Bend the elbows and circle the shoulders instead.' },
  { id: 'wu-chair-squat', name: 'Squat to a chair', kind: 'cardio', cue: 'Sit back until you touch the chair, then stand. No weight.', easier: 'Sit all the way down each rep.' },
  { id: 'wu-good-morning', name: 'Hip hinge (no weight)', kind: 'stretch', cue: 'Hands on hips, push the hips back, flat back, eyes to the floor ahead.', easier: 'Hinge only halfway.' },

  // ---------- Low-impact cardio (timed, no jumping) ----------
  { id: 'step-jacks', name: 'Step jacks', kind: 'cardio', cue: 'Step one foot out as the arms sweep out to shoulder height. No jumping.', easier: 'Keep the arms at your sides.' },
  { id: 'boxer-shuffle', name: 'Boxer shuffle with punches', kind: 'cardio', cue: 'Light bounce on the balls of the feet, quick punches at chest height. No weights.', easier: 'Step in place instead of shuffling. Slower punches.' },
  { id: 'knee-drives', name: 'Standing knee drives', kind: 'cardio', cue: 'Drive one knee up as you pull the arms down. Alternate sides. Stand tall.', easier: 'Lift the knee to hip height only, slower pace.' },
  { id: 'skater-steps', name: 'Skater steps', kind: 'cardio', cue: 'Step wide to the side and sweep the back leg behind. No hop.', easier: 'Step touch side to side.' },
  { id: 'side-shuffle', name: 'Side shuffle', kind: 'cardio', cue: 'Three quick steps one way, three back. Stay low, chest up.', easier: 'Walk the steps instead of shuffling.' },
  { id: 'fast-march', name: 'Fast march', kind: 'cardio', cue: 'March quickly and pump the arms. Land softly.', easier: 'Normal march.' },
  { id: 'heel-digs', name: 'Heel digs with chest press', kind: 'cardio', cue: 'Tap one heel forward as you push both hands out from the chest. Alternate quickly.', easier: 'Drop the arms.' },
  { id: 'grapevine', name: 'Grapevine', kind: 'cardio', cue: 'Step side, cross behind, step side, tap. Then back. Eyes forward.', easier: 'Step touch twice each way.' },
  { id: 'squat-hold', name: 'Squat hold', kind: 'cardio', cue: 'Sit back like there is a chair behind you and hold. Breathe the whole time.', easier: 'Hold a higher squat, or squat to a chair.' },

  // ---------- Upper body ----------
  { id: 'bent-row', name: 'Bent-over row', kind: 'strength', reps: [12, 15], start: 12, cue: 'Hinge to about 45°, flat back, eyes on the floor a few feet ahead. Pull elbows back to the ribs.', easier: 'Single-arm row with your other hand on a chair, so the neck and back are supported.', gym: { name: 'Seated cable row', cue: 'Sit tall, pull the handle to your belly button. Chin stays level.' } },
  { id: 'single-row', name: 'Supported single-arm row', kind: 'strength', reps: [12, 15], perSide: true, start: 12, cue: 'One hand and knee on a chair or bench. Pull the dumbbell to the hip.', easier: 'Lighter dumbbell, smaller range.', gym: { name: 'Lat pulldown', cue: 'Wide grip, pull to the top of the chest. Never behind the neck. Look straight ahead.' } },
  { id: 'lateral-raise', name: 'Lateral raise', kind: 'strength', reps: [12, 15], start: 5, maxWeight: 10, cue: 'Raise out to the sides to shoulder height, no higher. Slight bend in the elbows.', easier: 'Bend the elbows to 90° (shorter lever), or raise one arm at a time.', gym: { name: 'Cable lateral raise', cue: 'One arm at a time, to shoulder height. Light stack.' } },
  { id: 'front-raise', name: 'Front raise', kind: 'strength', reps: [12, 15], start: 5, maxWeight: 10, cue: 'Raise in front to shoulder height, palms facing in. Stop at eye level.', easier: 'Alternate arms.' },
  { id: 'shoulder-press', name: 'Seated shoulder press (neutral grip)', kind: 'strength', reps: [12, 15], start: 5, maxWeight: 8, cue: 'Sit tall with back support. Palms facing in, press up without locking out. Light only.', easier: 'Swap for a front raise to shoulder height.', gym: { name: 'Machine shoulder press', cue: 'Lightest few plates only. Back against the pad, head neutral. Stop short of lockout.' } },
  { id: 'reverse-fly', name: 'Reverse fly', kind: 'strength', reps: [15, 20], start: 5, cue: 'Hinge forward, flat back, eyes on the floor ahead. Open the arms out wide, squeeze the shoulder blades.', easier: 'Sit and lean on your thighs, or stand tall and squeeze the shoulder blades with no weight.', gym: { name: 'Reverse pec deck', cue: 'Chest against the pad, open the arms wide.' } },
  { id: 'w-raise', name: 'Standing W raise', kind: 'strength', reps: [12, 15], cue: 'Elbows bent, arms in a W at shoulder height. Squeeze the shoulder blades back and down. No weight.', easier: 'Arms lower, smaller squeeze.' },
  { id: 'biceps-curl', name: 'Biceps curl', kind: 'strength', reps: [12, 15], start: 10, cue: 'Elbows pinned at your sides. Lower slowly.', easier: 'One arm at a time.', gym: { name: 'Cable curl', cue: 'Elbows at your sides, slow on the way down.' } },
  { id: 'hammer-curl', name: 'Hammer curl', kind: 'strength', reps: [12, 15], start: 10, cue: 'Palms facing in. Elbows stay still.', easier: 'Alternate arms.', gym: { name: 'Rope hammer curl', cue: 'Rope on a low cable. Elbows at your sides.' } },
  { id: 'zottman-curl', name: 'Zottman curl', kind: 'strength', reps: [12, 15], start: 8, cue: 'Curl up palms up, turn palms down at the top, lower slowly.', easier: 'Plain biceps curl.' },
  { id: 'kickback', name: 'Triceps kickback', kind: 'strength', reps: [12, 15], start: 8, cue: 'Hinge forward, upper arms by your sides, straighten the arms back. Eyes on the floor ahead.', easier: 'One arm at a time with a hand on a chair.', gym: { name: 'Triceps pushdown', cue: 'Elbows at your sides, push the bar or rope down. Stand tall.' } },

  // ---------- Chest (on the mat) ----------
  { id: 'floor-press', name: 'Floor chest press', kind: 'strength', reps: [12, 15], start: 12, floor: true, cue: 'Lie on your back, knees bent, head resting on the mat. Press up, lower until the elbows touch the floor.', easier: 'Put a folded towel under your head for neck support. Lighter dumbbells.', gym: { name: 'Chest press machine', cue: 'Moderate weight, head against the pad. Breathe out as you push.' } },
  { id: 'floor-fly', name: 'Floor fly', kind: 'strength', reps: [12, 15], start: 8, floor: true, cue: 'Arms open wide with a soft elbow until the upper arms touch the mat, then hug back up.', easier: 'Bend the elbows more.', gym: { name: 'Pec deck', cue: 'Light, slow squeeze. Head against the pad.' } },
  { id: 'close-press', name: 'Close-grip floor press', kind: 'strength', reps: [12, 15], start: 10, floor: true, cue: 'Dumbbells touching, elbows tucked in. Works the triceps.', easier: 'One dumbbell held with both hands.', gym: { name: 'Triceps pushdown', cue: 'Elbows at your sides. Stand tall.' } },

  // ---------- Lower body ----------
  { id: 'goblet-squat', name: 'Goblet squat', kind: 'strength', reps: [12, 15], start: 15, cue: 'Hold one dumbbell at your chest. Sit back and down, chest up, eyes forward.', easier: 'Squat to a chair.', gym: { name: 'Leg press', cue: 'Moderate weight. Head back against the pad. Breathe out as you push, never hold your breath.' } },
  { id: 'sumo-squat', name: 'Sumo squat', kind: 'strength', reps: [15, 20], start: 15, cue: 'Wide stance, toes out, hold one dumbbell between your legs. Sit straight down.', easier: 'Smaller range or no weight.', gym: { name: 'Hip abduction machine', cue: 'Sit tall, push the knees out, slow on the way back.' } },
  { id: 'rdl', name: 'Romanian deadlift', kind: 'strength', reps: [12, 15], start: 15, cue: 'Soft knees, push the hips back with a flat back. Dumbbells slide down the thighs. Eyes on the floor ahead, neck long.', easier: 'Hinge only to the knees, lighter weight.', gym: { name: 'Seated leg curl', cue: 'Curl down, slow on the way back. Sit back against the pad.' } },
  { id: 'staggered-rdl', name: 'Staggered Romanian deadlift', kind: 'strength', reps: [10, 12], perSide: true, start: 12, cue: 'One foot back on its toes like a kickstand. Hinge over the front leg.', easier: 'Regular Romanian deadlift.' },
  { id: 'reverse-lunge', name: 'Reverse lunge', kind: 'strength', reps: [10, 12], perSide: true, start: 10, cue: 'Step back, lower the back knee toward the floor, push through the front heel. Torso tall.', easier: 'Split squat holding a chair, feet staying put.', gym: { name: 'Smith machine split squat', cue: 'Light bar, feet staggered, straight down and up. Or keep the dumbbell version.' } },
  { id: 'curtsy-lunge', name: 'Curtsy lunge', kind: 'strength', reps: [10, 12], perSide: true, start: 8, cue: 'Step one leg behind and across. Hips stay square.', easier: 'Reverse lunge, or no weight.' },
  { id: 'calf-raise', name: 'Calf raise', kind: 'strength', reps: [15, 20], start: 20, cue: 'Up onto the toes, pause, lower slowly. Fingertips on a wall for balance.', easier: 'No weight.', gym: { name: 'Calf raise machine', cue: 'Full stretch at the bottom, pause at the top.' } },
  { id: 'standing-kickback', name: 'Standing glute kickback', kind: 'strength', reps: [15, 20], perSide: true, cue: 'Hold a chair, squeeze the glute and press one leg back. No arching the back.', easier: 'Smaller range.', gym: { name: 'Cable or machine glute kickback', cue: 'Light, slow, squeeze at the top.' } },

  // ---------- Glutes and core on the mat ----------
  { id: 'glute-bridge', name: 'Glute bridge', kind: 'strength', reps: [15, 20], start: 15, floor: true, cue: 'Dumbbell across the hips. Drive through the heels, squeeze at the top. Head stays down.', easier: 'No weight.', gym: { name: 'Hip thrust machine', cue: 'Moderate weight, chin slightly tucked, squeeze at the top. Breathe out on the way up.' } },
  { id: 'single-bridge', name: 'Single-leg glute bridge', kind: 'strength', reps: [10, 12], perSide: true, floor: true, cue: 'One foot down, the other knee hugged in or leg extended. Lift and squeeze.', easier: 'Both feet down.' },
  { id: 'side-leg-lift', name: 'Side-lying leg lift', kind: 'strength', reps: [15, 20], perSide: true, floor: true, cue: 'Head resting on your bottom arm. Lift the top leg slightly behind you.', easier: 'Bend the knees (clamshell).' },
  { id: 'clamshell', name: 'Clamshell', kind: 'strength', reps: [15, 20], perSide: true, floor: true, cue: 'On your side, knees bent, head on your arm. Open the top knee, feet together.', easier: 'Smaller range.' },
  { id: 'dead-bug', name: 'Dead bug', kind: 'core', reps: [10, 12], perSide: true, floor: true, cue: 'Head stays on the mat. Low back pressed down. Lower opposite arm and leg slowly.', easier: 'Move only the legs, toe taps.' },
  { id: 'bird-dog', name: 'Bird dog', kind: 'core', reps: [10, 12], perSide: true, floor: true, cue: 'On hands and knees, reach opposite arm and leg long. Eyes on the mat, neck in line with your back.', easier: 'Reach only the leg.' },
  { id: 'plank', name: 'Forearm plank', kind: 'core', floor: true, cue: 'Elbows under shoulders, straight line from head to heels. Eyes on the mat between your hands. Keep breathing.', easier: 'Drop to your knees.' },
  { id: 'side-plank', name: 'Side plank on knees', kind: 'core', perSide: true, floor: true, cue: 'Elbow under shoulder, knees bent, lift the hips. Head in line with the spine.', easier: 'Hips down, just press the forearm into the floor.' },
  { id: 'bridge-march', name: 'Bridge march', kind: 'core', floor: true, cue: 'Hold a bridge and slowly lift one foot at a time. Hips stay level.', easier: 'Hold the bridge without marching.' },

  // ---------- Standing core ----------
  { id: 'oblique-crunch', name: 'Standing oblique crunch', kind: 'core', reps: [12, 15], perSide: true, cue: 'Hands lightly by your ears, bring knee and elbow together at the side. Don\'t pull on your head.', easier: 'Hands on hips, just lift the knee to the side.' },
  { id: 'suitcase-march', name: 'Suitcase march', kind: 'core', start: 15, cue: 'One dumbbell in one hand, march slowly without leaning. Switch hands halfway.', easier: 'Lighter dumbbell, or none.' },
  { id: 'side-bend', name: 'Standing side bend', kind: 'core', reps: [12, 15], perSide: true, start: 10, cue: 'Dumbbell in one hand, slide it down the leg and come back up. Head stays in line.', easier: 'No weight.' },
  { id: 'cross-knee', name: 'Cross-body knee drive', kind: 'core', reps: [12, 15], perSide: true, cue: 'Lift one knee toward the opposite elbow. Slow and controlled.', easier: 'Lift the knee straight up.' },

  // ---------- Cooldown (timed) ----------
  { id: 'cd-walk', name: 'Slow march, deep breaths', kind: 'stretch', cue: 'Bring the heart rate down. Breathe in through the nose, out through the mouth.', easier: 'Stand and breathe.' },
  { id: 'cd-chest', name: 'Standing chest opener', kind: 'stretch', cue: 'Clasp hands behind you, open the chest. Chin stays level.', easier: 'Hands on your low back, elbows back.' },
  { id: 'cd-cross-arm', name: 'Cross-body shoulder stretch', kind: 'stretch', perSide: true, cue: 'Pull one arm across your chest. Relax the shoulders.', easier: 'Lighter pull.' },
  { id: 'cd-triceps', name: 'Triceps stretch (low)', kind: 'stretch', perSide: true, cue: 'Hand behind your back reaching up between the shoulder blades. Head stays neutral.', easier: 'Hand on the opposite shoulder instead.' },
  { id: 'cd-quad', name: 'Standing quad stretch', kind: 'stretch', perSide: true, cue: 'Hold a wall or chair, pull one heel toward your seat.', easier: 'Rest the foot on a chair behind you.' },
  { id: 'cd-hamstring', name: 'Standing hamstring stretch', kind: 'stretch', perSide: true, cue: 'One heel forward, toes up, hinge with a flat back.', easier: 'Smaller hinge.' },
  { id: 'cd-figure4', name: 'Seated figure-4 stretch', kind: 'stretch', perSide: true, cue: 'Sit on a chair, ankle over the other knee, lean forward with a flat back.', easier: 'Sit tall without leaning.' },
  { id: 'cd-child', name: "Child's pose", kind: 'stretch', floor: true, cue: 'Knees wide, forehead resting on your stacked hands or a pillow so the neck stays relaxed.', easier: 'Sit back on a chair and rest forward on your knees.' },
  { id: 'cd-breathe', name: 'Belly breathing', kind: 'stretch', floor: true, cue: 'Lie down, knees bent, one hand on your belly. Slow breaths in and out.', easier: 'Do it sitting.' },
];

export const MOVES = M;
const byId = new Map(M.map((m) => [m.id, m]));

export function move(id: string): Move {
  const m = byId.get(id);
  if (!m) throw new Error(`Unknown move ${id}`);
  return m;
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
      { name: 'Chest on the mat', moves: ['floor-press', 'floor-fly', 'close-press'], note: 'Lie down and get up slowly. Roll to your side first.' },
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
    focus: 'Quads, hamstrings, glutes and calves, with a little low-impact cardio.',
    warmup: WARMUP_LOWER,
    circuits: [
      { name: 'Squat and hinge', moves: ['goblet-squat', 'rdl', 'skater-steps'] },
      { name: 'Lunges and calves', moves: ['reverse-lunge', 'sumo-squat', 'calf-raise', 'side-shuffle'] },
      { name: 'Glutes on the mat', moves: ['glute-bridge', 'single-bridge', 'clamshell'], note: 'Lie down and get up slowly. Roll to your side first.' },
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
    focus: 'Low-impact cardio intervals and core stability. A lighter day for the muscles.',
    light: true,
    warmup: WARMUP_FULL,
    circuits: [
      { name: 'Cardio intervals', moves: ['fast-march', 'step-jacks', 'knee-drives', 'skater-steps'] },
      { name: 'Standing core', moves: ['oblique-crunch', 'suitcase-march', 'side-bend'], rounds: 1 },
      { name: 'Core on the mat', moves: ['dead-bug', 'bird-dog', 'plank', 'side-plank'], note: 'Lie down and get up slowly. Roll to your side first.', rounds: 1 },
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
      { name: 'On the mat', moves: ['floor-press', 'glute-bridge', 'dead-bug'], note: 'Lie down and get up slowly. Roll to your side first.' },
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
    focus: 'Strength moves traded off with low-impact cardio. The most cardio-heavy day, with no jumping.',
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
