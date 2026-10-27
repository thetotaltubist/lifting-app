import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import RestTimer, { Rest } from '../components/RestTimer';
import { Badge, Button, Card, Chip, Muted, styles } from '../components/ui';
import { alternativesFor, exercise, painAreasFor } from '../engine/exercises';
import { suggest } from '../engine/progression';
import { restReason, restSeconds } from '../engine/rest';
import { cancelRestAlert, scheduleRestAlert } from '../restAlert';
import { LoggedExercise, LoggedSet, Session, Settings } from '../engine/types';
import {
  ActiveWorkout,
  clearActive,
  fromDisplay,
  loadActive,
  loadSessions,
  loadSettings,
  saveActive,
  saveSession,
  toDisplay,
  updateSettings,
} from '../storage';
import { colors } from '../theme';

const RIR_CHOICES = [0, 1, 2, 3, 4];

export default function WorkoutScreen() {
  useKeepAwake();
  const [active, setActive] = useState<ActiveWorkout | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [rest, setRest] = useState<Rest | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    Promise.all([loadActive(), loadSettings(), loadSessions()]).then(([a, s, all]) => {
      if (!a) {
        router.back();
        return;
      }
      setActive(a);
      setSettings(s);
      setSessions(all);
      loaded.current = true;
    });
  }, []);

  // Save every change, so closing the app never loses a set
  useEffect(() => {
    if (loaded.current && active) saveActive(active).catch(() => {});
  }, [active]);

  if (!active || !settings) return null;
  const unit = settings.unit;

  function changeExercise(i: number, change: (ex: LoggedExercise) => LoggedExercise) {
    setActive((a) => (a ? { ...a, exercises: a.exercises.map((ex, k) => (k === i ? change(ex) : ex)) } : a));
  }

  function changeSet(i: number, j: number, change: Partial<LoggedSet>) {
    changeExercise(i, (ex) => ({ ...ex, sets: ex.sets.map((s, k) => (k === j ? { ...s, ...change } : s)) }));
  }

  function toggleDone(i: number, j: number) {
    const ex = active!.exercises[i];
    const set = ex.sets[j];
    if (!set.done && (set.reps == null || set.weight == null)) {
      Alert.alert('Add weight and reps', 'Fill in the weight and reps before checking off the set.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    changeExercise(i, (e) => ({
      ...e,
      sets: e.sets.map((s, k) => {
        if (k === j) return { ...s, done: !s.done };
        // Carry the weight to the next empty set
        if (k === j + 1 && !s.done && !set.done && s.weight == null) return { ...s, weight: set.weight };
        return s;
      }),
    }));
    if (set.done) return;

    // Start the rest timer for whatever comes next
    const e = exercise(ex.exerciseId);
    const nextSet = ex.sets.findIndex((s, k) => k !== j && !s.done);
    const nextExercise = active!.exercises.find((x, k) => k > i && x.sets.some((s) => !s.done));
    const next =
      nextSet >= 0 ? `${e.name}, set ${nextSet + 1}` : nextExercise ? `Next up: ${exercise(nextExercise.exerciseId).name}` : null;
    if (!next) {
      stopRest();
      return;
    }
    const seconds = restSeconds(e, set.rir, active!.deload);
    setRest({ endAt: Date.now() + seconds * 1000, total: seconds, reason: restReason(e, set.rir, active!.deload) });
    scheduleRestAlert(seconds, next);
  }

  function stopRest() {
    setRest(null);
    cancelRestAlert();
  }

  function changeRest(r: Rest) {
    setRest(r);
    scheduleRestAlert((r.endAt - Date.now()) / 1000, 'Time for your next set');
  }

  function addSet(i: number) {
    changeExercise(i, (ex) => {
      const last = ex.sets.at(-1);
      return { ...ex, sets: [...ex.sets, { weight: last?.weight ?? null, reps: null, rir: null, done: false }] };
    });
  }

  function removeSet(i: number) {
    changeExercise(i, (ex) => (ex.sets.length > 1 ? { ...ex, sets: ex.sets.slice(0, -1) } : ex));
  }

  function swap(i: number) {
    const ex = active!.exercises[i];
    const slot = active!.plan.exercises[i]?.templateExerciseId ?? ex.exerciseId;
    const options = alternativesFor(ex.exerciseId).slice(0, 6);
    Alert.alert('Swap exercise', 'Same main muscle, so your volume stays on track.', [
      ...options.map((o) => ({
        text: o.name,
        onPress: () => {
          const s = suggest(o.id, sessions, { comeback: active!.plan.comeback, deload: active!.deload });
          const apply = () =>
            changeExercise(i, (e) => ({
              ...e,
              exerciseId: o.id,
              pain: null,
              painArea: null,
              sets: e.sets.map(() => ({ weight: s.weight, reps: null, rir: null, done: false })),
            }));
          Alert.alert(`Use ${o.name}`, 'Just for today, or every time this slot comes up?', [
            { text: 'Just today', onPress: apply },
            {
              text: 'From now on',
              onPress: async () => {
                apply();
                setSettings(await updateSettings({ swaps: { ...settings!.swaps, [slot]: o.id } }));
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]);
        },
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function finish() {
    const done = active!.exercises.filter((e) => e.sets.some((s) => s.done));
    if (done.length === 0) {
      Alert.alert('Nothing logged yet', 'Check off at least one set, or discard the workout.');
      return;
    }
    const session: Session = {
      id: `${Date.now()}`,
      dayId: active!.dayId,
      startedAt: active!.startedAt,
      finishedAt: new Date().toISOString(),
      deload: active!.deload,
      // A skipped pain rating means no pain
      exercises: done.map((e) => ({
        ...e,
        sets: e.sets.filter((s) => s.done),
        pain: e.pain ?? 0,
        painArea: e.pain ? (e.painArea ?? null) : null,
      })),
    };
    stopRest();
    await saveSession(session);
    await updateSettings({ nextDayOverride: null });
    await clearActive();
    router.back();
  }

  function discard() {
    Alert.alert('Discard this workout?', 'Nothing from it will be saved.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: async () => {
          stopRest();
          await clearActive();
          router.back();
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={90}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <Text style={[styles.h2, { fontSize: 24, marginBottom: 12 }]}>{active.plan.day.name}</Text>
        {active.exercises.map((ex, i) => {
          const e = exercise(ex.exerciseId);
          const planned = active.plan.exercises[i];
          return (
            <Card key={i}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={[styles.h2, { flex: 1 }]}>{e.name}</Text>
                <Pressable onPress={() => swap(i)} hitSlop={8}>
                  <Text style={{ color: colors.accent, fontWeight: '600' }}>Swap</Text>
                </Pressable>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 10 }}>
                <Muted>
                  {e.repMin}-{e.repMax} reps · {planned?.rirTarget ?? '1-2'} in reserve
                  {planned?.suggestion.targetReps ? ` · aim ${planned.suggestion.targetReps}+` : ''}
                </Muted>
                {(ex.catchUpSets ?? 0) > 0 && (
                  <View style={{ marginLeft: 8 }}>
                    <Badge tone="warn" label={`+${ex.catchUpSets} catch-up`} />
                  </View>
                )}
              </View>
              {e.tip && <Muted style={{ marginBottom: 10, fontStyle: 'italic' }}>{e.tip}</Muted>}

              <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                <Text style={[headerText, { width: 26 }]}>Set</Text>
                <Text style={[headerText, { width: 70, textAlign: 'center' }]}>{unit}</Text>
                <Text style={[headerText, { width: 52, textAlign: 'center' }]}>Reps</Text>
                <Text style={[headerText, { flex: 1 }]}>Reps left</Text>
              </View>
              {ex.sets.map((s, j) => (
                <View key={j} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, opacity: s.done ? 0.55 : 1 }}>
                  <Text style={{ width: 26, color: colors.muted, fontWeight: '700' }}>{j + 1}</Text>
                  <TextInput
                    style={[field, { width: 64, marginRight: 6 }]}
                    keyboardType="decimal-pad"
                    value={toDisplay(s.weight, unit)}
                    placeholder="—"
                    placeholderTextColor={colors.placeholder}
                    onChangeText={(t) => changeSet(i, j, { weight: fromDisplay(t, unit) })}
                    editable={!s.done}
                  />
                  <TextInput
                    style={[field, { width: 46, marginRight: 6 }]}
                    keyboardType="number-pad"
                    value={s.reps == null ? '' : String(s.reps)}
                    placeholder={planned?.suggestion.targetReps ? String(planned.suggestion.targetReps) : '—'}
                    placeholderTextColor={colors.placeholder}
                    onChangeText={(t) => changeSet(i, j, { reps: t ? parseInt(t, 10) || 0 : null })}
                    editable={!s.done}
                  />
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    {RIR_CHOICES.map((r) => (
                      <Pressable
                        key={r}
                        onPress={() => changeSet(i, j, { rir: s.rir === r ? null : r })}
                        style={[rirChip, { backgroundColor: s.rir === r ? colors.accent : colors.chip }]}>
                        <Text style={{ color: s.rir === r ? '#FFFFFF' : colors.text, fontWeight: '600', fontSize: 13 }}>
                          {r === 4 ? '4+' : r}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Pressable
                    onPress={() => toggleDone(i, j)}
                    style={[checkBox, { backgroundColor: s.done ? colors.good : colors.chip }]}
                    hitSlop={6}>
                    <Text style={{ color: s.done ? '#FFFFFF' : colors.muted, fontWeight: '800' }}>✓</Text>
                  </Pressable>
                </View>
              ))}
              <View style={{ flexDirection: 'row', marginTop: 2 }}>
                <Pressable onPress={() => addSet(i)} hitSlop={6} style={{ marginRight: 20 }}>
                  <Text style={{ color: colors.accent, fontWeight: '600' }}>+ Add set</Text>
                </Pressable>
                {ex.sets.length > 1 && (
                  <Pressable onPress={() => removeSet(i)} hitSlop={6}>
                    <Text style={{ color: colors.muted, fontWeight: '600' }}>Remove set</Text>
                  </Pressable>
                )}
              </View>

              {ex.sets.some((s) => s.done) && (
                <View style={{ marginTop: 14 }}>
                  <Muted style={{ marginBottom: 6 }}>Any joint or muscle pain? Optional. Skip it if none (10 = worst).</Muted>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {Array.from({ length: 11 }, (_, n) => (
                      <Pressable
                        key={n}
                        onPress={() => changeExercise(i, (x) => ({ ...x, pain: n, painArea: n > 0 ? x.painArea : null }))}
                        style={[
                          painChip,
                          {
                            backgroundColor:
                              ex.pain === n ? (n >= 5 ? colors.danger : n >= 3 ? colors.warn : colors.good) : colors.chip,
                          },
                        ]}>
                        <Text style={{ color: ex.pain === n ? '#FFFFFF' : colors.text, fontWeight: '600' }}>{n}</Text>
                      </Pressable>
                    ))}
                  </View>
                  {!!ex.pain && (
                    <>
                      <Muted style={{ marginTop: 10, marginBottom: 6 }}>Where?</Muted>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {painAreasFor(active.dayId).map((a) => (
                          <Chip
                            key={a}
                            label={a}
                            selected={ex.painArea === a}
                            onPress={() => changeExercise(i, (x) => ({ ...x, painArea: x.painArea === a ? null : a }))}
                          />
                        ))}
                      </View>
                    </>
                  )}
                </View>
              )}
            </Card>
          );
        })}

        <View style={{ marginTop: 8, gap: 10 }}>
          <Button title="Finish workout" onPress={finish} />
          <Button title="Discard workout" kind="danger" onPress={discard} />
        </View>
      </ScrollView>
      {rest && <RestTimer rest={rest} onChange={changeRest} onDone={stopRest} />}
    </KeyboardAvoidingView>
  );
}

const headerText = { color: colors.muted, fontSize: 12, fontWeight: '700' as const };
const field = {
  backgroundColor: colors.field,
  color: colors.text,
  borderRadius: 10,
  paddingVertical: 8,
  paddingHorizontal: 4,
  fontSize: 16,
  fontWeight: '600' as const,
  textAlign: 'center' as const,
};
const rirChip = { width: 24, height: 30, borderRadius: 7, alignItems: 'center' as const, justifyContent: 'center' as const, marginRight: 2 };
const checkBox = { width: 32, height: 32, borderRadius: 16, alignItems: 'center' as const, justifyContent: 'center' as const };
const painChip = { width: 34, height: 32, borderRadius: 8, alignItems: 'center' as const, justifyContent: 'center' as const, marginRight: 6, marginBottom: 6 };
