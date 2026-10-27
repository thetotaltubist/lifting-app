import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { formatClock } from '../engine/rest';
import { colors } from '../theme';

export type Rest = { endAt: number; total: number; reason: string };

// Counts down at the bottom of the workout. Based on the clock, not a
// counter, so it stays right if the app goes to the background.
export default function RestTimer({ rest, onChange, onDone }: { rest: Rest; onChange: (r: Rest) => void; onDone: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  const left = (rest.endAt - now) / 1000;
  const finished = left <= 0;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!finished) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const id = setTimeout(onDone, 4000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const adjust = (by: number) => onChange({ ...rest, endAt: Math.max(Date.now(), rest.endAt + by * 1000), total: Math.max(15, rest.total + by) });
  const progress = Math.min(1, Math.max(0, 1 - left / rest.total));

  return (
    <View style={{ backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 26 }}>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.track, overflow: 'hidden', marginBottom: 10 }}>
        <View style={{ width: `${progress * 100}%`, height: 4, backgroundColor: finished ? colors.good : colors.accent }} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: finished ? colors.good : colors.text, fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] }}>
            {finished ? 'Go' : formatClock(left)}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            Suggested {formatClock(rest.total)} · {rest.reason}
          </Text>
        </View>
        {!finished && (
          <>
            <TimerButton label="−15" onPress={() => adjust(-15)} />
            <TimerButton label="+15" onPress={() => adjust(15)} />
          </>
        )}
        <TimerButton label={finished ? 'Close' : 'Skip'} onPress={onDone} strong />
      </View>
    </View>
  );
}

function TimerButton({ label, onPress, strong }: { label: string; onPress: () => void; strong?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={{ backgroundColor: strong ? colors.accent : colors.chip, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 13, marginLeft: 8 }}>
      <Text style={{ color: strong ? '#FFFFFF' : colors.text, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}
