import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Badge, Card, Muted, styles } from '../components/ui';
import { alternativesFor, DAYS, exercise, MUSCLE_NAMES } from '../engine/exercises';
import { Settings } from '../engine/types';
import { loadSettings, updateSettings } from '../storage';
import { colors } from '../theme';

// ------------------------------------------------------------------
// Change exercises or machines. A replacement applies on every day the
// original appears (both Push days, for example), and keeps the same
// main muscle so weekly volume stays on track.
// ------------------------------------------------------------------

export default function ProgramScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [open, setOpen] = useState<string | null>(null); // "dayId:slotId"

  useFocusEffect(
    useCallback(() => {
      loadSettings().then(setSettings);
    }, [])
  );
  if (!settings) return null;

  async function replace(slot: string, id: string | null) {
    const swaps = { ...settings!.swaps };
    if (id == null || id === slot) delete swaps[slot];
    else swaps[slot] = id;
    setSettings(await updateSettings({ swaps }));
    setOpen(null);
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Muted style={{ marginBottom: 14 }}>
        Tap an exercise to replace it. A replacement works the same main muscle and applies everywhere that exercise shows up. The
        start of a block is a good time to change things, so progress stays easy to compare within a block.
      </Muted>
      {DAYS.map((d) => {
        const inDay = d.exercises.map((x) => settings.swaps[x.exerciseId] ?? x.exerciseId);
        return (
          <Card key={d.id}>
            <Text style={[styles.h2, { marginBottom: 6 }]}>{d.name}</Text>
            {d.exercises.map((x) => {
              const slot = x.exerciseId;
              const current = exercise(settings.swaps[slot] ?? slot);
              const swapped = settings.swaps[slot] != null;
              const key = `${d.id}:${slot}`;
              const expanded = open === key;
              const options = alternativesFor(slot)
                .concat(swapped ? [exercise(slot)] : [])
                .filter((o) => o.id !== current.id && !inDay.includes(o.id));
              return (
                <View key={slot} style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 10 }}>
                  <Pressable onPress={() => setOpen(expanded ? null : key)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.body}>{current.name}</Text>
                      <Muted>
                        {MUSCLE_NAMES[current.primary]}
                        {swapped ? ` · replaces ${exercise(slot).name}` : ''}
                      </Muted>
                    </View>
                    <Text style={{ color: colors.accent, fontWeight: '600' }}>{expanded ? 'Close' : 'Replace'}</Text>
                  </Pressable>
                  {expanded && (
                    <View style={{ marginTop: 8 }}>
                      {options.map((o) => (
                        <Pressable
                          key={o.id}
                          onPress={() => replace(slot, o.id)}
                          style={({ pressed }) => [optionRow, pressed && { opacity: 0.6 }]}>
                          <Text style={[styles.body, { flex: 1 }]}>{o.name}</Text>
                          {o.id === slot && <Badge label="Original" />}
                          {o.id.startsWith('custom-') && <Badge label="Yours" />}
                        </Pressable>
                      ))}
                      <Pressable
                        onPress={() => router.push({ pathname: '/new-exercise', params: { slot, muscle: exercise(slot).primary } })}
                        style={optionRow}>
                        <Text style={{ color: colors.accent, fontWeight: '600' }}>+ Add your own exercise or machine</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </Card>
        );
      })}
    </ScrollView>
  );
}

const optionRow = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  backgroundColor: colors.field,
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 12,
  marginBottom: 6,
};
