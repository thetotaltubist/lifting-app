import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Badge, Button, Card, Chip, Muted, styles } from '../components/ui';
import { DAY_CHOICES, DAYS_GUIDANCE, daysFor, goalFor, goalInfo, GOALS, programFor, suggestPrograms } from '../engine/programs';
import { Goal, Settings } from '../engine/types';
import { loadSettings, updateSettings } from '../storage';
import { colors } from '../theme';

// ------------------------------------------------------------------
// Start a new block: two questions (goal, days a week), then the
// programs that fit. Starting it resets the 4-week volume ramp.
// ------------------------------------------------------------------

export default function NewBlockScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [goal, setGoal] = useState<Goal>('hypertrophy');
  const [days, setDays] = useState(5);
  const [picked, setPicked] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSettings().then((s) => {
        setSettings(s);
        setGoal(goalFor(s));
        setDays(daysFor(s));
        setPicked(programFor(s).id);
      });
    }, [])
  );
  if (!settings) return null;

  const fits = suggestPrograms(goal, days);
  const good = fits.filter((f) => f.fit !== 'other');
  const others = fits.filter((f) => f.fit === 'other');
  // Keep the pick if it still fits, otherwise move to the best fit
  const choose = (g: Goal, d: number) => {
    setGoal(g);
    setDays(d);
    const next = suggestPrograms(g, d);
    if (!next.some((f) => f.fit !== 'other' && f.program.id === picked)) setPicked(next[0].program.id);
  };
  const current = programFor(settings).id;

  async function start() {
    const now = new Date().toISOString();
    await updateSettings({
      goal,
      daysPerWeek: days,
      program: picked ?? fits[0].program.id,
      // A different program starts from its own order and first day
      ...(picked !== current ? { rotation: undefined, nextDayOverride: null } : {}),
      blockStart: now,
      deloadStart: null,
    });
    router.back();
  }

  const row = (f: (typeof fits)[number]) => {
    const p = f.program;
    const selected = p.id === picked;
    return (
      <Pressable key={p.id} onPress={() => setPicked(p.id)}>
        <Card style={{ borderWidth: 2, borderColor: selected ? colors.accent : 'transparent' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={[styles.h2, { flex: 1 }]}>{p.name}</Text>
            {f.fit === 'best' && <Badge label="Best fit" />}
            {f.fit !== 'best' && p.id === current && <Badge label="Current" />}
          </View>
          <Muted>
            {p.short} · {p.fits[0] === p.fits[1] ? p.fits[0] : `${p.fits[0]}-${p.fits[1]}`} days
          </Muted>
          {selected && <Text style={[styles.body, { marginTop: 8 }]}>{p.guidance}</Text>}
        </Card>
      </Pressable>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Muted style={{ marginBottom: 14 }}>
        Two quick questions. A block runs about 4 to 6 weeks: weekly sets build for 4 weeks, then the app suggests a lighter week when
        your lifts stall. Cut or build stays as it is.
      </Muted>

      <Card>
        <Text style={styles.h2}>{"What's the goal?"}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
          {GOALS.map((g) => (
            <Chip key={g.id} label={g.name} selected={goal === g.id} onPress={() => choose(g.id, days)} />
          ))}
        </View>
        <Muted>{goalInfo(goal).short}</Muted>
      </Card>

      <Card>
        <Text style={styles.h2}>How many days a week will you lift?</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
          {DAY_CHOICES.map((d) => (
            <Chip key={d} label={String(d)} selected={days === d} onPress={() => choose(goal, d)} />
          ))}
        </View>
        <Muted>{DAYS_GUIDANCE}</Muted>
      </Card>

      <Text style={[styles.h2, { marginTop: 8, marginBottom: 10 }]}>Programs that fit</Text>
      {good.map(row)}
      {others.length > 0 &&
        (showAll || others.some((f) => f.program.id === picked) ? (
          <>
            <Muted style={{ marginBottom: 10 }}>{"These don't fit your goal or days as well, but you can still pick one."}</Muted>
            {others.map(row)}
          </>
        ) : (
          <Text style={{ color: colors.accent, fontWeight: '600', marginBottom: 16 }} onPress={() => setShowAll(true)}>
            Show all programs
          </Text>
        ))}

      <Card style={{ backgroundColor: colors.accentSoft }}>
        <Text style={styles.body}>{goalInfo(goal).guidance}</Text>
      </Card>

      <Button title="Start this block" onPress={start} />
    </ScrollView>
  );
}
