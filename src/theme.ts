import { ColorValue, DynamicColorIOS, Platform } from 'react-native';
import palette from '../theme-colors.json';

// ------------------------------------------------------------------
// The app's colors. Each one has a light and a dark version (listed in
// theme-colors.json) and the phone switches between them on its own.
// ------------------------------------------------------------------

type ColorName = keyof typeof palette;

function dyn(name: ColorName): ColorValue {
  const { light, dark } = palette[name];
  return Platform.OS === 'ios' ? DynamicColorIOS({ light, dark }) : light;
}

export const colors = {
  bg: dyn('bg'), // screen background
  card: dyn('card'), // cards and rows
  text: dyn('text'), // main text
  muted: dyn('muted'), // secondary text
  accent: dyn('accent'), // the brand accent
  accentSoft: dyn('accentSoft'), // pale accent behind badges
  border: dyn('border'), // lines
  chip: dyn('chip'), // unselected toggle backgrounds
  track: dyn('track'), // empty part of progress bars
  field: dyn('field'), // text boxes sitting on a card
  placeholder: dyn('placeholder'), // hint text in empty fields
  good: dyn('good'), // on target
  warn: dyn('warn'), // behind or catch-up
  danger: dyn('danger'), // delete, pain warnings
};

// Plain hex for one mode. The native header bar doesn't follow the dynamic
// colors above (it stayed light in dark mode), so it gets these instead.
export function hexColors(scheme: 'light' | 'dark') {
  return Object.fromEntries(
    Object.entries(palette).map(([name, c]) => [name, c[scheme]])
  ) as Record<ColorName, string>;
}

// Plain hex for places that need a string (tab tints, shadows)
export const accentHex = '#E8590C';
