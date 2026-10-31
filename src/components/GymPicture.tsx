import { Image, Text, View } from 'react-native';
import { GYM_PHOTOS } from '../her/gymPhotos';
import { Move } from '../her/types';
import { herColors as colors } from '../theme';
import { Muted, styles } from './ui';

// Start and finish photos side by side, or nothing if the move has none
export function GymPicture({ moveId, width }: { moveId: string; width: number }) {
  const photos = GYM_PHOTOS[moveId];
  if (!photos) return null;
  const each = (width - 4) / 2;
  return (
    <View style={{ flexDirection: 'row', gap: 4, width }}>
      {photos.map((src, i) => (
        <View key={i}>
          <Image source={src} style={{ width: each, height: (each * 2) / 3, borderRadius: 8 }} resizeMode="cover" />
          <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 3 }}>
            {i === 0 ? 'Start' : 'Finish'}
          </Text>
        </View>
      ))}
    </View>
  );
}

// A small card for one machine: photos, name, and a quick tip
export function GymCard({ m, width = 230 }: { m: Move; width?: number }) {
  if (!m.gym) return null;
  return (
    <View style={{ width, marginRight: 12 }}>
      <GymPicture moveId={m.id} width={width} />
      <Text style={[styles.body, { fontWeight: '700', marginTop: 4 }]}>{m.gym.name}</Text>
      <Muted style={{ fontSize: 13 }}>{m.gym.cue}</Muted>
    </View>
  );
}
