/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { alternativesFor, exercise, makeCustomExercise, setCustomExercises } from './exercises';
import { planNext, nextDayId, ROTATION } from './plan';
import { suggest } from './progression';
import { rollingVolume, weeklyTarget } from './volume';
import { Session, Settings } from './types';

const DAY = 24 * 60 * 60 * 1000;
const start = new Date('2026-11-01T17:00:00Z');
const at = (d: number) => new Date(start.getTime() + d * DAY);

const settings: Settings = {
  mode: 'cut',
  unit: 'lb',
  blockStart: start.toISOString(),
  deloadStart: null,
  lastDeloadEnd: null,
  swaps: {},
  customExercises: [],
  nextDayOverride: null,
};

// Logs a session exactly as planned, at a set weight and reps
function doSession(sessions: Session[], when: Date, reps = 10, pain = 0): Session[] {
  const plan = planNext(sessions, settings, when);
  const s: Session = {
    id: `s${sessions.length}`,
    dayId: plan.day.id,
    startedAt: new Date(when.getTime() - 3600_000).toISOString(),
    finishedAt: when.toISOString(),
    exercises: plan.exercises.map((e) => ({
      exerciseId: e.exerciseId,
      sets: Array.from({ length: e.sets }, () => ({ weight: 100, reps, rir: 2, done: true })),
      shoulderPain: pain,
    })),
  };
  return [...sessions, s];
}

function catchUp(sessions: Session[], when: Date) {
  return planNext(sessions, settings, when).exercises.reduce((t, e) => t + e.catchUpSets, 0);
}

test('rotation goes in order and wraps, with no calendar', () => {
  let sessions: Session[] = [];
  const seen: string[] = [];
  for (let i = 0; i < 7; i++) {
    seen.push(nextDayId(sessions, settings));
    sessions = doSession(sessions, at(i));
  }
  assert.deepEqual(seen, [...ROTATION, ROTATION[0]]);
});

test('targets ramp across the block and cut is lower than build', () => {
  assert.equal(weeklyTarget('chest', 'cut', 0, false), 8);
  assert.equal(weeklyTarget('chest', 'cut', 4, false), 12);
  assert.equal(weeklyTarget('chest', 'cut', 9, false), 12);
  assert.ok(weeklyTarget('back', 'build', 2, false) > weeklyTarget('back', 'cut', 2, false));
  assert.equal(weeklyTarget('chest', 'cut', 3, true), 4);
});

test('half credit for secondary muscles', () => {
  const s: Session = {
    id: 'x',
    dayId: 'push-a',
    startedAt: at(0).toISOString(),
    finishedAt: at(0).toISOString(),
    exercises: [{ exerciseId: 'pl-flat-press', sets: [1, 2, 3].map(() => ({ weight: 100, reps: 8, rir: 2, done: true })) }],
  };
  const v = rollingVolume([s], at(1));
  assert.equal(v.chest, 3);
  assert.equal(v.triceps, 1.5);
  assert.equal(rollingVolume([s], at(8)).chest, undefined);
});

test('training 5-6 days a week needs no catch-up', () => {
  let sessions: Session[] = [];
  // Two weeks, resting every 6th day
  let d = 0;
  for (let i = 0; i < 12; i++) {
    if (i % 5 === 0 && i > 0) d++;
    if (d >= 8) assert.equal(catchUp(sessions, at(d)), 0, `day ${d}`);
    sessions = doSession(sessions, at(d));
    d++;
  }
});

test('sick days: first session back is normal, then catch-up, capped per muscle', () => {
  let sessions: Session[] = [];
  for (let d = 0; d < 10; d++) sessions = doSession(sessions, at(d));
  // Sick days 10-14
  const back = planNext(sessions, settings, at(15));
  assert.ok(back.comeback);
  assert.equal(back.exercises.reduce((t, e) => t + e.catchUpSets, 0), 0);
  sessions = doSession(sessions, at(15));
  sessions = doSession(sessions, at(16));
  const next = planNext(sessions, settings, at(17));
  assert.ok(!next.comeback);
  const caught = next.exercises.reduce((t, e) => t + e.catchUpSets, 0);
  assert.ok(caught > 0, 'expected catch-up sets');
  // Never more than 3 catch-up sets for one muscle
  const byMuscle = new Map<string, number>();
  for (const e of next.exercises) {
    const m = exercise(e.exerciseId).primary;
    byMuscle.set(m, (byMuscle.get(m) ?? 0) + e.catchUpSets);
  }
  for (const n of byMuscle.values()) assert.ok(n <= 3);
});

test('first week has no catch-up', () => {
  let sessions: Session[] = [];
  for (let d = 0; d < 3; d++) sessions = doSession(sessions, at(d * 2));
  assert.equal(catchUp(sessions, at(6)), 0);
});

test('double progression adds weight only after the top of the range', () => {
  let sessions = doSession([], at(0), 10); // pl-incline-press range 6-10
  let s = suggest('pl-incline-press', sessions, { comeback: false, deload: false });
  assert.equal(s.weight, 110);
  assert.equal(s.targetReps, 6);
  sessions = doSession([], at(0), 8);
  s = suggest('pl-incline-press', sessions, { comeback: false, deload: false });
  assert.equal(s.weight, 100);
  assert.equal(s.targetReps, 9);
});

test('shoulder pain holds or lowers pressing weight', () => {
  const hurt = doSession([], at(0), 10, 6);
  const s = suggest('pl-incline-press', hurt, { comeback: false, deload: false });
  assert.equal(s.weight, 90);
  assert.ok(s.swapSuggested);
  const mild = doSession([], at(0), 10, 3);
  assert.equal(suggest('pl-incline-press', mild, { comeback: false, deload: false }).weight, 100);
});

test('assisted pull-up progresses by using less assistance', () => {
  const sessions = doSession(doSession([], at(0)), at(1)); // push-a, pull-a
  const pull = sessions[1];
  pull.exercises[0].sets.forEach((x) => (x.reps = 12));
  const s = suggest('assisted-pullup', sessions, { comeback: false, deload: false });
  assert.equal(s.weight, 90);
  assert.equal(suggest('assisted-pullup', sessions, { comeback: true, deload: false }).weight, 110);
});

test('deload roughly halves the sets', () => {
  let sessions: Session[] = [];
  for (let d = 0; d < 8; d++) sessions = doSession(sessions, at(d));
  const normal = planNext(sessions, settings, at(8));
  const deload = planNext(sessions, { ...settings, deloadStart: at(8).toISOString() }, at(8));
  const sum = (p: typeof normal) => p.exercises.reduce((t, e) => t + e.sets, 0);
  assert.ok(sum(deload) < sum(normal) * 0.75, `${sum(deload)} vs ${sum(normal)}`);
});

test('a replacement applies on every day and keeps the muscle', () => {
  const swapped = { ...settings, swaps: { 'pl-incline-press': 'db-incline-press' } };
  for (const id of ['push-a', 'push-b']) {
    const plan = planNext([], { ...swapped, nextDayOverride: id }, at(0));
    const ids = plan.exercises.map((e) => e.exerciseId);
    assert.ok(ids.includes('db-incline-press'));
    assert.ok(!ids.includes('pl-incline-press'));
  }
});

test('your own exercise can replace one and counts toward volume', () => {
  const mine = makeCustomExercise({ name: 'Iso-lateral row', primary: 'back', repMin: 8, repMax: 12, kind: 'compound', increment: 10 });
  setCustomExercises([mine]);
  const s2 = { ...settings, customExercises: [mine], swaps: { 'cable-row': mine.id }, nextDayOverride: 'pull-a' };
  const plan = planNext([], s2, at(0));
  const row = plan.exercises.find((e) => e.exerciseId === mine.id);
  assert.ok(row);
  assert.ok(alternativesFor('lat-pulldown').some((e) => e.id === mine.id));
  const session: Session = {
    id: 'c',
    dayId: 'pull-a',
    startedAt: at(0).toISOString(),
    finishedAt: at(0).toISOString(),
    exercises: [{ exerciseId: mine.id, sets: [1, 2].map(() => ({ weight: 100, reps: 10, rir: 2, done: true })) }],
  };
  assert.equal(rollingVolume([session], at(1)).back, 2);
  setCustomExercises([]);
});
