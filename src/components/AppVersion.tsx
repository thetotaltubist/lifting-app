import Constants from 'expo-constants';
import { Muted } from './ui';
import { versionLine } from '../updates';

// Small footer on Settings: app version, build, and the over-the-air
// update the phone is running (if any), so it's easy to tell what's installed.
export default function AppVersion() {
  const cfg = Constants.expoConfig;
  return (
    <Muted style={{ textAlign: 'center', marginTop: 16, fontSize: 12 }}>
      {versionLine(cfg?.version ?? '', cfg?.ios?.buildNumber)}
    </Muted>
  );
}
