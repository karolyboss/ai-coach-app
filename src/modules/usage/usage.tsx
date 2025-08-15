import AsyncStorage from '@react-native-async-storage/async-storage';

function key(){
  const d = new Date();
  const date = d.toISOString().slice(0,10); // YYYY-MM-DD
  return `aicoach:usage:${date}:sets`;
}

export async function getTodaySets(): Promise<number>{
  try { const raw = await AsyncStorage.getItem(key()); return raw? parseInt(raw,10) || 0 : 0; } catch { return 0; }
}
export async function incTodaySets(n=1): Promise<void>{
  const cur = await getTodaySets();
  await AsyncStorage.setItem(key(), String(cur + n));
}
export const FREE_DAILY_SET_LIMIT = 1;