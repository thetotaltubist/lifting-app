import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Button, Card, Muted, styles, Title } from '../../components/ui';
import WeightChart from '../../components/WeightChart';
import {
  baselineCompare,
  FAST_LOSS_PCT,
  HealthData,
  proteinTarget,
  SHORT_NIGHT_HOURS,
  shortNightStreak,
  weightTrend,
} from '../../engine/health';
import { connectHealth, healthAvailable, isHealthConnected, loadHealth, refreshHealth } from '../../health';
import { Settings } from '../../engine/types';
import { loadSettings, toDisplay } from '../../storage';
import { colors } from '../../theme';

export default function BodyScreen() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [pulling, setPulling] = useState(false);

  const refresh = useCallback(async (force = false) => {
    setSettings(await loadSettings());
    setConnected(await isHealthConnected());
    setHealth(await loadHealth());
    setHealth(await refreshHealth(force));
  }, []);

  // Always read Health fresh here, so a new weigh-in shows right away
  useFocusEffect(
    useCallback(() => {
      refresh(true);
    }, [refresh])
  );

  async function pullToRefresh() {
    setPulling(true);
    await refresh(true);
    setPulling(false);
  }

  async function connect() {
    const ok = await connectHealth();
    if (!ok) Alert.alert('Apple Health', "Couldn't open Apple Health permissions. Try again, or check Settings → Health → Data Access.");
    refresh(true);
  }

  if (connected == null || !settings) return null;
  const unit = settings.unit;
  const now = new Date();

  if (!healthAvailable()) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.screen}>
          <Title>Body</Title>
          <Card>
            <Text style={styles.body}>Apple Health isn&apos;t available on this device.</Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!connected) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.screen}>
          <Title>Body</Title>
          <Card>
            <Text style={styles.h2}>Connect Apple Health</Text>
            <Muted style={{ marginVertical: 8 }}>
              Mayg &amp; Jaown reads your weight, sleep, HRV and resting heart rate. Oura and Eight Sleep come in through Health. Nothing is
              written back, and nothing leaves your phone.
            </Muted>
            <Button title="Connect Apple Health" onPress={connect} />
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const trend = health ? weightTrend(health.weights, now) : null;
  const protein = trend ? proteinTarget(trend.average) : null;
  const short = health ? shortNightStreak(health.sleep, now) : 0;
  const hrv = health ? baselineCompare(health.hrv, now) : null;
  const rhr = health ? baselineCompare(health.restingHR, now) : null;

  const lastNights = [...(health?.sleep ?? [])].sort((a, b) => b.night.localeCompare(a.night)).slice(0, 7);
  const fmt = (n: number | null, digits = 0) => (n == null ? '—' : n.toFixed(digits));

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.screen} refreshControl={<RefreshControl refreshing={pulling} onRefresh={pullToRefresh} />}>
        <Title>Body</Title>
        <Muted style={{ marginBottom: 14 }}>From Apple Health. Pull down to refresh.</Muted>

        <Card style={trend?.fastLoss ? { borderWidth: 2, borderColor: colors.warn } : undefined}>
          <Text style={styles.h2}>Weight</Text>
          {trend ? (
            <>
              <Text style={[styles.title, { marginTop: 6 }]}>
                {toDisplay(Math.round(trend.average * 10) / 10, unit)} {unit}
              </Text>
              <Muted>7-day average</Muted>
              {trend.pctPerWeek != null ? (
                <Text style={[styles.body, { marginTop: 8, color: trend.fastLoss ? colors.warn : colors.text }]}>
                  {trend.pctPerWeek <= 0 ? 'Losing' : 'Gaining'} {Math.abs(trend.pctPerWeek).toFixed(1)}% a week
                  {trend.fastLoss
                    ? `. That's faster than ${FAST_LOSS_PCT}%, which puts muscle at risk. Eat a bit more, protein first. Catch-up sets are paused until it slows.`
                    : trend.pctPerWeek < 0
                      ? '. A good pace for keeping muscle.'
                      : '.'}
                </Text>
              ) : (
                <Muted style={{ marginTop: 8 }}>Weigh in at least 3 times a week for two weeks to see your rate of loss.</Muted>
              )}
              <WeightChart weights={health?.weights ?? []} unit={unit} />
            </>
          ) : (
            <Muted style={{ marginTop: 6 }}>No weigh-ins in the last 7 days.</Muted>
          )}
        </Card>

        {protein && (
          <Card>
            <Text style={styles.h2}>Protein</Text>
            <Text style={[styles.body, { marginTop: 6 }]}>
              Aim for about {protein.low} g a day. Up to {protein.high} g is fine.
            </Text>
            <Muted style={{ marginTop: 6 }}>
              Based on 1.6 to 2.2 g per kg of body weight. With less appetite on tirzepatide, protein is the part to protect: a shake or
              Greek yogurt are easy ways to get there.
            </Muted>
          </Card>
        )}

        <Card style={short >= 3 ? { borderWidth: 2, borderColor: colors.warn } : undefined}>
          <Text style={styles.h2}>Sleep</Text>
          {lastNights.length === 0 ? (
            <Muted style={{ marginTop: 6 }}>No sleep data in the last few weeks.</Muted>
          ) : (
            <>
              {lastNights.map((n) => (
                <View key={n.night} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
                  <Muted>{new Date(`${n.night}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</Muted>
                  <Text style={[styles.body, { color: n.hours < SHORT_NIGHT_HOURS ? colors.warn : colors.text }]}>
                    {Math.floor(Math.round(n.hours * 60) / 60)}h {Math.round(n.hours * 60) % 60}m
                  </Text>
                </View>
              ))}
              <Muted style={{ marginTop: 8 }}>
                {short >= 3
                  ? `${short} short nights in a row. Catch-up sets are skipped until you get a better night. Your normal workout stays the same.`
                  : `Under ${SHORT_NIGHT_HOURS} hours counts as short. Three short nights in a row skips catch-up sets.`}
              </Muted>
            </>
          )}
        </Card>

        <Card>
          <Text style={styles.h2}>HRV and resting heart rate</Text>
          <Muted style={{ marginTop: 4, marginBottom: 10 }}>For your information only. These don&apos;t change your workouts.</Muted>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
            <Muted>HRV, last 7 days</Muted>
            <Text style={styles.body}>
              {fmt(hrv?.recent ?? null)} ms <Text style={{ color: colors.muted }}>(usual {fmt(hrv?.baseline ?? null)})</Text>
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
            <Muted>Resting HR, last 7 days</Muted>
            <Text style={styles.body}>
              {fmt(rhr?.recent ?? null)} bpm <Text style={{ color: colors.muted }}>(usual {fmt(rhr?.baseline ?? null)})</Text>
            </Text>
          </View>
        </Card>

        <Button title="Refresh from Health" kind="plain" onPress={() => refresh(true)} />
      </ScrollView>
    </SafeAreaView>
  );
}
