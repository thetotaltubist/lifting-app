import { useState } from 'react';
import { View } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme';

// ------------------------------------------------------------------
// One equal slice per muscle. Each slice fills outward from the middle
// as the week's sets come in, so a short slice is what's left to do.
// ------------------------------------------------------------------

export type Slice = { label: string; have: number; target: number };

const INNER = 0.3; // hole in the middle, as a share of the radius
const GAP = 0.025; // radians between slices

function sector(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const p = (r: number, a: number) => `${cx + r * Math.sin(a)} ${cy - r * Math.cos(a)}`;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${p(r0, a0)} L${p(r1, a0)} A${r1} ${r1} 0 ${large} 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 ${large} 0 ${p(r0, a0)}Z`;
}

export default function WeekPie({ slices }: { slices: Slice[] }) {
  const [width, setWidth] = useState(0);
  const size = Math.min(width, 360);
  const cx = width / 2;
  const R = size / 2 - 72; // room for labels outside the ring
  const cy = R + 30;
  const r0 = R * INNER;
  const step = (2 * Math.PI) / slices.length;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={2 * R + 60}>
          {slices.map((s, i) => {
            const a0 = i * step + GAP;
            const a1 = (i + 1) * step - GAP;
            const pct = Math.min(1, s.target ? s.have / s.target : 1);
            const fill = pct >= 1 ? colors.good : colors.accent;
            const mid = (a0 + a1) / 2;
            const lx = cx + (R + 14) * Math.sin(mid);
            const ly = cy - (R + 14) * Math.cos(mid);
            const side = Math.sin(mid);
            return (
              <G key={s.label}>
                <Path d={sector(cx, cy, r0, R, a0, a1)} fill={colors.track} />
                {pct > 0 && <Path d={sector(cx, cy, r0, r0 + (R - r0) * pct, a0, a1)} fill={fill} />}
                <SvgText
                  x={lx}
                  y={ly + 4}
                  fontSize={11}
                  fontWeight="600"
                  fill={colors.muted}
                  textAnchor={side > 0.2 ? 'start' : side < -0.2 ? 'end' : 'middle'}>
                  {s.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      )}
    </View>
  );
}
