import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { accentHex, colors } from '../../theme';

const mist = '#A9A7A1';

function TabSymbol({ outline, filled, color, focused }: { outline: string; filled: string; color: any; focused: boolean }) {
  return <SymbolView name={(focused ? filled : outline) as any} tintColor={color} size={24} type="monochrome" />;
}

// Her side of the app. Same look as John's, its own tabs and data.
export default function HerTabLayout() {
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
          title: 'Today',
          tabBarIcon: ({ color, focused }) => <TabSymbol outline="flame" filled="flame.fill" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="program"
        options={{
          title: 'Program',
          tabBarIcon: ({ color, focused }) => <TabSymbol outline="list.bullet.rectangle" filled="list.bullet.rectangle.fill" color={color} focused={focused} />,
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
