import AsyncStorage from '@react-native-async-storage/async-storage';
import { setActiveTheme } from './theme';

// ------------------------------------------------------------------
// Whose side of the app is showing. The app opens to whoever used it last.
// ------------------------------------------------------------------

export type Person = 'john' | 'her';

const KEY = 'person';
let current: Person | null = null;

export async function loadPerson(): Promise<Person> {
  if (current) return current;
  try {
    current = (await AsyncStorage.getItem(KEY)) === 'her' ? 'her' : 'john';
  } catch {
    current = 'john';
  }
  setActiveTheme(current);
  return current;
}

export async function savePerson(p: Person) {
  current = p;
  setActiveTheme(p);
  await AsyncStorage.setItem(KEY, p).catch(() => {});
}
