import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme';

// Small building blocks so every screen looks the same

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  kind = 'primary',
  disabled,
}: {
  title: string;
  onPress: () => void;
  kind?: 'primary' | 'plain' | 'danger';
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        kind === 'primary' ? { backgroundColor: colors.accent } : { backgroundColor: colors.chip },
        (pressed || disabled) && { opacity: 0.6 },
      ]}>
      <Text style={[styles.buttonText, { color: kind === 'primary' ? '#FFFFFF' : kind === 'danger' ? colors.danger : colors.text }]}>
        {title}
      </Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: selected ? colors.accent : colors.chip }]}>
      <Text style={{ color: selected ? '#FFFFFF' : colors.text, fontWeight: '600', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, tone = 'accent' }: { label: string; tone?: 'accent' | 'warn' }) {
  return (
    <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
      <Text style={{ color: tone === 'warn' ? colors.warn : colors.accent, fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children, style }: { children: ReactNode; style?: object }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12 },
  button: { borderRadius: 22, paddingVertical: 13, paddingHorizontal: 22, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '700' },
  chip: { borderRadius: 16, paddingVertical: 7, paddingHorizontal: 13, marginRight: 8, marginBottom: 8 },
  badge: { borderRadius: 8, paddingVertical: 2, paddingHorizontal: 7, alignSelf: 'flex-start' },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', marginBottom: 4 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 19 },
  h2: { color: colors.text, fontSize: 18, fontWeight: '700' },
  body: { color: colors.text, fontSize: 15, lineHeight: 21 },
  screen: { padding: 16, paddingBottom: 48 },
});
