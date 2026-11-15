import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Badge, Card, Muted, styles } from '../components/ui';
import { daysFor, goalFor, goalInfo, programFor } from '../engine/programs';
import { Settings } from '../engine/types';
import { REFERENCES, SCIENCE } from '../science';
import { loadSettings } from '../storage';
import { colors } from '../theme';

export default function ScienceScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  useFocusEffect(
    useCallback(() => {
      loadSettings().then(setSettings);
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Muted style={{ marginBottom: 14 }}>
        What the plan is based on, and how sure the research is about each part.
      </Muted>
      {settings && (
        <Card style={{ backgroundColor: colors.accentSoft }}>
          <Text style={[styles.h2, { marginBottom: 2 }]}>Your block: {programFor(settings).name}</Text>
          <Muted style={{ marginBottom: 8 }}>
            {goalInfo(goalFor(settings)).name} · {daysFor(settings)} days a week
          </Muted>
          <Text style={[styles.body, { marginBottom: 8 }]}>{programFor(settings).guidance}</Text>
          <Text style={styles.body}>{goalInfo(goalFor(settings)).guidance}</Text>
        </Card>
      )}
      {SCIENCE.map((s) => (
        <Card key={s.title}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={[styles.h2, { flex: 1 }]}>{s.title}</Text>
            <Badge label={`${s.strength} evidence`} tone={s.strength === 'Emerging' ? 'warn' : 'accent'} />
          </View>
          <Text style={styles.body}>{s.body}</Text>
        </Card>
      ))}
      <Text style={[styles.h2, { marginVertical: 8 }]}>References</Text>
      {REFERENCES.map((r) => (
        <Muted key={r} style={{ marginBottom: 8 }}>
          {r}
        </Muted>
      ))}
    </ScrollView>
  );
}
