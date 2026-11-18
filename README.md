# Lift (working title)

A simple, evidence-based lifting app for busy lifters. It plans every workout around one idea: get your weekly sets in for every muscle, even when life gets in the way. Name, icon and App Store listing are still to come.

Started from Mayg & Jaown (John's personal app), keeping the training engine and dropping everything personal.

## What it does

- **Next workout, no calendar.** The app always shows the next day in the rotation, whatever day of the week it is. "Do a different day" lets you jump around.
- **Programs and goals.** Settings → Start a new block asks the goal (strength, hypertrophy or endurance) and how many days a week you'll lift (2-6), then suggests the programs that fit: Full body (2-3 days), 5x5 (3 days, strength), Upper / Lower (4), 5-day hybrid, Push / Pull / Legs (5-6) and Bro split (5-6). The goal sets reps, rest, reps in reserve and weekly sets.
- **Rolling 7-day volume.** Hard sets per muscle over the last 7 days against a weekly target. Sets for helper muscles count as half.
- **Catch-up.** If a muscle falls behind (missed days, or fewer days than planned), upcoming sessions add up to 3 catch-up sets for it, capped at 10 sets per muscle per session. After 3+ days off, the first session back is normal volume.
- **Progressive overload.** Double progression: hit the top of the rep range on every set, then the weight goes up. A new block with a different rep range starts from an estimated 1 rep max.
- **1 rep max calculator** in Settings.
- **Pain check** (Settings, on by default). An optional 0-10 rating after each exercise. 3+ holds the weight, 5+ drops it about 10% and suggests a swap.
- **Cut / Build modes** and **4-week ramping blocks**, with a deload suggested when lifts stall.
- **Apple Health (Body tab), weight and sleep only.** Losing more than 1% a week pauses catch-up sets and suggests eating more, protein first. Three nights under 6 hours skips catch-up sets. Read-only.
- **Rest timer** with a notification when it's up.
- "How the plan works" lists the research behind each rule.

Everything is stored on the phone.

## Before the first build

The app ID (`com.jdicesar.liftnew`), name and icon are placeholders. Set the real ones in `app.json` once the name is picked, because the app ID can't change after the app is on the App Store. Then link a new Expo project with `npx eas-cli@27 init` and turn over-the-air updates back on with `npx eas-cli@27 update:configure`.

## Run it on your iPhone or iPad

```bash
npm install
npx expo run:ios --device
```

## Over-the-air updates

Once the Expo project is linked (above):

```bash
git checkout main && git pull
npm run ota -- "what changed"
```

Anything native, like a new Expo module, a permission, the icon or the splash, still needs a new TestFlight build with a higher build number.

## Checks

These run automatically on every pull request.

```bash
npm test          # training engine tests
npx tsc --noEmit  # typecheck
npx expo lint
```
