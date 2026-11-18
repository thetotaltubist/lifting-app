import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppVersion from '../../components/AppVersion';
import { router, useFocusEffect } from 'expo-router';
import { Button, Card, Chip, Muted, styles, Title } from '../../components/ui';
import { day } from '../../engine/exercises';
import { blockWeek, isDeload, rotationFor } from '../../engine/plan';
import { daysFor, goalFor, goalInfo, programFor } from '../../engine/programs';
import { colors } from '../../theme';
import { Settings } from '../../engine/types';
import { loadSettings, updateSettings } from '../../storage';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  useFocusEffect(
    useCallback(() => {
      loadSettings().then(setSettings);
    }, [])
  );
  if (!settings) return null;

  const change = async (c: Partial<Settings>) => setSettings(await updateSettings(c));
  const now = new Date();
  const deload = isDeload(settings, now);
  const swaps = Object.entries(settings.swaps);

  const rotation = rotationFor(settings);
  function move(i: number, by: number) {
    const j = i + by;
    if (j < 0 || j >= rotation.length) return;
    const next = [...rotation];
    [next[i], next[j]] = [next[j], next[i]];
    change({ rotation: next });
  }


  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Title>Settings</Title>

        <Card>
          <Text style={styles.h2}>Cut or build</Text>
          <Muted style={{ marginVertical: 8 }}>
            Cut keeps the weights heavy with moderate volume, which is enough to hold on to muscle while you lose fat. Build
            raises the weekly targets.
          </Muted>
          <View style={{ flexDirection: 'row' }}>
            <Chip label="Cut" selected={settings.mode === 'cut'} onPress={() => change({ mode: 'cut' })} />
            <Chip label="Build" selected={settings.mode === 'build'} onPress={() => change({ mode: 'build' })} />
          </View>
        </Card>

        <Card>
          <Text style={styles.h2}>Units</Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <Chip label="lb" selected={settings.unit === 'lb'} onPress={() => change({ unit: 'lb' })} />
            <Chip label="kg" selected={settings.unit === 'kg'} onPress={() => change({ unit: 'kg' })} />
          </View>
        </Card>

        <Card>
          <Text style={styles.h2}>Pain check</Text>
          <Muted style={{ marginVertical: 8 }}>
            After each exercise, rate any joint or muscle pain from 0 to 10. 3 or more holds the weight, 5 or more drops it about 10% and
            suggests a swap. Skipping a rating counts as no pain.
          </Muted>
          <View style={{ flexDirection: 'row' }}>
            <Chip label="On" selected={settings.painCheck !== false} onPress={() => change({ painCheck: true })} />
            <Chip label="Off" selected={settings.painCheck === false} onPress={() => change({ painCheck: false })} />
          </View>
        </Card>

        <Card>
          <Text style={styles.h2}>Training block</Text>
          <Text style={[styles.body, { marginTop: 8 }]}>
            {programFor(settings).name} · {goalInfo(goalFor(settings)).name} · {daysFor(settings)} days a week
          </Text>
          <Muted style={{ marginVertical: 8 }}>
            {deload
              ? 'Deload week in progress. A new block starts when it ends.'
              : `Week ${blockWeek(settings, now) + 1}, started ${new Date(settings.blockStart).toLocaleDateString()}. Volume builds for 4 weeks, then holds. The app suggests a deload when your lifts stall.`}
          </Muted>
          <View style={{ gap: 8 }}>
            {deload ? (
              <Button title="End deload now" kind="plain" onPress={() => change({ deloadStart: null, lastDeloadEnd: new Date().toISOString(), blockStart: new Date().toISOString() })} />
            ) : (
              <Button title="Start deload week" kind="plain" onPress={() => change({ deloadStart: new Date().toISOString() })} />
            )}
            <Button title="Start a new block" kind="plain" onPress={() => router.push('/new-block')} />
          </View>
        </Card>

        <Card>
          <Text style={styles.h2}>Rotation order</Text>
          <Muted style={{ marginVertical: 8 }}>The order your days come up in. The app always shows the next one, whatever day of the week it is.</Muted>
          {rotation.map((id, i) => (
            <View key={id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
              <Text style={[styles.body, { width: 24, color: colors.muted }]}>{i + 1}</Text>
              <Text style={[styles.body, { flex: 1 }]}>{day(id).name}</Text>
              <Text style={[arrow, i === 0 && { opacity: 0.25 }]} onPress={() => move(i, -1)} suppressHighlighting>
                ↑
              </Text>
              <Text style={[arrow, i === rotation.length - 1 && { opacity: 0.25 }]} onPress={() => move(i, 1)} suppressHighlighting>
                ↓
              </Text>
            </View>
          ))}
          {settings.rotation && (
            <Text style={{ color: colors.accent, fontWeight: '600', marginTop: 6 }} onPress={() => change({ rotation: undefined })}>
              Back to the original order
            </Text>
          )}
        </Card>

        <Card>
          <Text style={styles.h2}>Exercises and machines</Text>
          <Muted style={{ marginVertical: 8 }}>
            {swaps.length === 0
              ? 'Using the original exercises.'
              : `${swaps.length} ${swaps.length === 1 ? 'exercise' : 'exercises'} replaced.`}{' '}
            Replace any exercise, or add a machine your gym has.
          </Muted>
          <Button title="Change exercises" kind="plain" onPress={() => router.push('/program')} />
        </Card>

        <View style={{ gap: 8 }}>
          <Button title="1 rep max calculator" kind="plain" onPress={() => router.push('/one-rm')} />
          <Button title="How the plan works" kind="plain" onPress={() => router.push('/science')} />
        </View>
        <AppVersion />
      </ScrollView>
    </SafeAreaView>
  );
}

const arrow = { color: colors.accent, fontSize: 20, fontWeight: '700' as const, paddingHorizontal: 12, paddingVertical: 2 };
