/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { buildGymSteps, buildSteps, estimateMinutes, finisherFor, levelAdvice, MIN_WORKOUTS_PER_LEVEL, nextGymWorkoutId, nextWorkoutId, programWeek, suggestMove } from './engine';
import { DUMBBELLS, GYM_REPS, GYM_WORKOUTS, gymWorkout, move, MOVES, ROTATION, workout, WORKOUTS } from './program';
import { CheckIn, HerSession, HerSettings, MoveLog } from './types';

const DAY = 24 * 60 * 60 * 1000;
const start = new Date('2026-11-02T17:00:00Z');
const at = (d: number) => new Date(start.getTime() + d * DAY);

const settings: HerSettings = {
  name: 'Her',
  programStart: start.toISOString(),
  round: 1,
  level: 1,
  levelSince: start.toISOString(),
  nextOverride: null,
  gymDays: [0, 6],
};

const fine: CheckIn = { effort: 'right', form: 'solid', symptoms: 'none', recovery: 'fresh' };

function session(day: number, workoutId: string, logs: MoveLog[], checkIn: CheckIn = fine, extra: Partial<HerSession> = {}): HerSession {
  return {
    id: `s${day}`,
    workoutId,
    startedAt: at(day).toISOString(),
    finishedAt: new Date(at(day).getTime() + 40 * 60000).toISOString(),
    level: 1,
    week: 1,
    gym: false,
    completed: true,
    logs,
    checkIn,
    ...extra,
  };
}

const rounds = (moveId: string, weight: number | null, reps: number[], gym = false): MoveLog[] => reps.map((r) => ({ moveId, gym, weight, reps: r }));

test('every move in every workout exists, and dumbbell starts are ones she owns', () => {
  for (const w of WORKOUTS) {
    for (const id of [...w.warmup, ...w.cooldown, ...w.circuits.flatMap((c) => c.moves), ...w.finishers.flatMap((c) => c.moves)]) assert.notEqual(move(id).id, 'unknown', id);
  }
  for (const m of MOVES) {
    if (m.start != null) assert.ok(DUMBBELLS.includes(m.start), m.id);
    if (m.reps) assert.ok(m.reps[0] >= 10 && m.reps[1] <= 20, `${m.id} is high-rep`);
  }
});

test('mat moves are grouped so she gets down and up once per circuit', () => {
  for (const w of WORKOUTS) {
    for (const c of [...w.circuits, ...w.finishers]) {
      const floor = c.moves.map((id) => !!move(id).floor);
      assert.ok(floor.every((f) => f) || floor.every((f) => !f), `${w.id}: ${c.name} mixes mat and standing`);
    }
  }
});

test('workouts land near the lengths in her plan at every level', () => {
  for (const w of WORKOUTS) {
    for (const level of [1, 2, 3] as const) {
      const min = estimateMinutes(buildSteps(w, level, 1, false, []));
      assert.ok(min >= w.minutes[0] - 5 && min <= w.minutes[1] + 5, `${w.id} level ${level}: ${min} min`);
    }
  }
});

test('rotation goes 1 to 5 and wraps, with a one-time override', () => {
  assert.equal(nextWorkoutId([], settings), 'upper');
  assert.equal(nextWorkoutId([session(0, 'cardio-strength', [])], settings), 'upper');
  assert.equal(nextWorkoutId([session(0, 'upper', []), session(1, 'lower', [])], settings), 'cardio-core');
  assert.equal(nextWorkoutId([], { ...settings, nextOverride: 'total' }), 'total');
});

test('weeks count from the program start, and finishers alternate', () => {
  assert.equal(programWeek(settings, at(0)), 1);
  assert.equal(programWeek(settings, at(13)), 2);
  assert.equal(programWeek(settings, at(42)), 7);
  const w = workout('upper');
  assert.notDeepEqual(finisherFor(w, 1), finisherFor(w, 2));
});

test('first time: starting dumbbell at the bottom of the range', () => {
  const s = suggestMove(move('goblet-squat'), false, []);
  assert.equal(s.weight, 20);
  assert.equal(s.reps, 12);
});

test('top of the range every round moves up one dumbbell she owns', () => {
  const s = suggestMove(move('goblet-squat'), false, [session(0, 'lower', rounds('goblet-squat', 15, [15, 15]))]);
  assert.equal(s.weight, 20);
  assert.equal(s.reps, 12);
});

test('short of the top: same weight, one more rep', () => {
  const s = suggestMove(move('goblet-squat'), false, [session(0, 'lower', rounds('goblet-squat', 15, [13, 12]))]);
  assert.equal(s.weight, 15);
  assert.equal(s.reps, 13);
});

test('a hard workout does not move the weight up', () => {
  const s = suggestMove(move('goblet-squat'), false, [session(0, 'lower', rounds('goblet-squat', 15, [15, 15]), { ...fine, effort: 'hard' })]);
  assert.equal(s.weight, 15);
});

test('mild symptoms or sloppy form hold everything', () => {
  for (const c of [{ ...fine, symptoms: 'mild' as const }, { ...fine, form: 'sloppy' as const }]) {
    const s = suggestMove(move('goblet-squat'), false, [session(0, 'lower', rounds('goblet-squat', 15, [15, 15]), c)]);
    assert.equal(s.weight, 15);
  }
});

test('stopping for symptoms drops a dumbbell', () => {
  const s = suggestMove(move('goblet-squat'), false, [session(0, 'lower', rounds('goblet-squat', 15, [10, 8]), { ...fine, symptoms: 'stopped' })]);
  assert.equal(s.weight, 12);
});

test('at the 20 lb dumbbell, it slows the tempo instead', () => {
  const s = suggestMove(move('goblet-squat'), false, [session(0, 'lower', rounds('goblet-squat', 20, [15, 15]))]);
  assert.equal(s.weight, 20);
  assert.match(s.why, /heaviest/);
});

test('gym weights are tracked apart from her dumbbells', () => {
  const sessions = [session(0, 'lower', rounds('goblet-squat', 90, [15, 15], true), fine, { gym: true })];
  assert.equal(suggestMove(move('goblet-squat'), true, sessions).weight, 95);
  assert.equal(suggestMove(move('goblet-squat'), false, sessions).weight, 20);
});

test('gym day swaps in machine versions in the steps', () => {
  const steps = buildSteps(workout('lower'), 1, 1, true, []);
  const squat = steps.find((s) => s.kind === 'reps' && s.moveId === 'goblet-squat');
  assert.ok(squat && squat.kind === 'reps' && squat.weight == null);
});

test('level up is only suggested after enough good workouts, never on a schedule', () => {
  const good = (n: number) => Array.from({ length: n }, (_, i) => session(i, ROTATION[i % 5], []));
  assert.equal(levelAdvice(good(MIN_WORKOUTS_PER_LEVEL - 1), settings), null);
  assert.equal(levelAdvice(good(MIN_WORKOUTS_PER_LEVEL), settings)?.kind, 'up');
  // Same number of workouts, but some felt hard: no level up
  const mixed = good(MIN_WORKOUTS_PER_LEVEL).map((s, i) => (i >= 5 ? { ...s, checkIn: { ...fine, effort: 'hard' as const } } : s));
  assert.notEqual(levelAdvice(mixed, settings)?.kind, 'up');
});

test('stopping for symptoms suggests stepping back', () => {
  const s = [session(0, 'upper', [], { ...fine, symptoms: 'stopped' })];
  assert.equal(levelAdvice(s, { ...settings, level: 2 })?.kind, 'down');
  assert.equal(levelAdvice(s, settings)?.kind, 'hold');
});

test('every gym machine has start and finish photos', () => {
  const src = readFileSync(new URL('./gymPhotos.ts', import.meta.url), 'utf8');
  const ids = [...src.matchAll(/^\s+'?([\w-]+)'?: \[require/gm)].map((x) => x[1]);
  for (const m of MOVES.filter((x) => x.gym)) assert.ok(ids.includes(m.id), `${m.id} has no gym photos`);
  for (const id of ids) {
    assert.ok(MOVES.find((x) => x.id === id)?.gym, `${id} is not a gym move`);
    for (const i of [0, 1]) assert.ok(existsSync(new URL(`../../assets/gym/${id}-${i}.jpg`, import.meta.url)), `${id}-${i}.jpg missing`);
  }
});

test('gym days are straight sets of 12-15 on machines, with no cardio', () => {
  for (const g of GYM_WORKOUTS) {
    for (const id of [...g.warmup, ...g.cooldown]) assert.notEqual(move(id).kind, 'cardio', `${g.id}: ${id} is cardio`);
    for (const e of g.exercises) assert.ok(move(e.moveId).gym, `${g.id}: ${e.moveId} has no machine version`);
    const sets = buildGymSteps(g, []).filter((s) => s.kind === 'reps');
    assert.equal(sets.length, g.exercises.reduce((t, e) => t + e.sets, 0));
    // Every set on one machine before the next one
    const order = sets.map((s) => s.moveId).filter((id, i, all) => id !== all[i - 1]);
    assert.deepEqual(order, g.exercises.map((e) => e.moveId));
    for (const s of sets) {
      assert.deepEqual(s.kind === 'reps' && s.reps, GYM_REPS);
      assert.equal(s.kind === 'reps' && s.perSide, false);
    }
    const min = estimateMinutes(buildGymSteps(g, []));
    assert.ok(min >= g.minutes[0] - 5 && min <= g.minutes[1] + 5, `${g.id}: ${min} min`);
  }
});

test('gym days split upper and lower with no muscle group on both', () => {
  const upper = gymWorkout('gym-upper').exercises.map((e) => e.moveId);
  const lower = gymWorkout('gym-lower').exercises.map((e) => e.moveId);
  assert.equal(upper.filter((id) => lower.includes(id)).length, 0);
  for (const id of upper) assert.ok(!['goblet-squat', 'rdl', 'glute-bridge', 'sumo-squat', 'calf-raise', 'leg-extension'].includes(id));
});

test('gym and home workouts keep their own order', () => {
  assert.equal(nextGymWorkoutId([], settings), 'gym-upper');
  const weekend = [session(0, 'upper', []), session(1, 'lower', []), session(2, 'gym-upper', [], fine, { gym: true })];
  assert.equal(nextGymWorkoutId(weekend, settings), 'gym-lower');
  // The gym day doesn't skip anything at home
  assert.equal(nextWorkoutId(weekend, settings), 'cardio-core');
  assert.equal(nextGymWorkoutId([...weekend, session(3, 'gym-lower', [], fine, { gym: true })], settings), 'gym-upper');
});

test('gym weights go up 5 lb once every set hits 15', () => {
  const lat = move('single-row');
  const first = suggestMove(lat, true, [], GYM_REPS);
  assert.equal(first.weight, null);
  assert.equal(first.reps, 12);
  const done = [session(0, 'gym-upper', rounds('single-row', 50, [15, 15, 15], true), fine, { gym: true })];
  assert.deepEqual([suggestMove(lat, true, done, GYM_REPS).weight, suggestMove(lat, true, done, GYM_REPS).reps], [55, 12]);
  const close = [session(0, 'gym-upper', rounds('single-row', 50, [15, 13, 12], true), fine, { gym: true })];
  assert.deepEqual([suggestMove(lat, true, close, GYM_REPS).weight, suggestMove(lat, true, close, GYM_REPS).reps], [50, 13]);
});
