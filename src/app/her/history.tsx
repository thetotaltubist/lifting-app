import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Card, Muted, styles, Title } from '../../components/ui';
import { moveName } from '../../her/engine';
import { move, workout } from '../../her/program';
import { deleteHerSession, loadHerSessions } from '../../her/storage';
import { HerSession, MoveLog } from '../../her/types';
import { herColors as colors } from '../../theme';

const EFFORT = { easy: 'Easy', right: 'About right', hard: 'Hard', tooHard: 'Too hard' };

export default function HerHistoryScreen() {
  const [sessions, setSessions] = useState<HerSession[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  const refresh = useCallback(() => {
    loadHerSessions().then((all) => setSessions([...all].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))));
  }, []);
  useFocusEffect(refresh);

  function remove(s: HerSession) {
    Alert.alert('Delete this workout?', 'It will no longer count toward your progress.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHerSession(s.id).then(refresh) },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Title>History</Title>
        {sessions.length === 0 && <Muted>Finished workouts show up here.</Muted>}
        {sessions.map((s) => {
          const when = new Date(s.finishedAt);
          const minutes = Math.round((when.getTime() - new Date(s.startedAt).getTime()) / 60000);
          const expanded = open === s.id;
          // Rounds of the same move, side by side
          const byMove: { key: string; logs: MoveLog[] }[] = [];
          for (const l of s.logs) {
            const key = `${l.moveId}${l.gym ? '@gym' : ''}`;
            const row = byMove.find((r) => r.key === key);
            if (row) row.logs.push(l);
            else byMove.push({ key, logs: [l] });
          }
          const c = s.checkIn;
          return (
            <Pressable key={s.id} onPress={() => setOpen(expanded ? null : s.id)} onLongPress={() => remove(s)}>
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[styles.h2, { flex: 1, marginRight: 8 }]}>{workout(s.workoutId).name}</Text>
                  <Muted>{when.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</Muted>
                </View>
                <Muted style={{ marginTop: 2 }}>
                  {minutes} min · Level {s.level} · {s.gym ? 'Gym' : 'Home'}
                  {s.completed ? '' : ' · ended early'}
                  {c ? ` · ${EFFORT[c.effort]}` : ''}
                </Muted>
                {c && c.symptoms !== 'none' && (
                  <Text style={{ color: colors.warn, fontSize: 13, marginTop: 2 }}>
                    {c.symptoms === 'stopped' ? 'Stopped for symptoms' : 'Mild symptoms'}
                  </Text>
                )}
                {expanded &&
                  byMove.map((r) => {
                    const m = move(r.logs[0].moveId);
                    return (
                      <View key={r.key} style={{ marginTop: 10 }}>
                        <Text style={[styles.body, { fontWeight: '600' }]}>{moveName(m, r.logs[0].gym)}</Text>
                        <Muted>
                          {r.logs
                            .map((l) => (l.reps != null ? `${l.weight != null ? `${l.weight}×` : ''}${l.reps}` : `${l.seconds ?? 0}s`))
                            .join('   ')}
                        </Muted>
                      </View>
                    );
                  })}
              </Card>
            </Pressable>
          );
        })}
        {sessions.length > 0 && <Muted>Tap a workout to see each round. Press and hold to delete it.</Muted>}
      </ScrollView>
    </SafeAreaView>
  );
}
