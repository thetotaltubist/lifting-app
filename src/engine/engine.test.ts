/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { alternativesFor, exercise, makeCustomExercise, painAreasFor, setCustomExercises } from './exercises';
import { planNext, nextDayId, ROTATION } from './plan';
import { suggest } from './progression';
import { rollingVolume, weeklyTarget } from './volume';
import { formatClock, restSeconds } from './rest';
import { HealthData, proteinTarget, shortNightStreak, weightTrend } from './health';
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
      pain,
      painArea: pain ? 'Shoulder' : null,
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
  assert.equal(weeklyTarget('chest', 'cut', 0, false), 10);
  assert.equal(weeklyTarget('chest', 'cut', 4, false), 14);
  assert.equal(weeklyTarget('chest', 'cut', 9, false), 14);
  assert.ok(weeklyTarget('back', 'build', 2, false) > weeklyTarget('back', 'cut', 2, false));
  assert.equal(weeklyTarget('chest', 'cut', 3, true), 5);
});

test('arm targets start at 10 in a cut', () => {
  assert.equal(weeklyTarget('triceps', 'cut', 0, false), 10);
  assert.equal(weeklyTarget('biceps', 'build', 4, false), 18);
});

test('every muscle gets at least 3 direct sets, even with helper credit', () => {
  for (const id of ['push-a', 'pull-a', 'push-b', 'pull-b']) {
    const plan = planNext([], { ...settings, nextDayOverride: id }, at(0));
    const direct = new Map<string, number>();
    for (const e of plan.exercises) {
      const m = exercise(e.exerciseId).primary;
      direct.set(m, (direct.get(m) ?? 0) + e.sets);
    }
    for (const [m, n] of direct) if (m !== 'frontDelts') assert.ok(n >= 3, `${id} ${m} ${n}`); // no target of its own
  }
});

test('6 days a week reaches every weekly target by the end of the ramp', () => {
  let sessions: Session[] = [];
  const short: string[] = [];
  const counts: Record<string, number[]> = {};
  for (let d = 0; d < 42; d++) {
    if (d >= 35) {
      const v = rollingVolume(sessions, at(d));
      for (const m of ['chest', 'back', 'sideDelts', 'triceps', 'biceps', 'quads', 'hamstrings', 'calves'] as const)
        (counts[m] ??= []).push(v[m] ?? 0);
    }
    if (d % 7 !== 6) sessions = doSession(sessions, at(d));
  }
  for (const [m, vs] of Object.entries(counts)) {
    const avg = vs.reduce((a, b) => a + b, 0) / vs.length;
    if (avg < weeklyTarget(m as never, 'cut', 5, false) - 1) short.push(`${m} ${avg.toFixed(1)}`);
  }
  assert.deepEqual(short, []);
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

test('pain holds or lowers the weight', () => {
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

const iso = (d: Date) => d.toISOString();
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

test('weight trend flags losing faster than 1% a week', () => {
  const now = at(14);
  const weights = [
    ...[1, 3, 5, 6].map((d) => ({ date: iso(at(14 - d)), lb: 218 })),
    ...[8, 10, 12].map((d) => ({ date: iso(at(14 - d)), lb: 221 })),
  ];
  const t = weightTrend(weights, now)!;
  assert.ok(t.pctPerWeek! < -1);
  assert.ok(t.fastLoss);
  const slow = weights.map((w) => ({ ...w, lb: w.lb === 221 ? 219 : w.lb }));
  assert.ok(!weightTrend(slow, now)!.fastLoss);
  // Too few weigh-ins: no trend yet, so nothing is flagged
  assert.equal(weightTrend(weights.slice(0, 2), now)!.pctPerWeek, null);
});

test('three short nights in a row, and missing nights do not count', () => {
  const now = at(10);
  const nights = (hours: (number | null)[]) =>
    hours.flatMap((h, i) => (h == null ? [] : [{ night: ymd(new Date(now.getTime() - i * DAY)), hours: h }]));
  assert.equal(shortNightStreak(nights([5, 5.5, 4, 8]), now), 3);
  assert.equal(shortNightStreak(nights([null, 5, 5, 5]), now), 3); // this morning not synced yet
  assert.equal(shortNightStreak(nights([5, null, 5, 5]), now), 1);
  assert.equal(shortNightStreak(nights([7, 5, 5, 5]), now), 0);
});

test('fast weight loss or short sleep pauses catch-up, never normal sets', () => {
  let sessions: Session[] = [];
  for (let d = 0; d < 10; d++) sessions = doSession(sessions, at(d));
  sessions = doSession(sessions, at(15));
  sessions = doSession(sessions, at(16));
  const now = at(17);
  const normal = planNext(sessions, settings, now);
  assert.ok(normal.exercises.some((e) => e.catchUpSets > 0));
  const tired: HealthData = {
    fetchedAt: iso(now),
    weights: [],
    sleep: [0, 1, 2].map((i) => ({ night: ymd(new Date(now.getTime() - i * DAY)), hours: 5 })),
    hrv: [],
    restingHR: [],
  };
  const paused = planNext(sessions, settings, now, tired);
  assert.equal(paused.exercises.reduce((t, e) => t + e.catchUpSets, 0), 0);
  assert.ok(paused.notes.some((n) => n.includes('short nights')));
  // The workout itself is still there
  assert.ok(paused.exercises.every((e) => e.sets >= 2));
});

test('protein target is 1.6-2.2 g per kg', () => {
  assert.deepEqual(proteinTarget(220), { low: 160, high: 220 });
});

test('your own rotation order, and starting on any day', () => {
  const mine = { ...settings, rotation: ['legs-a', 'pull-a', 'push-a', 'legs-b', 'pull-b', 'push-b'] };
  assert.equal(nextDayId([], mine), 'legs-a');
  let sessions = doSession([], at(0));
  assert.equal(sessions[0].dayId, 'push-a'); // default settings started on Push A
  assert.equal(nextDayId(sessions, mine), 'legs-b'); // carries on after Push A in your order
  // Start somewhere else: the rotation carries on from what you did
  sessions = [{ ...sessions[0], dayId: 'pull-b' }];
  assert.equal(nextDayId(sessions, settings), 'legs-b');
  // A broken order falls back to the default
  assert.equal(nextDayId([], { ...settings, rotation: ['legs-a'] }), 'push-a');
});

test('rest suggestions: longer for heavy compounds, shorter for isolation', () => {
  assert.equal(restSeconds(exercise('hack-squat'), 2, false), 180);
  assert.equal(restSeconds(exercise('lat-pulldown'), 2, false), 150);
  assert.equal(restSeconds(exercise('db-lateral-raise'), 1, false), 90);
  assert.equal(restSeconds(exercise('db-lateral-raise'), 0, false), 120);
  assert.equal(restSeconds(exercise('db-lateral-raise'), 2, true), 60);
  assert.equal(formatClock(150), '2:30');
  assert.equal(formatClock(0.2), '0:01');
});

test('pain offers body parts for the day, and old shoulder logs still count', () => {
  assert.deepEqual(painAreasFor('push-a'), ['Shoulder', 'Elbow']);
  assert.deepEqual(painAreasFor('pull-b'), ['Back', 'Elbow']);
  assert.deepEqual(painAreasFor('legs-a'), ['Glute', 'Knee', 'Calf']);
  const old = doSession([], at(0), 10, 0);
  old[0].exercises[0] = { ...old[0].exercises[0], pain: undefined, shoulderPain: 6 };
  assert.equal(suggest('pl-incline-press', old, { comeback: false, deload: false }).weight, 90);
});
