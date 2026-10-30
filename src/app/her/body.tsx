import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Button, Card, Muted, styles, Title } from '../../components/ui';
import WeightChart from '../../components/WeightChart';
import { FAST_LOSS_PCT, HealthData, weightTrend } from '../../engine/health';
import { connectHealth, healthAvailable, isHealthConnected, loadHealth, refreshHealth } from '../../health';
import { herColors as colors } from '../../theme';

const unit = 'lb';

// Her weight from Apple Health, with her own connection. Informational
// only: none of it changes her workouts.
export default function HerBodyScreen() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [pulling, setPulling] = useState(false);

  const refresh = useCallback(async (force = false) => {
    setConnected(await isHealthConnected('her'));
    setHealth(await loadHealth('her'));
    setHealth(await refreshHealth(force, 'her'));
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
    const ok = await connectHealth('her');
    if (!ok) Alert.alert('Apple Health', "Couldn't open Apple Health permissions. Try again, or check Settings → Health → Data Access.");
    refresh(true);
  }

  if (connected == null) return null;
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
              Reads your weight from Apple Health. Nothing is written back, and nothing leaves your
              phone.
            </Muted>
            <Muted style={{ marginBottom: 12 }}>
              Apple Health only has the data of whoever owns this phone, so connect on your own iPhone. On Jaown&apos;s phone it would show his.
            </Muted>
            <Button title="Connect Apple Health" onPress={connect} />
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const trend = health ? weightTrend(health.weights, now) : null;

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
                {Math.round(trend.average * 10) / 10} lb
              </Text>
              <Muted>7-day average</Muted>
              {trend.pctPerWeek != null ? (
                <Text style={[styles.body, { marginTop: 8, color: trend.fastLoss ? colors.warn : colors.text }]}>
                  {trend.pctPerWeek <= 0 ? 'Losing' : 'Gaining'} {Math.abs(trend.pctPerWeek).toFixed(1)}% a week
                  {trend.fastLoss
                    ? `. That's faster than ${FAST_LOSS_PCT}%, which makes it harder to keep muscle. Eat a bit more, protein first.`
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

        <Button title="Refresh from Health" kind="plain" onPress={() => refresh(true)} />
      </ScrollView>
    </SafeAreaView>
  );
}
