import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { hideSplash } from '../splash';
import { colors } from '../theme';

export default function RootLayout() {
  useEffect(() => {
    hideSplash();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.bg },
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.accent,
          headerTitleStyle: { color: colors.text },
          headerShadowVisible: false,
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="workout" options={{ title: 'Workout', gestureEnabled: false, headerBackVisible: false }} />
        <Stack.Screen name="science" options={{ title: 'How the plan works' }} />
        <Stack.Screen name="program" options={{ title: 'Exercises' }} />
        <Stack.Screen name="new-exercise" options={{ title: 'Add your own', presentation: 'modal' }} />
        <Stack.Screen name="week-summary" options={{ title: 'This week', presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
