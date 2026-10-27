import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Button, Card, Chip, Muted, styles, Title } from '../../components/ui';
import { blockWeek, isDeload } from '../../engine/plan';
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

  function newBlock() {
    Alert.alert('Start a new block?', 'Weekly targets go back to the low end and build up again over 4 weeks. You can change exercises next.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start new block',
        onPress: async () => {
          await change({ blockStart: new Date().toISOString(), deloadStart: null });
          router.push('/program');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Title>Settings</Title>

        <Card>
          <Text style={styles.h2}>Goal</Text>
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
          <Text style={styles.h2}>Training block</Text>
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
            <Button title="Start a new block" kind="plain" onPress={newBlock} />
          </View>
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

        <Button title="How the plan works" kind="plain" onPress={() => router.push('/science')} />
      </ScrollView>
    </SafeAreaView>
  );
}
