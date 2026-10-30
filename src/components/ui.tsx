import { ReactNode } from 'react';
import { Pressable, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { themeColors } from '../theme';

// Small building blocks so every screen looks the same. Colors are read
// when drawn, so they follow whoever's side of the app is showing.

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
  const colors = themeColors();
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
  const colors = themeColors();
  return (
    <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: selected ? colors.accent : colors.chip }]}>
      <Text style={{ color: selected ? '#FFFFFF' : colors.text, fontWeight: '600', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, tone = 'accent' }: { label: string; tone?: 'accent' | 'warn' }) {
  const colors = themeColors();
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

const base = {
  button: { borderRadius: 22, paddingVertical: 13, paddingHorizontal: 22, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '700' },
  chip: { borderRadius: 16, paddingVertical: 7, paddingHorizontal: 13, marginRight: 8, marginBottom: 8 },
  badge: { borderRadius: 8, paddingVertical: 2, paddingHorizontal: 7, alignSelf: 'flex-start' },
  screen: { padding: 16, paddingBottom: 48 },
} satisfies Record<string, ViewStyle | TextStyle>;

export const styles = {
  ...base,
  get card(): ViewStyle {
    return { backgroundColor: themeColors().card, borderRadius: 16, padding: 16, marginBottom: 12 };
  },
  get title(): TextStyle {
    return { color: themeColors().text, fontSize: 30, fontWeight: '800', marginBottom: 4 };
  },
  get muted(): TextStyle {
    return { color: themeColors().muted, fontSize: 14, lineHeight: 19 };
  },
  get h2(): TextStyle {
    return { color: themeColors().text, fontSize: 18, fontWeight: '700' };
  },
  get body(): TextStyle {
    return { color: themeColors().text, fontSize: 15, lineHeight: 21 };
  },
};
