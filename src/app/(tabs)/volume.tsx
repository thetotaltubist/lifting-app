import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Card, Muted, styles, Title } from '../../components/ui';
import { MUSCLE_NAMES } from '../../engine/exercises';
import { blockWeek, isDeload } from '../../engine/plan';
import { weeklyRecap } from '../../engine/recap';
import { Muscle, Session, Settings } from '../../engine/types';
import { rollingVolume, TARGETS, weeklyTarget } from '../../engine/volume';
import { loadSessions, loadSettings } from '../../storage';
import { colors } from '../../theme';

export default function VolumeScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadSessions(), loadSettings()]).then(([all, s]) => {
        setSessions(all);
        setSettings(s);
      });
    }, [])
  );

  if (!settings) return null;
  const now = new Date();
  const done = rollingVolume(sessions, now);
  const week = blockWeek(settings, now);
  const deload = isDeload(settings, now);
  const muscles = Object.keys(TARGETS[settings.mode]) as Muscle[];
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  const recap = weeklyRecap(sessions, settings, now);
  const day = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Title>Volume</Title>
        <Muted style={{ marginBottom: 14 }}>
          Hard sets in the last 7 days against your weekly target. Sets for a helper muscle count as half (presses count toward
          triceps, for example), so these are close estimates.
        </Muted>
        <Card>
          {muscles.map((m) => {
            const target = weeklyTarget(m, settings.mode, week, deload);
            const have = done[m] ?? 0;
            const pct = Math.min(1, target ? have / target : 0);
            const tone = have >= target ? colors.good : have >= target * 0.7 ? colors.accent : colors.warn;
            return (
              <View key={m} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={styles.body}>{MUSCLE_NAMES[m]}</Text>
                  <Text style={[styles.body, { fontWeight: '700' }]}>
                    {fmt(have)} / {target}
                  </Text>
                </View>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.track, overflow: 'hidden' }}>
                  <View style={{ width: `${pct * 100}%`, height: 8, backgroundColor: tone }} />
                </View>
              </View>
            );
          })}
          <Muted>Front delts have no target of their own because chest and shoulder presses already cover them.</Muted>
        </Card>
        {recap.length > 0 && (
          <Card>
            <Text style={styles.h2}>Weekly recap</Text>
            <Muted style={{ marginTop: 4, marginBottom: 6 }}>
              Finished weeks, counted from the day your block started. Tap a week to see what was short.
            </Muted>
            {recap.map((w, i) => {
              const allHit = w.hit === w.total;
              const tone = allHit ? colors.good : w.hit >= w.total * 0.7 ? colors.accent : colors.warn;
              const short = w.rows.filter((r) => r.target > 0 && r.have < r.target);
              const last = new Date(w.end.getTime() - 1);
              return (
                <Pressable key={w.start.toISOString()} onPress={() => setOpen(open === i ? null : i)} style={{ paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderColor: colors.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.body}>
                        {day(w.start)} – {day(last)}
                        {w.deload ? ' · deload' : ''}
                      </Text>
                      <Muted>
                        {w.workouts} {w.workouts === 1 ? 'workout' : 'workouts'}
                      </Muted>
                    </View>
                    <Text style={[styles.body, { fontWeight: '700', color: tone }]}>
                      {w.workouts ? (allHit ? 'All goals hit' : `${w.hit} of ${w.total} hit`) : 'No workouts'}
                    </Text>
                  </View>
                  {open === i && w.workouts > 0 && (
                    <View style={{ marginTop: 6 }}>
                      {short.length === 0 && <Muted>Every muscle reached its target this week.</Muted>}
                      {short.map((r) => (
                        <View key={r.muscle} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                          <Text style={[styles.body, { color: colors.muted }]}>{MUSCLE_NAMES[r.muscle]}</Text>
                          <Text style={[styles.body, { color: colors.muted }]}>
                            {fmt(r.have)} / {r.target}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </Card>
        )}
        <Text style={{ color: colors.accent, fontWeight: '600', marginTop: 4 }} onPress={() => router.push('/science')}>
          How these targets are set
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
