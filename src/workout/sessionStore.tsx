import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WorkoutSet } from './sessionTypes';

const KEY = 'aicoach:workout_sets:v1';

export async function loadSets(): Promise<WorkoutSet[]> {
  try { const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) as WorkoutSet[] : []; }
  catch { return []; }
}

export async function saveSet(entry: WorkoutSet): Promise<void> {
  const all = await loadSets();
  const next = [entry, ...all].slice(0, 1000);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function clearSets(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}