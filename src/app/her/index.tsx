import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { GymCard } from '../../components/GymPicture';
import PersonSwitch from '../../components/PersonSwitch';
import { Badge, Button, Card, Chip, Muted, styles, Title } from '../../components/ui';
import {
  buildGymSteps,
  buildSteps,
  estimateMinutes,
  GYM_REST_MACHINE,
  GYM_REST_SET,
  isGymDay,
  LEVELS,
  levelAdvice,
  moveName,
  nextGymWorkoutId,
  nextWorkoutId,
  PROGRAM_WEEKS,
  programDone,
  programWeek,
  repsPerSide,
  Step,
} from '../../her/engine';
import { GYM_ROTATION, GYM_SETS, gymWorkout, move, ROTATION, workout } from '../../her/program';
import { clearHerActive, loadHerActive, loadHerSessions, loadHerSettings, saveHerActive, updateHerSettings } from '../../her/storage';
import { HerSession, HerSettings, Level } from '../../her/types';
import { herColors as colors } from '../../theme';

export default function HerTodayScreen() {
  const [settings, setSettings] = useState<HerSettings | null>(null);
  const [sessions, setSessions] = useState<HerSession[]>([]);
  const [hasActive, setHasActive] = useState(false);
  const [gym, setGym] = useState<boolean | null>(null);
  const [choosing, setChoosing] = useState(false);

  const refresh = useCallback(async () => {
    const [s, all, active] = await Promise.all([loadHerSettings(), loadHerSessions(), loadHerActive()]);
    setSettings(s);
    setSessions(all);
    setHasActive(!!active);
  }, []);
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (!settings) return null;
  const now = new Date();
  const atGym = gym ?? isGymDay(settings, now);
  const week = Math.min(programWeek(settings, now), PROGRAM_WEEKS);
  // Gym days get their own straight-set workouts; home days the circuits
  const g = atGym ? gymWorkout(nextGymWorkoutId(sessions, settings)) : null;
  const w = g ?? workout(nextWorkoutId(sessions, settings));
  const steps = g ? buildGymSteps(g, sessions) : buildSteps(workout(w.id), settings.level, week, false, sessions);
  const advice = levelAdvice(sessions, settings);
  const spec = LEVELS[settings.level];
  const machines = g ? g.exercises.map((e) => move(e.moveId)) : [];

  async function change(c: Partial<HerSettings>) {
    setSettings(await updateHerSettings(c));
  }

  function startPressed() {
    if (!hasActive) return start();
    Alert.alert('Start over?', 'This clears the workout you have in progress.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start over', style: 'destructive', onPress: start },
    ]);
  }

  async function start() {
    await clearHerActive();
    await saveHerActive({ workoutId: w.id, startedAt: new Date().toISOString(), level: settings!.level, week, gym: atGym, steps, index: 0, logs: {} });
    router.push('/her-workout');
  }

  function setLevel(level: Level) {
    change({ level, levelSince: new Date().toISOString() });
  }

  // Group the steps back into sections for the preview
  const sections: { title: string; detail: string; rows: Step[] }[] = [];
  for (const s of steps) {
    if (s.kind === 'rest') continue;
    const title = s.section === 'warmup' ? 'Warm-up' : s.section === 'cooldown' ? 'Cooldown' : g ? 'Machines' : s.circuit!;
    let sec = sections.at(-1);
    if (!sec || sec.title !== title) {
      const rounds = s.section === 'circuit' ? s.rounds! : 1;
      const detail = g ? (s.section === 'circuit' ? `${GYM_SETS} sets each` : '') : rounds > 1 ? `${rounds} rounds` : s.section === 'circuit' ? '1 round' : '';
      sec = { title, detail, rows: [] };
      sections.push(sec);
    }
    if (s.section !== 'circuit' || s.round === 1) sec.rows.push(s);
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.screen}>
        <PersonSwitch current="her" />
        <Muted>
          Week {week} of {PROGRAM_WEEKS} · {g ? 'Gym day' : `Level ${settings.level}, ${spec.name}`}
        </Muted>
        <Title>{w.name}</Title>
        <Muted style={{ marginBottom: 14 }}>
          About {estimateMinutes(steps)} min · {w.focus}
        </Muted>

        {hasActive && (
          <Card style={{ borderWidth: 2, borderColor: colors.accent }}>
            <Text style={styles.h2}>Workout in progress</Text>
            <Muted style={{ marginVertical: 8 }}>You have an unfinished workout.</Muted>
            <Button title="Continue workout" onPress={() => router.push('/her-workout')} />
          </Card>
        )}

        {programDone(settings, now) && (
          <Card>
            <Text style={styles.h2}>Six weeks done</Text>
            <Muted style={{ marginVertical: 8 }}>
              Nice work. Start the next six weeks at your current level. Your weights carry over.
            </Muted>
            <Button title="Start the next 6 weeks" kind="plain" onPress={() => change({ programStart: new Date().toISOString(), round: settings.round + 1 })} />
          </Card>
        )}

        {advice && (
          <Card style={advice.kind === 'up' ? undefined : { backgroundColor: colors.accentSoft }}>
            <Text style={styles.h2}>{advice.title}</Text>
            <Muted style={{ marginVertical: 8 }}>{advice.body}</Muted>
            {advice.kind === 'up' && (
              <View style={{ gap: 8 }}>
                <Button title={`Move up to Level ${settings.level + 1}`} onPress={() => setLevel((settings.level + 1) as Level)} />
                <Button title="Not yet" kind="plain" onPress={() => setLevel(settings.level)} />
              </View>
            )}
            {advice.kind === 'down' && (
              <Button title={`Step back to Level ${settings.level - 1}`} kind="plain" onPress={() => setLevel((settings.level - 1) as Level)} />
            )}
          </Card>
        )}

        <Card>
          <Text style={styles.h2}>Where are you working out?</Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <Chip label="Home (dumbbells)" selected={!atGym} onPress={() => setGym(false)} />
            <Chip label="Full gym" selected={atGym} onPress={() => setGym(true)} />
          </View>
          {atGym && <Muted>Strength only, no cardio. Do all your sets on one machine, then move on to the next.</Muted>}
        </Card>

        {machines.length > 0 && (
          <Card>
            <Text style={styles.h2}>{"Today's machines"}</Text>
            <Muted style={{ marginTop: 2, marginBottom: 10 }}>Swipe to see what to look for at the gym.</Muted>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {machines.map((m) => (
                <GymCard key={m.id} m={m} />
              ))}
            </ScrollView>
          </Card>
        )}


        {sections.map((sec, i) => (
          <Card key={`${sec.title}${i}`}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.h2}>{sec.title}</Text>
              {!!sec.detail && <Badge label={sec.detail} />}
            </View>
            {sec.rows.map((s, j) => {
              if (s.kind === 'rest') return null;
              const m = move(s.moveId);
              const amount =
                s.kind === 'reps'
                  ? `${g ? `${s.rounds} × ` : ''}${s.target} reps${repsPerSide(s) ? ' each side' : ''}${s.weight != null ? ` · ${s.weight} lb` : ''}`
                  : m.perSide
                    ? `${s.seconds / 2} sec each side`
                    : `${s.seconds} sec`;
              return (
                <View key={j} style={{ paddingVertical: 5 }}>
                  <Text style={styles.body}>
                    {moveName(m, !!g)} <Text style={{ color: colors.muted }}>· {amount}</Text>
                  </Text>
                </View>
              );
            })}
          </Card>
        ))}

        <Muted style={{ marginBottom: 12 }}>
          {g
            ? `${GYM_REST_SET} sec rest between sets, ${GYM_REST_MACHINE} sec to get set up on the next machine. Take longer whenever you need it.`
            : `${spec.restMove} sec rest between moves, ${spec.restRound} sec between rounds. Take longer whenever you need it.`}
        </Muted>

        <Button title={hasActive ? 'Start over with this workout' : 'Start workout'} onPress={startPressed} />

        <View style={{ marginTop: 20 }}>
          {choosing ? (
            <>
              <Muted style={{ marginBottom: 8 }}>Do a different workout instead. The order carries on from whatever you do.</Muted>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {(g ? GYM_ROTATION.map(gymWorkout) : ROTATION.map(workout)).map((x, i) => (
                  <Chip
                    key={x.id}
                    label={g ? x.short : `${i + 1}. ${x.short}`}
                    selected={x.id === w.id}
                    onPress={() => {
                      change({ nextOverride: x.id });
                      setChoosing(false);
                    }}
                  />
                ))}
                {settings.nextOverride && <Chip label="Back to the order" onPress={() => change({ nextOverride: null })} />}
              </View>
            </>
          ) : (
            <Button title="Do a different workout" kind="plain" onPress={() => setChoosing(true)} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
