import { DAY_MS } from './volume';

// ------------------------------------------------------------------
// What the app does with Apple Health. Kept deliberately small:
//
// - Weight trend changes the plan. Losing more than about 1% of body
//   weight a week makes muscle loss more likely, so the app says to eat
//   more (protein first) and pauses catch-up sets.
// - Sleep has a small effect. After 3 short nights in a row, catch-up
//   sets are skipped; the normal workout stays the same.
// - HRV and resting heart rate are shown for information only. They never
//   change sets or weights.
// ------------------------------------------------------------------

export type HealthData = {
  fetchedAt: string;
  weights: { date: string; lb: number }[];
  sleep: { night: string; hours: number }[]; // night = the morning you woke up, YYYY-MM-DD
  hrv: { date: string; value: number }[];
  restingHR: { date: string; value: number }[];
};

export const FAST_LOSS_PCT = 1; // % of body weight per week
export const SHORT_NIGHT_HOURS = 6;
export const SHORT_NIGHTS_IN_A_ROW = 3;
const MIN_WEIGH_INS = 3; // per week, before a trend counts

function avg(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

function within<T extends { date: string }>(list: T[], now: Date, fromDaysAgo: number, toDaysAgo: number) {
  const from = now.getTime() - fromDaysAgo * DAY_MS;
  const to = now.getTime() - toDaysAgo * DAY_MS;
  return list.filter((x) => {
    const t = new Date(x.date).getTime();
    return t > from && t <= to;
  });
}

export type WeightTrend = {
  average: number; // lb, last 7 days
  previous: number | null; // lb, the 7 days before
  pctPerWeek: number | null; // negative = losing
  fastLoss: boolean;
};

export function weightTrend(weights: HealthData['weights'], now: Date): WeightTrend | null {
  const thisWeek = within(weights, now, 7, 0);
  if (thisWeek.length === 0) return null;
  const average = avg(thisWeek.map((w) => w.lb))!;
  const lastWeek = within(weights, now, 14, 7);
  const enough = thisWeek.length >= MIN_WEIGH_INS && lastWeek.length >= MIN_WEIGH_INS;
  const previous = enough ? avg(lastWeek.map((w) => w.lb)) : null;
  const pctPerWeek = previous ? ((average - previous) / previous) * 100 : null;
  return { average, previous, pctPerWeek, fastLoss: pctPerWeek != null && pctPerWeek <= -FAST_LOSS_PCT };
}

function dayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Short nights in a row, counting back from last night. A night with no
// data ends the streak, so a forgotten ring never counts as bad sleep.
export function shortNightStreak(sleep: HealthData['sleep'], now: Date) {
  const byNight = new Map(sleep.map((s) => [s.night, s.hours]));
  let streak = 0;
  for (let i = 0; i < 14; i++) {
    const hours = byNight.get(dayKey(new Date(now.getTime() - i * DAY_MS)));
    if (hours == null) {
      if (i === 0) continue; // this morning's sleep may not have synced yet
      break;
    }
    if (hours >= SHORT_NIGHT_HOURS) break;
    streak++;
  }
  return streak;
}

// HRV or resting HR: the last 7 days against the 60 days before
export function baselineCompare(list: { date: string; value: number }[], now: Date) {
  const recent = avg(within(list, now, 7, 0).map((x) => x.value));
  const baseline = avg(within(list, now, 67, 7).map((x) => x.value));
  return { recent, baseline };
}

export function proteinTarget(weightLb: number) {
  const kg = weightLb / 2.20462;
  return { low: Math.round(kg * 1.6), high: Math.round(kg * 2.2) };
}

// Reasons to hold off on catch-up sets today, if any
export function catchUpPause(health: HealthData | null, now: Date): string | null {
  if (!health) return null;
  const trend = weightTrend(health.weights, now);
  if (trend?.fastLoss) {
    return `You're losing about ${Math.abs(trend.pctPerWeek!).toFixed(1)}% of your weight a week. Faster than 1% puts muscle at risk, so no catch-up sets until it slows. Eat a bit more, protein first.`;
  }
  const short = shortNightStreak(health.sleep, now);
  if (short >= SHORT_NIGHTS_IN_A_ROW) {
    return `${short} short nights in a row, so no catch-up sets today. Your normal workout is the same.`;
  }
  return null;
}
