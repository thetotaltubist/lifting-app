import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Card, Muted, styles, Title } from '../../components/ui';
import { COOLDOWN_SECONDS, LEVELS, PROGRAM_WEEKS, WARMUP_SECONDS } from '../../her/engine';
import { DUMBBELLS, move, WORKOUTS } from '../../her/program';
import { Circuit, Level } from '../../her/types';
import { herColors as colors } from '../../theme';

// The whole six-week plan in one place: every workout, move, weight,
// and interval, plus how it gets harder.
export default function HerProgramScreen() {
  const [open, setOpen] = useState<string | null>(WORKOUTS[0].id);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Title>Program</Title>
        <Muted style={{ marginBottom: 14 }}>
          {PROGRAM_WEEKS} weeks, 5 workouts a week, done in order. High-rep dumbbell circuits with low-impact cardio. Dumbbells: {DUMBBELLS.join(', ')} lb.
        </Muted>

        {WORKOUTS.map((w, i) => {
          const expanded = open === w.id;
          return (
            <Pressable key={w.id} onPress={() => setOpen(expanded ? null : w.id)}>
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={[styles.h2, { flex: 1, marginRight: 8 }]}>
                    Day {i + 1}: {w.name}
                  </Text>
                  <Badge label={`${w.minutes[0]}-${w.minutes[1]} min`} />
                </View>
                <Muted style={{ marginTop: 4 }}>{w.focus}</Muted>
                {expanded && (
                  <View style={{ marginTop: 8 }}>
                    <Section title="Warm-up" detail={`${WARMUP_SECONDS} sec each`} ids={w.warmup} />
                    {w.circuits.map((c) => (
                      <CircuitView key={c.name} c={c} />
                    ))}
                    <CircuitView c={w.finishers[0]} title="Finisher, odd weeks" />
                    <CircuitView c={w.finishers[1]} title="Finisher, even weeks" />
                    <Section title="Cooldown" detail={`about ${COOLDOWN_SECONDS} sec each`} ids={w.cooldown} />
                    {w.gymNote && <Muted style={{ marginTop: 8 }}>{w.gymNote}</Muted>}
                  </View>
                )}
              </Card>
            </Pressable>
          );
        })}

        <Card>
          <Text style={styles.h2}>How it gets harder</Text>
          <Muted style={{ marginVertical: 8 }}>
            Nothing goes up on a schedule. After each workout you answer four quick questions: how hard it was, your form, any neck or dizziness symptoms, and how you felt going in.
          </Muted>
          <Text style={styles.body}>
            <Text style={{ fontWeight: '700' }}>Weights: </Text>
            hit the top of the rep range every round, with good form and no symptoms, and the next workout suggests the next dumbbell up. Otherwise you add a rep or two first.
          </Text>
          <Text style={[styles.body, { marginTop: 8 }]}>
            <Text style={{ fontWeight: '700' }}>Levels: </Text>
            after at least 8 workouts at a level that felt about right, the app asks if you want to move up. You decide.
          </Text>
          {([1, 2, 3] as Level[]).map((l) => (
            <View key={l} style={{ marginTop: 8 }}>
              <Text style={[styles.body, { fontWeight: '700' }]}>
                Level {l}, {LEVELS[l].name}
              </Text>
              <Muted>
                {LEVELS[l].rounds} rounds · {LEVELS[l].cardio} sec cardio · {LEVELS[l].core} sec holds · {LEVELS[l].restMove} sec between moves
              </Muted>
            </View>
          ))}
          <Text style={[styles.body, { marginTop: 8 }]}>
            <Text style={{ fontWeight: '700' }}>Pulling back: </Text>
            symptoms, sloppy form, or feeling wiped out keep the weights where they are. Two hard workouts out of your last three, or stopping for symptoms, suggests stepping back a level.
          </Text>
        </Card>

        <Card>
          <Text style={styles.h2}>Built around your neck</Text>
          <Muted style={{ marginTop: 8 }}>
            Neck stays long and neutral, with your eyes on the floor a few feet ahead when you hinge. Nothing heavy overhead (8 lb max for presses). No jumping, no burpees, no quick moves from the floor to standing. Mat work is grouped together so you get down and up once, slowly. Breathe out on the effort and never hold your breath.
          </Muted>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function CircuitView({ c, title }: { c: Circuit; title?: string }) {
  return <Section title={title ?? c.name} detail={c.rounds ? `${c.rounds} round${c.rounds > 1 ? 's' : ''}` : 'rounds by level'} ids={c.moves} note={c.note} />;
}

function Section({ title, detail, ids, note }: { title: string; detail: string; ids: string[]; note?: string }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={[styles.body, { fontWeight: '700' }]}>
        {title} <Text style={{ color: colors.muted, fontWeight: '400' }}>· {detail}</Text>
      </Text>
      {note && <Muted>{note}</Muted>}
      {ids.map((id) => {
        const m = move(id);
        const amount = m.reps ? `${m.reps[0]}-${m.reps[1]} reps${m.perSide ? ' each side' : ''}` : m.kind === 'cardio' ? 'interval' : m.kind === 'core' ? 'timed hold' : '';
        const weight = m.start != null ? ` · start ${m.start} lb${m.maxWeight ? `, max ${m.maxWeight}` : ''}` : '';
        return (
          <View key={id} style={{ marginTop: 6, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: colors.border }}>
            <Text style={styles.body}>
              {m.name}
              {(amount || weight) && <Text style={{ color: colors.muted }}> · {amount}{weight}</Text>}
            </Text>
            {m.gym && <Muted>At the gym: {m.gym.name}</Muted>}
          </View>
        );
      })}
    </View>
  );
}
