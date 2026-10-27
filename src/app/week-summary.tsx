import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import WeekPie from '../components/WeekPie';
import { Button, Card, Muted, styles, Title } from '../components/ui';
import { MUSCLE_NAMES } from '../engine/exercises';
import { blockWeek, isDeload } from '../engine/plan';
import { Muscle, Session, Settings } from '../engine/types';
import { rollingVolume, TARGETS, weeklyTarget } from '../engine/volume';
import { loadSessions, loadSettings } from '../storage';
import { colors } from '../theme';

// Shown once after finishing a workout: what the last 7 days covered and
// what's still left. Nothing here is saved; the Volume tab has the same numbers.
export default function WeekSummaryScreen() {
  const [data, setData] = useState<{ sessions: Session[]; settings: Settings } | null>(null);

  useEffect(() => {
    Promise.all([loadSessions(), loadSettings()]).then(([sessions, settings]) => setData({ sessions, settings }));
  }, []);

  if (!data) return null;
  const { sessions, settings } = data;
  const now = new Date();
  const done = rollingVolume(sessions, now);
  const week = blockWeek(settings, now);
  const deload = isDeload(settings, now);
  const muscles = Object.keys(TARGETS[settings.mode]) as Muscle[];
  const rows = muscles.map((m) => ({ m, have: done[m] ?? 0, target: weeklyTarget(m, settings.mode, week, deload) }));
  const totalTarget = rows.reduce((t, r) => t + r.target, 0);
  const totalDone = rows.reduce((t, r) => t + Math.min(r.have, r.target), 0);
  const percent = totalTarget ? Math.round((totalDone / totalTarget) * 100) : 100;
  const left = rows.filter((r) => r.have < r.target).sort((a, b) => b.target - b.have - (a.target - a.have));
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Title>Workout saved</Title>
      <Muted style={{ marginBottom: 14 }}>
        {percent}% of this week&apos;s sets are done. Each slice fills as a muscle gets its sets. Green means that muscle is done for the week.
      </Muted>
      <Card>
        <WeekPie slices={rows.map((r) => ({ label: MUSCLE_NAMES[r.m], have: r.have, target: r.target }))} />
      </Card>
      <Card>
        <Text style={styles.h2}>{left.length ? 'Still to do this week' : 'Every muscle is done for the week'}</Text>
        {left.map((r) => (
          <View key={r.m} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={styles.body}>{MUSCLE_NAMES[r.m]}</Text>
            <Text style={[styles.body, { color: colors.muted }]}>
              {fmt(r.target - r.have)} sets left ({fmt(r.have)}/{r.target})
            </Text>
          </View>
        ))}
      </Card>
      <Button title="Done" onPress={() => router.back()} />
    </ScrollView>
  );
}
