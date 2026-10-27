import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Badge, Button, Card, Chip, Muted, styles, Title } from '../../components/ui';
import { DAYS, exercise } from '../../engine/exercises';
import { deloadSuggestion, Plan, planNext } from '../../engine/plan';
import { Session, Settings } from '../../engine/types';
import { loadActive, loadSessions, loadSettings, saveActive, toDisplay, updateSettings } from '../../storage';
import { colors } from '../../theme';

export default function NextScreen() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [hasActive, setHasActive] = useState(false);
  const [choosing, setChoosing] = useState(false);

  const refresh = useCallback(async () => {
    const [s, all, active] = await Promise.all([loadSettings(), loadSessions(), loadActive()]);
    setSettings(s);
    setSessions(all);
    setPlan(planNext(all, s));
    setHasActive(!!active);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (!plan || !settings) return null;

  function startPressed() {
    if (!hasActive) return start();
    Alert.alert('Start over?', 'This clears the sets you logged in the unfinished workout.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start over', style: 'destructive', onPress: start },
    ]);
  }

  async function start() {
    if (!plan) return;
    await saveActive({
      dayId: plan.day.id,
      startedAt: new Date().toISOString(),
      deload: plan.deload,
      plan,
      exercises: plan.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        catchUpSets: e.catchUpSets,
        shoulderPain: null,
        sets: Array.from({ length: e.sets }, () => ({ weight: e.suggestion.weight, reps: null, rir: null, done: false })),
      })),
    });
    router.push('/workout');
  }

  async function chooseDay(id: string | null) {
    await updateSettings({ nextDayOverride: id });
    setChoosing(false);
    refresh();
  }

  async function startDeload() {
    Alert.alert('Start a deload week?', 'For 7 days you do about half the sets at the same weights. A new block starts after.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start deload',
        onPress: async () => {
          await updateSettings({ deloadStart: new Date().toISOString() });
          refresh();
        },
      },
    ]);
  }

  const deloadTip = deloadSuggestion(sessions, settings, new Date());
  // Nothing logged yet in this block
  const blockJustStarted = !plan.deload && !hasActive && !sessions.some((s) => s.finishedAt >= settings.blockStart);
  const totalSets = plan.exercises.reduce((t, e) => t + e.sets, 0);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Muted>{plan.deload ? 'Deload week' : `Block week ${plan.blockWeek + 1} · ${settings.mode === 'cut' ? 'Cut' : 'Build'}`}</Muted>
        <Title>{plan.day.name}</Title>
        <Muted style={{ marginBottom: 14 }}>
          {plan.exercises.length} exercises · {totalSets} sets
        </Muted>

        {hasActive && (
          <Card style={{ borderWidth: 2, borderColor: colors.accent }}>
            <Text style={styles.h2}>Workout in progress</Text>
            <Muted style={{ marginVertical: 8 }}>You have an unfinished workout.</Muted>
            <Button title="Continue workout" onPress={() => router.push('/workout')} />
          </Card>
        )}

        {blockJustStarted && (
          <Card>
            <Text style={styles.h2}>New block</Text>
            <Muted style={{ marginVertical: 8 }}>
              Good time to change any exercises or machines, before you start building on new numbers.
            </Muted>
            <Button title="Review exercises" kind="plain" onPress={() => router.push('/program')} />
          </Card>
        )}

        {plan.notes.map((n) => (
          <Card key={n} style={{ backgroundColor: colors.accentSoft }}>
            <Text style={styles.body}>{n}</Text>
          </Card>
        ))}

        {deloadTip && (
          <Card>
            <Text style={styles.h2}>Time for a lighter week?</Text>
            <Muted style={{ marginVertical: 8 }}>{deloadTip}</Muted>
            <Button title="Start deload week" kind="plain" onPress={startDeload} />
          </Card>
        )}

        {plan.exercises.map((e) => {
          const ex = exercise(e.exerciseId);
          const w = e.suggestion.weight;
          return (
            <Card key={e.templateExerciseId}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={[styles.h2, { flex: 1, marginRight: 8 }]}>{ex.name}</Text>
                {e.catchUpSets > 0 && <Badge tone="warn" label={`+${e.catchUpSets} catch-up`} />}
              </View>
              <Text style={[styles.body, { marginTop: 4 }]}>
                {e.sets} × {ex.repMin}-{ex.repMax}
                {w != null ? ` @ ${toDisplay(w, settings.unit)} ${settings.unit}` : ''} · {e.rirTarget} RIR
              </Text>
              <Muted style={{ marginTop: 4 }}>{e.suggestion.why}</Muted>
            </Card>
          );
        })}

        <View style={{ marginTop: 8 }}>
          <Button title={hasActive ? 'Start over with this plan' : 'Start workout'} onPress={startPressed} />
        </View>

        <View style={{ marginTop: 20 }}>
          {choosing ? (
            <>
              <Muted style={{ marginBottom: 8 }}>Do a different day instead. The rotation carries on from whatever you do.</Muted>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {DAYS.map((d) => (
                  <Chip key={d.id} label={d.name} selected={d.id === plan.day.id} onPress={() => chooseDay(d.id)} />
                ))}
                {settings.nextDayOverride && <Chip label="Back to the rotation" onPress={() => chooseDay(null)} />}
              </View>
            </>
          ) : (
            <Button title="Do a different day" kind="plain" onPress={() => setChoosing(true)} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
