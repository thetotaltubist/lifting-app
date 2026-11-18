# Notes for Claude

- Audience: busy lifters aged about 35 to 65 who want their weekly volume in without anything complicated. Keep screens and setup simple.
- The plan is built on weekly volume and published research. Every rule the engine applies should have an entry in `src/science.ts`.
- Apple Health is read-only, weight and sleep only.
- Paid app, one-time low price. No accounts, ads or in-app purchases. Data stays on the phone.
- Work in small, single-feature pull requests. Run `npm test`, `npx tsc --noEmit` and `npx expo lint` before pushing.
- Write commit messages and in-app text in plain words.
- JS-only changes ship over the air. Native changes (modules, permissions, icon, splash) need a new build: bump `ios.buildNumber` in `app.json`.
