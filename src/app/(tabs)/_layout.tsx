import { useEffect, useState } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { loadPerson, Person } from '../../person';
import { accentHex, colors } from '../../theme';

const mist = '#A9A7A1';

function TabSymbol({ outline, filled, color, focused }: { outline: string; filled: string; color: any; focused: boolean }) {
  return <SymbolView name={(focused ? filled : outline) as any} tintColor={color} size={24} type="monochrome" />;
}

export default function TabLayout() {
  // Open to her side if she used the app last
  const [person, setPerson] = useState<Person | null>(null);
  useEffect(() => {
    loadPerson().then(setPerson);
  }, []);
  if (!person) return null;
  if (person === 'her') return <Redirect href="/her" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accentHex,
        tabBarInactiveTintColor: mist,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
        tabBarLabelPosition: 'below-icon',
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Next',
          tabBarIcon: ({ color, focused }) => <TabSymbol outline="dumbbell" filled="dumbbell.fill" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="volume"
        options={{
          title: 'Volume',
          tabBarIcon: ({ color, focused }) => <TabSymbol outline="chart.bar" filled="chart.bar.fill" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="body"
        options={{
          title: 'Body',
          tabBarIcon: ({ color, focused }) => <TabSymbol outline="heart" filled="heart.fill" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => <TabSymbol outline="clock" filled="clock.fill" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <TabSymbol outline="gearshape" filled="gearshape.fill" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
