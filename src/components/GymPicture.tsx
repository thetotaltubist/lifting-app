import { Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { GYM_PICTURES } from '../her/gymPictures';
import { Move } from '../her/types';
import { herColors as colors } from '../theme';
import { Muted, styles } from './ui';

// Two short strokes at the end of an arrow, pointing along it
function arrowPath([x1, y1, x2, y2]: [number, number, number, number]) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const head = (s: number) => `${x2 - 5 * Math.cos(a + s)} ${y2 - 5 * Math.sin(a + s)}`;
  return `M${x1} ${y1} L${x2} ${y2} M${head(-0.5)} L${x2} ${y2} L${head(0.5)}`;
}

// The drawing of a gym machine, or nothing if the move has none
export function GymPicture({ moveId, width }: { moveId: string; width: number }) {
  const p = GYM_PICTURES[moveId];
  if (!p) return null;
  const round = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <View style={{ backgroundColor: colors.accentSoft, borderRadius: 12, padding: 4 }}>
      <Svg width={width - 8} height={((width - 8) * 80) / 100} viewBox="0 0 100 80">
        <Path d="M2 76 H98" stroke={colors.border} strokeWidth={2} />
        {p.gear.map((d, i) => (
          <Path key={`g${i}`} d={d} stroke={colors.placeholder} strokeWidth={2.5} {...round} />
        ))}
        {p.body.map((d, i) => (
          <Path key={`b${i}`} d={d} stroke={colors.accent} strokeWidth={4.5} {...round} />
        ))}
        <Circle cx={p.head[0]} cy={p.head[1]} r={5.5} fill={colors.accent} />
        {p.arrows.map((a, i) => (
          <Path key={`a${i}`} d={arrowPath(a)} stroke={colors.muted} strokeWidth={1.8} {...round} />
        ))}
      </Svg>
    </View>
  );
}

// A small card for one machine: picture, name, and a quick tip
export function GymCard({ m, width = 170 }: { m: Move; width?: number }) {
  if (!m.gym) return null;
  return (
    <View style={{ width, marginRight: 10 }}>
      <GymPicture moveId={m.id} width={width} />
      <Text style={[styles.body, { fontWeight: '700', marginTop: 6 }]}>{m.gym.name}</Text>
      <Muted style={{ fontSize: 13 }}>{m.gym.cue}</Muted>
    </View>
  );
}
