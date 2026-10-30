import { useMemo, useState } from 'react';
import { Text, useColorScheme, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { DAY_MS } from '../engine/volume';
import { activeTheme, hexColors, themeColors } from '../theme';
import { Chip, Muted } from './ui';

// ------------------------------------------------------------------
// Body weight from Apple Health: each day's weigh-in as a quiet gray dot,
// and the 7-day average as the line that matters. Drag across the chart
// to read any day.
// ------------------------------------------------------------------

// Checked with the dataviz palette validator against the card surface
const LINE = { light: '#D9480F', dark: '#E8612A' };
const DOT = { light: '#A9A7A1', dark: '#6E6D72' };

const HEIGHT = 190;
const LEFT = 40; // room for the weight labels
const TOP = 10;
const BOTTOM = 22; // room for the dates

type Point = { t: number; day: number | null; avg: number | null };

function niceStep(span: number) {
  const raw = span / 4;
  for (const s of [0.5, 1, 2, 5, 10, 20]) if (s >= raw) return s;
  return 50;
}

export default function WeightChart({ weights, unit }: { weights: { date: string; lb: number }[]; unit: 'lb' | 'kg' }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [days, setDays] = useState(30);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  const convert = (lb: number) => (unit === 'kg' ? lb / 2.20462 : lb);

  // One point per day: that day's average weigh-in and the trailing 7-day average
  const points = useMemo<Point[]>(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const byDay = new Map<number, number[]>();
    for (const w of weights) {
      const d = new Date(w.date);
      d.setHours(12, 0, 0, 0);
      const key = d.getTime();
      byDay.set(key, [...(byDay.get(key) ?? []), w.lb]);
    }
    const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
    const out: Point[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const t = today.getTime() - i * DAY_MS;
      const day = byDay.get(t);
      const windowValues: number[] = [];
      for (let k = 0; k < 7; k++) windowValues.push(...(byDay.get(t - k * DAY_MS) ?? []));
      out.push({
        t,
        day: day ? convert(mean(day)) : null,
        avg: windowValues.length ? convert(mean(windowValues)) : null,
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weights, days, unit]);

  const values = points.flatMap((p) => [p.day, p.avg]).filter((v): v is number => v != null);
  const plotW = Math.max(0, width - LEFT - 6);
  const plotH = HEIGHT - TOP - BOTTOM;

  if (values.length === 0) {
    return <Muted style={{ marginTop: 8 }}>No weigh-ins in the last {days} days.</Muted>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = niceStep(Math.max(max - min, 1));
  const lo = Math.floor(min / step) * step;
  const hi = Math.max(lo + step, Math.ceil(max / step) * step);
  const ticks: number[] = [];
  for (let v = lo; v <= hi + 1e-9; v += step) ticks.push(Math.round(v * 10) / 10);

  const x = (i: number) => LEFT + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (v: number) => TOP + plotH - ((v - lo) / (hi - lo)) * plotH;

  const pick = (px: number) => {
    if (plotW <= 0) return;
    const i = Math.round(((px - LEFT) / plotW) * (points.length - 1));
    setActive(Math.max(0, Math.min(points.length - 1, i)));
  };

  // The average line, broken where there's no data
  let path = '';
  let pen = false;
  points.forEach((p, i) => {
    if (p.avg == null) {
      pen = false;
      return;
    }
    path += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.avg).toFixed(1)} `;
    pen = true;
  });
  const lastAvgIndex = points.map((p) => p.avg != null).lastIndexOf(true);

  const colors = themeColors();
  const surface = hexColors(scheme).card;
  const grid = hexColors(scheme).border;
  const line = activeTheme() === 'her' ? hexColors(scheme).accent : LINE[scheme];
  const fmtDate = (t: number) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const fmt = (v: number | null) => (v == null ? '—' : `${v.toFixed(1)} ${unit}`);
  const a = active != null ? points[active] : null;

  return (
    <View style={{ marginTop: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        {/* Legend: two series, so it's always shown */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: DOT[scheme], marginRight: 5 }} />
          <Muted style={{ fontSize: 12, marginRight: 12 }}>Weigh-in</Muted>
          <View style={{ width: 14, height: 2, borderRadius: 1, backgroundColor: line, marginRight: 5 }} />
          <Muted style={{ fontSize: 12 }}>7-day average</Muted>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: -8 }}>
          <Chip label="30d" selected={days === 30} onPress={() => setDays(30)} />
          <Chip label="90d" selected={days === 90} onPress={() => setDays(90)} />
        </View>
      </View>

      <View
        pointerEvents="box-only"
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(e) => pick(e.nativeEvent.locationX)}
        onResponderMove={(e) => pick(e.nativeEvent.locationX)}
        onResponderRelease={() => setActive(null)}
        onResponderTerminate={() => setActive(null)}>
        {width > 0 && (
          <Svg width={width} height={HEIGHT}>
            {ticks.map((t) => (
              <Line key={t} x1={LEFT} x2={width} y1={y(t)} y2={y(t)} stroke={grid} strokeWidth={1} />
            ))}
            {points.map((p, i) =>
              p.day == null ? null : (
                <Circle key={p.t} cx={x(i)} cy={y(p.day)} r={4} fill={DOT[scheme]} stroke={surface} strokeWidth={2} />
              )
            )}
            <Path d={path} stroke={line} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            {lastAvgIndex >= 0 && (
              <Circle cx={x(lastAvgIndex)} cy={y(points[lastAvgIndex].avg!)} r={4.5} fill={line} stroke={surface} strokeWidth={2} />
            )}
            {a && <Line x1={x(active!)} x2={x(active!)} y1={TOP} y2={TOP + plotH} stroke={hexColors(scheme).muted} strokeWidth={1} />}
          </Svg>
        )}
        {/* Axis labels as text so they use the app's text colors */}
        {ticks.map((t) => (
          <Text key={t} style={{ position: 'absolute', left: 0, width: LEFT - 6, top: y(t) - 8, textAlign: 'right', fontSize: 11, color: colors.muted }}>
            {Number.isInteger(t) ? t : t.toFixed(1)}
          </Text>
        ))}
        <Text style={{ position: 'absolute', left: LEFT, top: HEIGHT - 16, fontSize: 11, color: colors.muted }}>{fmtDate(points[0].t)}</Text>
        <Text style={{ position: 'absolute', right: 0, top: HEIGHT - 16, fontSize: 11, color: colors.muted }}>Today</Text>

        {a && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: Math.min(Math.max(x(active!) - 70, 0), Math.max(0, width - 140)),
              width: 140,
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 10,
              padding: 8,
            }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>{fmtDate(a.t)}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Weigh-in {fmt(a.day)}</Text>
            <Text style={{ color: colors.text, fontSize: 12 }}>7-day avg {fmt(a.avg)}</Text>
          </View>
        )}
      </View>
      <Muted style={{ fontSize: 12, marginTop: 4 }}>Drag across the chart to see any day.</Muted>
    </View>
  );
}
