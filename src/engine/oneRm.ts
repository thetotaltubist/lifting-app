// ------------------------------------------------------------------
// Estimated 1 rep max from a set of several reps, and the other way:
// what weight to use for a number of reps.
//
// Uses the average of the Epley and Brzycki formulas, two of the most
// common. Both are usually within a few percent up to about 10 reps and
// get less accurate past that. No need to ever test a true max.
// ------------------------------------------------------------------

export const ACCURATE_REPS = 10;

export function estimate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  const r = Math.min(reps, 30);
  const epley = weight * (1 + r / 30);
  const brzycki = weight * (36 / (37 - Math.min(r, 36)));
  return (epley + brzycki) / 2;
}

// The weight you could lift for `reps` reps all-out
export function weightForReps(oneRm: number, reps: number): number {
  if (reps <= 1) return oneRm;
  const r = Math.min(reps, 30);
  const epley = oneRm / (1 + r / 30);
  const brzycki = (oneRm * (37 - Math.min(r, 36))) / 36;
  return (epley + brzycki) / 2;
}

// Percent of 1RM for each rep count, for the calculator's table
export function repTable(oneRm: number, upTo = 12) {
  return Array.from({ length: upTo }, (_, i) => {
    const reps = i + 1;
    const w = weightForReps(oneRm, reps);
    return { reps, weight: w, percent: oneRm ? Math.round((w / oneRm) * 100) : 0 };
  });
}
