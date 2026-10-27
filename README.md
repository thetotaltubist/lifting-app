# Total Lift

John's personal hypertrophy app for iPhone and iPad (Expo, same setup as Total Practice).

## What it does

- **Next workout, no calendar.** The app always shows the next day in the rotation (Push A, Pull A, Legs A, Push B, Pull B, Legs B), whatever day of the week it is. "Do a different day" lets you jump around.
- **Rolling 7-day volume.** It counts hard sets per muscle over the last 7 days against a weekly target. Sets for helper muscles count as half.
- **Catch-up.** If a muscle falls behind (missed days), upcoming sessions add up to 3 catch-up sets for it, capped at 10 sets per muscle per session. After 3+ days off, the first session back is normal volume.
- **Progressive overload.** Double progression: hit the top of the rep range on every set, then the weight goes up.
- **AC joint.** No barbell pressing or dips. Pressing asks for a 0-10 shoulder rating. 3+ holds the weight, 5+ drops it about 10% and suggests a swap.
- **Cut / Build modes** and **4-week ramping blocks**, with a deload suggested when lifts stall.
- **Apple Health (Body tab).** Weight trend: losing more than 1% a week pauses catch-up sets and suggests eating more, protein first. Three nights under 6 hours skips catch-up sets. HRV and resting heart rate are shown but never change the plan. Read-only.
- "How the plan works" in the app lists the research behind each rule.

Everything is stored on the phone.

## Run it on your iPhone or iPad

```bash
cd lifting-app
npm install
npx expo run:ios --device
```

Pick your iPhone or iPad from the list (cable or the same Wi-Fi).

## Checks

```bash
npm test          # training engine tests
npx tsc --noEmit  # typecheck
npx expo lint
```
