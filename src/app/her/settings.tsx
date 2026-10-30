import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import PersonSwitch from '../../components/PersonSwitch';
import { Button, Card, Chip, Muted, styles, Title } from '../../components/ui';
import { LEVELS, PROGRAM_WEEKS, programWeek } from '../../her/engine';
import { loadHerSettings, updateHerSettings } from '../../her/storage';
import { HerSettings, Level } from '../../her/types';
import { herColors as colors } from '../../theme';

const DAY_LETTERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HerSettingsScreen() {
  const [settings, setSettings] = useState<HerSettings | null>(null);
  const [name, setName] = useState('');
  useFocusEffect(
    useCallback(() => {
      loadHerSettings().then((s) => {
        setSettings(s);
        setName(s.name);
      });
    }, [])
  );
  if (!settings) return null;

  const change = async (c: Partial<HerSettings>) => setSettings(await updateHerSettings(c));
  const week = programWeek(settings, new Date());

  function toggleDay(d: number) {
    const days = settings!.gymDays.includes(d) ? settings!.gymDays.filter((x) => x !== d) : [...settings!.gymDays, d].sort();
    change({ gymDays: days });
  }

  function restart() {
    Alert.alert('Restart the 6 weeks?', 'Week 1 starts today. Your history, weights and level stay the same.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restart', onPress: () => change({ programStart: new Date().toISOString(), round: settings!.round + 1 }) },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <PersonSwitch current="her" />
        <Title>Settings</Title>

        <Card>
          <Text style={styles.h2}>Your name</Text>
          <Muted style={{ marginVertical: 8 }}>Shown on the switch at the top.</Muted>
          <TextInput
            style={field}
            value={name}
            onChangeText={setName}
            onEndEditing={() => name.trim() && change({ name: name.trim() })}
            returnKeyType="done"
            placeholderTextColor={colors.placeholder}
            placeholder="Name"
          />
        </Card>

        <Card>
          <Text style={styles.h2}>Gym days</Text>
          <Muted style={{ marginVertical: 8 }}>On these days, workouts start in gym mode and use a machine or cable where it helps. You can switch on the Today screen.</Muted>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {DAY_LETTERS.map((d, i) => (
              <Chip key={d} label={d} selected={settings.gymDays.includes(i)} onPress={() => toggleDay(i)} />
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.h2}>Level</Text>
          <Muted style={{ marginVertical: 8 }}>The app suggests when to move up. You can also change it yourself.</Muted>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {([1, 2, 3] as Level[]).map((l) => (
              <Chip key={l} label={`${l}. ${LEVELS[l].name}`} selected={settings.level === l} onPress={() => change({ level: l, levelSince: new Date().toISOString() })} />
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.h2}>Six-week program</Text>
          <Muted style={{ marginVertical: 8 }}>
            {week > PROGRAM_WEEKS
              ? `Finished. Started ${new Date(settings.programStart).toLocaleDateString()}.`
              : `Week ${week} of ${PROGRAM_WEEKS}, started ${new Date(settings.programStart).toLocaleDateString()}.`}
          </Muted>
          <Button title="Restart the 6 weeks" kind="plain" onPress={restart} />
        </Card>

        <Muted>{"Your workouts are saved on this phone, separate from Jaown & Mayg's."}</Muted>
      </ScrollView>
    </SafeAreaView>
  );
}

const field = {
  backgroundColor: colors.field,
  color: colors.text,
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 12,
  fontSize: 16,
};
