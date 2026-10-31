import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

// ------------------------------------------------------------------
// Short beeps for the guided workout timers, so the phone can sit on the
// floor: one at the halfway point of an each-side move (switch sides) and a
// double beep when a timer runs out. Plays alongside music and with the
// silent switch on.
// ------------------------------------------------------------------

const SOUNDS = {
  switch: require('../assets/sounds/switch.wav'),
  done: require('../assets/sounds/done.wav'),
};

type Sound = keyof typeof SOUNDS;
let players: Record<Sound, AudioPlayer> | null = null;

function load() {
  if (players) return players;
  setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {});
  players = { switch: createAudioPlayer(SOUNDS.switch), done: createAudioPlayer(SOUNDS.done) };
  return players;
}

// Call when the workout opens, so the first beep isn't late
export function prepareBeeps() {
  try {
    load();
  } catch {}
}

export function beep(sound: Sound) {
  try {
    const p = load()[sound];
    p.seekTo(0).catch(() => {});
    p.play();
  } catch {}
}
