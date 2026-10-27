import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Chip, Muted, styles } from '../components/ui';
import { exercise, makeCustomExercise, MUSCLE_NAMES } from '../engine/exercises';
import { Muscle } from '../engine/types';
import { loadSettings, updateSettings } from '../storage';
import { colors } from '../theme';

const RANGES: [number, number][] = [
  [6, 10],
  [8, 12],
  [10, 15],
  [12, 20],
];
const STEPS = [2.5, 5, 10];

// Add an exercise or machine the library doesn't have, and use it in place
// of the exercise you came from.
export default function NewExerciseScreen() {
  const params = useLocalSearchParams<{ slot?: string; muscle?: Muscle }>();
  const startMuscle = (params.muscle && params.muscle in MUSCLE_NAMES ? params.muscle : 'chest') as Muscle;
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState<Muscle>(startMuscle);
  const [kind, setKind] = useState<'compound' | 'isolation'>('isolation');
  const [range, setRange] = useState<[number, number]>([8, 12]);
  const [step, setStep] = useState(5);

  async function save() {
    if (!name.trim()) {
      Alert.alert('Name it first', 'Give the exercise or machine a name.');
      return;
    }
    const e = makeCustomExercise({
      name: name.trim(),
      primary: muscle,
      repMin: range[0],
      repMax: range[1],
      kind,
      increment: step,
    });
    const settings = await loadSettings();
    await updateSettings({
      customExercises: [...settings.customExercises, e],
      swaps: params.slot ? { ...settings.swaps, [params.slot]: e.id } : settings.swaps,
    });
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      {params.slot && <Muted style={{ marginBottom: 12 }}>This will replace {exercise(params.slot).name}.</Muted>}
      <Card>
        <Text style={styles.h2}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Hammer Strength iso-lateral row"
          placeholderTextColor={colors.placeholder}
          style={{ backgroundColor: colors.field, color: colors.text, borderRadius: 10, padding: 12, fontSize: 16, marginTop: 8 }}
          autoFocus
        />
      </Card>

      <Card>
        <Text style={styles.h2}>Main muscle</Text>
        <Muted style={{ marginVertical: 6 }}>Counts as one full set toward this muscle&apos;s weekly volume.</Muted>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {(Object.keys(MUSCLE_NAMES) as Muscle[]).map((m) => (
            <Chip key={m} label={MUSCLE_NAMES[m]} selected={muscle === m} onPress={() => setMuscle(m)} />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.h2}>Type</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <Chip label="Compound (press, row, squat)" selected={kind === 'compound'} onPress={() => setKind('compound')} />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Chip label="Isolation (curl, raise, fly)" selected={kind === 'isolation'} onPress={() => setKind('isolation')} />
        </View>
      </Card>

      <Card>
        <Text style={styles.h2}>Rep range</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {RANGES.map((r) => (
            <Chip key={r.join()} label={`${r[0]}-${r[1]}`} selected={range[0] === r[0]} onPress={() => setRange(r)} />
          ))}
        </View>
        <Text style={[styles.h2, { marginTop: 10 }]}>Add this much weight each time (lb)</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {STEPS.map((s) => (
            <Chip key={s} label={String(s)} selected={step === s} onPress={() => setStep(s)} />
          ))}
        </View>
      </Card>

      <Button title={params.slot ? 'Save and use it' : 'Save'} onPress={save} />
    </ScrollView>
  );
}
