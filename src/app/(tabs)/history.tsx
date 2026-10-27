import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Card, Muted, styles, Title } from '../../components/ui';
import { day, exercise } from '../../engine/exercises';
import { Session, Settings } from '../../engine/types';
import { hardSets } from '../../engine/volume';
import { painOf } from '../../engine/progression';
import { deleteSession, loadSessions, loadSettings, toDisplay } from '../../storage';
import { colors } from '../../theme';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const refresh = useCallback(() => {
    Promise.all([loadSessions(), loadSettings()]).then(([all, s]) => {
      setSessions([...all].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt)));
      setSettings(s);
    });
  }, []);
  useFocusEffect(refresh);

  if (!settings) return null;

  function remove(s: Session) {
    Alert.alert('Delete this workout?', 'Its sets will no longer count toward volume or progress.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSession(s.id).then(refresh) },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Title>History</Title>
        {sessions.length === 0 && <Muted>Finished workouts show up here.</Muted>}
        {sessions.map((s) => {
          const when = new Date(s.finishedAt);
          const sets = s.exercises.reduce((t, e) => t + hardSets(e), 0);
          const minutes = Math.round((when.getTime() - new Date(s.startedAt).getTime()) / 60000);
          const expanded = open === s.id;
          return (
            <Pressable key={s.id} onPress={() => setOpen(expanded ? null : s.id)} onLongPress={() => remove(s)}>
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.h2}>
                    {day(s.dayId).name}
                    {s.deload ? ' (deload)' : ''}
                  </Text>
                  <Muted>{when.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</Muted>
                </View>
                <Muted style={{ marginTop: 2 }}>
                  {sets} sets · {minutes} min
                </Muted>
                {expanded &&
                  s.exercises.map((e, i) => (
                    <View key={i} style={{ marginTop: 10 }}>
                      <Text style={[styles.body, { fontWeight: '600' }]}>{exercise(e.exerciseId).name}</Text>
                      <Muted>
                        {e.sets.map((x) => `${toDisplay(x.weight, settings.unit)}×${x.reps}${x.rir != null ? ` @${x.rir}` : ''}`).join('   ')}
                      </Muted>
                      {painOf(e) > 0 && (
                        <Text style={{ color: painOf(e) >= 3 ? colors.warn : colors.muted, fontSize: 13 }}>
                          {e.pain == null ? 'Shoulder' : (e.painArea ?? 'Pain')} {painOf(e)}/10
                        </Text>
                      )}
                    </View>
                  ))}
              </Card>
            </Pressable>
          );
        })}
        {sessions.length > 0 && <Muted>Tap a workout to see its sets. Press and hold to delete it.</Muted>}
      </ScrollView>
    </SafeAreaView>
  );
}
