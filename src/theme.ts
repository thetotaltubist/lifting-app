import { ColorValue, DynamicColorIOS, Platform } from 'react-native';
import palette from '../theme-colors.json';

// ------------------------------------------------------------------
// The app's colors. Each one has a light and a dark version (listed in
// theme-colors.json) and the phone switches between them on its own.
// ------------------------------------------------------------------

type Palette = typeof palette;
type ColorName = keyof Palette;

function dyn(p: Palette, name: ColorName): ColorValue {
  const { light, dark } = p[name];
  return Platform.OS === 'ios' ? DynamicColorIOS({ light, dark }) : light;
}

function build(p: Palette) {
  return {
    bg: dyn(p, 'bg'), // screen background
    card: dyn(p, 'card'), // cards and rows
    text: dyn(p, 'text'), // main text
    muted: dyn(p, 'muted'), // secondary text
    accent: dyn(p, 'accent'), // the brand accent
    accentSoft: dyn(p, 'accentSoft'), // pale accent behind badges
    border: dyn(p, 'border'), // lines
    chip: dyn(p, 'chip'), // unselected toggle backgrounds
    track: dyn(p, 'track'), // empty part of progress bars
    field: dyn(p, 'field'), // text boxes sitting on a card
    placeholder: dyn(p, 'placeholder'), // hint text in empty fields
    good: dyn(p, 'good'), // on target
    warn: dyn(p, 'warn'), // behind or catch-up
    danger: dyn(p, 'danger'), // delete, pain warnings
  };
}

export const colors = build(palette);

export function themeColors() {
  return colors;
}

// Plain hex for one mode. The native header bar doesn't follow the dynamic
// colors above (it stayed light in dark mode), so it gets these instead.
export function hexColors(scheme: 'light' | 'dark') {
  return Object.fromEntries(
    Object.entries(palette).map(([name, c]) => [name, c[scheme]])
  ) as Record<ColorName, string>;
}

// Plain hex for places that need a string (tab tints, shadows)
export const accentHex = '#E8590C';
