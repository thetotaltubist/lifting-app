import { useCallback, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Card, Muted, styles } from '../components/ui';
import { exercise } from '../engine/exercises';
import { ACCURATE_REPS, estimate1RM, repTable } from '../engine/oneRm';
import { historyFor } from '../engine/progression';
import { Session, Settings } from '../engine/types';
import { DAY_MS } from '../engine/volume';
import { fromDisplay, loadSessions, loadSettings, toDisplay } from '../storage';
import { colors } from '../theme';

// ------------------------------------------------------------------
// 1 rep max calculator: type a weight and reps, see the estimated max and
// what to lift for other rep counts. Below it, estimates from your own
// recent sets. The planner uses the same math when a rep range changes.
// ------------------------------------------------------------------

export default function OneRmScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [weightText, setWeightText] = useState('');
  const [repsText, setRepsText] = useState('');
  const [since, setSince] = useState(0);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadSettings(), loadSessions()]).then(([s, all]) => {
        setSettings(s);
        setSessions(all);
        setSince(Date.now() - 30 * DAY_MS);
      });
    }, [])
  );
  if (!settings) return null;
  const unit = settings.unit;
  const show = (lb: number) => `${toDisplay(Math.round(lb), unit)} ${unit}`;

  const weight = fromDisplay(weightText, unit);
  const reps = parseInt(repsText, 10);
  const max = weight && reps > 0 ? estimate1RM(weight, reps) : 0;

  // Best estimate per exercise from the last 30 days, assisted lifts left out
  const ids = [...new Set(sessions.flatMap((s) => s.exercises.map((e) => e.exerciseId)))];
  const yours = ids
    .filter((id) => exercise(id).increment > 0)
    .map((id) => {
      let best = 0;
      for (const p of historyFor(id, sessions)) {
        if (new Date(p.date).getTime() < since) break;
        for (const s of p.ex.sets) if (s.done && s.weight && s.reps) best = Math.max(best, estimate1RM(s.weight, s.reps));
      }
      return { id, best };
    })
    .filter((x) => x.best > 0)
    .sort((a, b) => b.best - a.best);

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <Muted style={{ marginBottom: 14 }}>
        Enter a set you did close to failure. The app estimates the most you could lift once, so you never have to test it.
      </Muted>

      <Card>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Muted>Weight ({unit})</Muted>
            <TextInput
              style={field}
              keyboardType="decimal-pad"
              value={weightText}
              onChangeText={setWeightText}
              placeholder="225"
              placeholderTextColor={colors.placeholder}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Muted>Reps</Muted>
            <TextInput
              style={field}
              keyboardType="number-pad"
              value={repsText}
              onChangeText={setRepsText}
              placeholder="8"
              placeholderTextColor={colors.placeholder}
            />
          </View>
        </View>
        {max > 0 && (
          <>
            <Muted style={{ marginTop: 14 }}>Estimated 1 rep max</Muted>
            <Text style={[styles.title, { color: colors.accent }]}>{show(max)}</Text>
            {reps > ACCURATE_REPS && (
              <Muted style={{ color: colors.warn }}>Past {ACCURATE_REPS} reps the estimate gets less accurate. A heavier set gives a better number.</Muted>
            )}
          </>
        )}
      </Card>

      {max > 0 && (
        <Card>
          <Text style={[styles.h2, { marginBottom: 8 }]}>Weight for each rep count</Text>
          <Muted style={{ marginBottom: 8 }}>All-out. For 2 reps left in the tank, use the row 2 reps higher.</Muted>
          {repTable(max).map((r) => (
            <View key={r.reps} style={{ flexDirection: 'row', paddingVertical: 5, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={[styles.body, { width: 70 }]}>{r.reps} {r.reps === 1 ? 'rep' : 'reps'}</Text>
              <Text style={[styles.body, { flex: 1 }]}>{show(r.weight)}</Text>
              <Text style={[styles.body, { color: colors.muted }]}>{r.percent}%</Text>
            </View>
          ))}
        </Card>
      )}

      {yours.length > 0 && (
        <Card>
          <Text style={[styles.h2, { marginBottom: 8 }]}>Your lifts (last 30 days)</Text>
          {yours.map((y) => (
            <View key={y.id} style={{ flexDirection: 'row', paddingVertical: 5, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={[styles.body, { flex: 1 }]}>{exercise(y.id).name}</Text>
              <Text style={styles.body}>{show(y.best)}</Text>
            </View>
          ))}
          <Muted style={{ marginTop: 8 }}>From your best logged set. When a new block changes your reps, the app uses this to pick your starting weight.</Muted>
        </Card>
      )}
    </ScrollView>
  );
}

const field = {
  backgroundColor: colors.field,
  color: colors.text,
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 12,
  fontSize: 18,
  marginTop: 6,
};
