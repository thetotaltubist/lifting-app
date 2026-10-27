import { Exercise } from './types';

// ------------------------------------------------------------------
// Suggested rest between sets. Longer rest (2 minutes or more) lets you
// keep reps up on the next set, which builds more muscle than short rest
// on big lifts. Beyond about 90 seconds, extra rest helps isolation work
// little. See science.ts.
// ------------------------------------------------------------------

export function restSeconds(e: Exercise, rir: number | null, deload: boolean) {
  let seconds = e.kind === 'isolation' ? 90 : e.repMin <= 6 ? 180 : 150;
  if (rir === 0) seconds += 30; // a set to failure needs a bit longer
  if (deload) seconds -= 30; // lighter sets recover faster
  return Math.max(60, seconds);
}

export function restReason(e: Exercise, rir: number | null, deload: boolean) {
  const base = e.kind === 'isolation' ? 'Isolation work' : e.repMin <= 6 ? 'Heavy compound lift' : 'Compound lift';
  const extra = rir === 0 ? ', plus 30s after a set to failure' : deload ? ', a bit shorter on a deload' : '';
  return `${base}${extra}`;
}

export function formatClock(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
