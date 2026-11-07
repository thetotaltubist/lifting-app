import { blockWeek } from './plan';
import { Muscle, Session, Settings } from './types';
import { addCredit, creditFor, DAY_MS, hardSets, TARGETS, weeklyTarget } from './volume';

// ------------------------------------------------------------------
// Weekly recap: how each finished week went against its targets.
//
// The live numbers (Volume tab, the ring after a workout) use a rolling
// 7 days. A recap needs fixed weeks instead, so each week here runs 7 days
// from the day the block started. That keeps every week lined up with one
// block week and one set of targets. The week still in progress is left
// out; the live numbers already cover it.
// ------------------------------------------------------------------

export type RecapRow = { muscle: Muscle; have: number; target: number };

export type WeekRecap = {
  start: Date; // inclusive
  end: Date; // exclusive
  workouts: number;
  deload: boolean;
  hit: number; // muscles that reached their target
  total: number; // muscles with a target
  rows: RecapRow[];
};

export function weeklyRecap(sessions: Session[], settings: Settings, now: Date, maxWeeks = 8): WeekRecap[] {
  if (!sessions.length) return [];
  const anchor = new Date(settings.blockStart).getTime();
  const week = 7 * DAY_MS;
  // Start of the week we're in now. Weeks before the block began line up the same way.
  const currentStart = anchor + Math.floor((now.getTime() - anchor) / week) * week;
  const first = Math.min(...sessions.map((s) => new Date(s.finishedAt).getTime()));
  const muscles = Object.keys(TARGETS[settings.mode]) as Muscle[];

  const out: WeekRecap[] = [];
  for (let i = 1; i <= maxWeeks; i++) {
    const start = currentStart - i * week;
    const end = start + week;
    if (end <= first) break; // nothing logged this far back
    const inWeek = sessions.filter((s) => {
      const t = new Date(s.finishedAt).getTime();
      return t >= start && t < end;
    });
    const done: Partial<Record<Muscle, number>> = {};
    for (const s of inWeek) for (const ex of s.exercises) addCredit(done, creditFor(ex.exerciseId, hardSets(ex)));
    const deload = inWeek.some((s) => s.deload);
    const bw = blockWeek(settings, new Date(start));
    const rows = muscles.map((m) => ({ muscle: m, have: done[m] ?? 0, target: weeklyTarget(m, settings.mode, bw, deload) }));
    const total = rows.filter((r) => r.target > 0).length;
    const hit = rows.filter((r) => r.target > 0 && r.have >= r.target).length;
    out.push({ start: new Date(start), end: new Date(end), workouts: inWeek.length, deload, hit, total, rows });
  }
  return out;
}
