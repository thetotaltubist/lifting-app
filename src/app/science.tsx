import { ScrollView, Text, View } from 'react-native';
import { Badge, Card, Muted, styles } from '../components/ui';
import { REFERENCES, SCIENCE } from '../science';

export default function ScienceScreen() {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Muted style={{ marginBottom: 14 }}>
        What the plan is based on, and how sure the research is about each part.
      </Muted>
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
