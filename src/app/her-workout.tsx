import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { Button, Card, Chip, Muted, styles } from '../components/ui';
import { logFromStep, moveName, MoveStep, stepSeconds, usesGym } from '../her/engine';
import { DUMBBELLS, move, workout } from '../her/program';
import { clearHerActive, HerActive, loadHerActive, saveHerActive, saveHerSession, updateHerSettings } from '../her/storage';
import { CheckIn, Effort, Form, HerSession, Recovery, Symptoms } from '../her/types';
import { formatClock } from '../engine/rest';
import { colors } from '../theme';

const EFFORT: [Effort, string][] = [
  ['easy', 'Easy'],
  ['right', 'About right'],
  ['hard', 'Hard'],
  ['tooHard', 'Too hard'],
];
const FORM: [Form, string][] = [
  ['solid', 'Solid'],
  ['sloppy', 'Some sloppy reps'],
];
const SYMPTOMS: [Symptoms, string][] = [
  ['none', 'None'],
  ['mild', 'A little'],
  ['stopped', 'I had to stop'],
];
const RECOVERY: [Recovery, string][] = [
  ['fresh', 'Fresh'],
  ['sore', 'A bit sore'],
  ['wiped', 'Wiped out'],
];

// A guided class: one move at a time, timers run on their own
export default function HerWorkoutScreen() {
  useKeepAwake();
  const navigation = useNavigation();
  const [active, setActive] = useState<HerActive | null>(null);
  const [endAt, setEndAt] = useState<number | null>(null); // running timer
  const [paused, setPaused] = useState<number | null>(null); // seconds left while paused
  const [now, setNow] = useState(() => Date.now());
  const [weight, setWeight] = useState<number | null>(null);
  const [reps, setReps] = useState(0);
  const [showEasier, setShowEasier] = useState(false);
  const [checkIn, setCheckIn] = useState<Partial<CheckIn>>({});
  const loaded = useRef(false);

  useEffect(() => {
    loadHerActive().then((a) => {
      if (!a) {
        router.back();
        return;
      }
      setActive(a);
      loaded.current = true;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Save every change, so closing the app never loses her place
  useEffect(() => {
    if (loaded.current && active) saveHerActive(active).catch(() => {});
  }, [active]);

  const index = active?.index ?? 0;
  const step = active && index < active.steps.length ? active.steps[index] : null;

  // Set up each new step: timers start on their own, reps start at the target
  const [seen, setSeen] = useState<number | null>(null);
  if (step && seen !== index) {
    setSeen(index);
    setShowEasier(false);
    setPaused(null);
    if (step.kind === 'reps') {
      const logged = active!.logs[index];
      setWeight(logged?.weight ?? step.weight);
      setReps(logged?.reps ?? step.target);
      setEndAt(null);
    } else {
      setEndAt(now + step.seconds * 1000);
    }
  }

  const left = endAt != null ? Math.max(0, (endAt - now) / 1000) : (paused ?? 0);
  const timerDone = !!step && step.kind !== 'reps' && endAt != null && left <= 0;

  useEffect(() => {
    if (!timerDone || !step) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (step.kind === 'timed') complete();
    else go(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerDone]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={endPressed} hitSlop={8}>
          <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 16 }}>End</Text>
        </Pressable>
      ),
    });
  });

  if (!active) return null;
  const w = workout(active.workoutId);

  function go(by: number) {
    setActive((a) => (a ? { ...a, index: Math.max(0, Math.min(a.steps.length, a.index + by)) } : a));
  }

  // Finishing a move logs it (circuit moves only) and moves on
  function complete() {
    if (!step || step.kind === 'rest') return go(1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (step.section === 'circuit') {
      const m = move(step.moveId);
      const log = logFromStep(step as MoveStep, active!.gym, {
        weight: step.kind === 'reps' ? weight : (m.start ?? null),
        reps: step.kind === 'reps' ? reps : null,
      });
      setActive((a) => (a ? { ...a, logs: { ...a.logs, [a.index]: log }, index: a.index + 1 } : a));
    } else go(1);
  }

  function pause() {
    if (endAt == null) {
      setEndAt(Date.now() + (paused ?? 0) * 1000);
      setPaused(null);
    } else {
      setPaused(left);
      setEndAt(null);
    }
  }

  function endPressed() {
    Alert.alert('End the workout?', 'Save what you did so far, or throw it away.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Save and finish', onPress: () => setActive((a) => (a ? { ...a, index: a.steps.length } : a)) },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: async () => {
          await clearHerActive();
          router.back();
        },
      },
    ]);
  }

  async function save() {
    const c = checkIn as CheckIn;
    const lastCircuit = active!.steps.reduce((last, s, i) => (s.kind !== 'rest' && s.section === 'circuit' ? i : last), -1);
    const session: HerSession = {
      id: `${Date.now()}`,
      workoutId: active!.workoutId,
      startedAt: active!.startedAt,
      finishedAt: new Date().toISOString(),
      level: active!.level,
      week: active!.week,
      gym: active!.gym,
      completed: active!.logs[lastCircuit] != null,
      logs: Object.keys(active!.logs)
        .map(Number)
        .sort((a, b) => a - b)
        .map((k) => active!.logs[k]),
      checkIn: c,
    };
    await saveHerSession(session);
    await updateHerSettings({ nextOverride: null });
    await clearHerActive();
    router.back();
  }

  // ---------- Check-in after the last step ----------
  if (!step) {
    const ready = checkIn.effort && checkIn.form && checkIn.symptoms && checkIn.recovery;
    const q = <T extends string>(title: string, options: [T, string][], key: keyof CheckIn) => (
      <Card>
        <Text style={styles.h2}>{title}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {options.map(([v, label]) => (
            <Chip key={v} label={label} selected={checkIn[key] === v} onPress={() => setCheckIn((c) => ({ ...c, [key]: v }))} />
          ))}
        </View>
      </Card>
    );
    return (
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={[styles.h2, { fontSize: 24 }]}>Nice work</Text>
        <Muted style={{ marginBottom: 14 }}>A quick check-in. It decides when your weights and level go up, so nothing gets harder before you{"'"}re ready.</Muted>
        {q('How hard was it?', EFFORT, 'effort')}
        {q('How was your form?', FORM, 'form')}
        {q('Any neck discomfort, headache or dizziness?', SYMPTOMS, 'symptoms')}
        {checkIn.symptoms && checkIn.symptoms !== 'none' && (
          <Card style={{ backgroundColor: colors.accentSoft }}>
            <Text style={styles.body}>
              Next time the app keeps the weights where they are and suggests the easier versions. If a symptom is new, strong, or keeps coming back, check in with your surgeon.
            </Text>
          </Card>
        )}
        {q('How did you feel going in?', RECOVERY, 'recovery')}
        <View style={{ gap: 10, marginTop: 4 }}>
          <Button title="Save workout" onPress={save} disabled={!ready} />
          <Button title="Back to the last move" kind="plain" onPress={() => go(-1)} />
        </View>
      </ScrollView>
    );
  }

  // ---------- The current step ----------
  const progress = index / active.steps.length;
  const upcoming = active.steps.slice(index + 1).find((s) => s.kind !== 'rest') as MoveStep | undefined;
  const m = step.kind === 'rest' ? null : move(step.moveId);
  const onGym = !!m && step.kind === 'reps' && usesGym(m, active.gym);
  const section =
    step.kind === 'rest'
      ? 'Rest'
      : step.section === 'warmup'
        ? 'Warm-up'
        : step.section === 'cooldown'
          ? 'Cooldown'
          : `${step.circuit} · Round ${step.round} of ${step.rounds}`;
  const secondsLeft = step.kind === 'reps' ? 0 : left;
  const total = step.kind === 'reps' ? 0 : step.seconds;
  const timedPerSide = !!m?.perSide && step.kind === 'timed';
  const minutesLeft = Math.round(active.steps.slice(index).reduce((t, s) => t + stepSeconds(s), 0) / 60);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 4, backgroundColor: colors.track }}>
        <View style={{ width: `${progress * 100}%`, height: 4, backgroundColor: colors.accent }} />
      </View>
      <ScrollView contentContainerStyle={styles.screen}>
        <Muted>
          {w.name} · about {minutesLeft} min left
        </Muted>
        <Text style={{ color: colors.accent, fontWeight: '700', marginTop: 10 }}>{section}</Text>

        {step.kind === 'rest' ? (
          <>
            <Text style={[styles.title, { marginTop: 4 }]}>{step.label}</Text>
            {upcoming && (
              <Muted style={{ marginTop: 6 }}>
                Next: {moveName(move(upcoming.moveId), active.gym)}. Take longer if you need it.
              </Muted>
            )}
          </>
        ) : (
          <>
            <Text style={[styles.title, { marginTop: 4 }]}>{onGym ? m!.gym!.name : m!.name}</Text>
            <Text style={[styles.body, { marginTop: 6 }]}>{onGym ? m!.gym!.cue : m!.cue}</Text>
            <Pressable onPress={() => setShowEasier((x) => !x)} hitSlop={6}>
              <Text style={{ color: colors.accent, fontWeight: '600', marginTop: 10 }}>
                {showEasier ? 'Hide easier version' : 'Neck or dizziness? Easier version'}
              </Text>
            </Pressable>
            {showEasier && (
              <Card style={{ backgroundColor: colors.accentSoft, marginTop: 8 }}>
                <Text style={styles.body}>{m!.easier}</Text>
              </Card>
            )}
          </>
        )}

        {step.kind === 'reps' ? (
          <Card style={{ marginTop: 16 }}>
            <Text style={styles.h2}>
              {step.target} reps{m!.perSide ? ' each side' : ''}
            </Text>
            <Muted style={{ marginTop: 2, marginBottom: 12 }}>
              Range {step.reps[0]}-{step.reps[1]}. {step.why} Breathe out on the effort.
            </Muted>

            {(m!.start != null || onGym) && (
              <>
                <Text style={label}>Weight (lb)</Text>
                {onGym ? (
                  <TextInput
                    style={field}
                    keyboardType="number-pad"
                    value={weight == null ? '' : String(weight)}
                    placeholder="—"
                    placeholderTextColor={colors.placeholder}
                    onChangeText={(t) => setWeight(t ? parseInt(t, 10) || 0 : null)}
                  />
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {DUMBBELLS.filter((d) => d <= (m!.maxWeight ?? Infinity)).map((d) => (
                      <Chip key={d} label={String(d)} selected={weight === d} onPress={() => setWeight(d)} />
                    ))}
                  </View>
                )}
              </>
            )}

            <Text style={[label, { marginTop: 8 }]}>Reps done{m!.perSide ? ' (each side)' : ''}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <StepButton label="−" onPress={() => setReps((r) => Math.max(0, r - 1))} />
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800', width: 64, textAlign: 'center', fontVariant: ['tabular-nums'] }}>{reps}</Text>
              <StepButton label="+" onPress={() => setReps((r) => r + 1)} />
            </View>
          </Card>
        ) : (
          <View style={{ alignItems: 'center', marginVertical: 28 }}>
            <Text style={{ color: timerDone ? colors.good : colors.text, fontSize: 72, fontWeight: '800', fontVariant: ['tabular-nums'] }}>
              {formatClock(secondsLeft)}
            </Text>
            {timedPerSide && <Muted>{secondsLeft > total / 2 ? 'First side' : 'Switch sides'}</Muted>}
            <View style={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: colors.track, overflow: 'hidden', marginTop: 14 }}>
              <View style={{ width: `${total ? (1 - secondsLeft / total) * 100 : 0}%`, height: 6, backgroundColor: step.kind === 'rest' ? colors.good : colors.accent }} />
            </View>
          </View>
        )}

        <View style={{ gap: 10, marginTop: 8 }}>
          {step.kind === 'reps' ? (
            <Button title="Done" onPress={complete} />
          ) : (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button title={endAt == null ? 'Resume' : 'Pause'} kind="plain" onPress={pause} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title={step.kind === 'rest' ? 'Skip rest' : 'Done'} onPress={complete} />
              </View>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={link} onPress={() => go(-1)} suppressHighlighting>
              {index > 0 ? '‹ Back' : ' '}
            </Text>
            {step.kind !== 'rest' && (
              <Text style={link} onPress={() => go(1)} suppressHighlighting>
                Skip move ›
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StepButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} style={{ width: 48, height: 44, borderRadius: 12, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

const label = { color: colors.muted, fontSize: 12, fontWeight: '700' as const, marginBottom: 6 };
const link = { color: colors.accent, fontWeight: '600' as const, fontSize: 15, paddingVertical: 6 };
const field = {
  backgroundColor: colors.field,
  color: colors.text,
  borderRadius: 10,
  paddingVertical: 8,
  paddingHorizontal: 4,
  fontSize: 18,
  fontWeight: '600' as const,
  textAlign: 'center' as const,
  width: 90,
  marginBottom: 8,
};
