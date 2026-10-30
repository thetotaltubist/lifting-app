import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Person, savePerson } from '../person';
import { loadHerSettings } from '../her/storage';
import { colors } from '../theme';

// The John / her toggle at the top of both sides of the app
export default function PersonSwitch({ current }: { current: Person }) {
  const [herName, setHerName] = useState('');
  useEffect(() => {
    loadHerSettings().then((s) => setHerName(s.name));
  }, []);

  async function pick(p: Person) {
    if (p === current) return;
    Haptics.selectionAsync().catch(() => {});
    await savePerson(p);
    router.replace(p === 'her' ? '/her' : '/');
  }

  return (
    <View style={{ flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: colors.chip, borderRadius: 18, padding: 3, marginBottom: 12 }}>
      {(['john', 'her'] as Person[]).map((p) => {
        const on = p === current;
        return (
          <Pressable
            key={p}
            onPress={() => pick(p)}
            hitSlop={4}
            style={{ backgroundColor: on ? colors.accent : 'transparent', borderRadius: 15, paddingVertical: 6, paddingHorizontal: 16 }}>
            <Text style={{ color: on ? '#FFFFFF' : colors.text, fontWeight: '700', fontSize: 14 }}>{p === 'john' ? 'John' : herName || ' '}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
