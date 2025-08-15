import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

let lastSpoken = 0;
const COOLDOWN_MS = 1200; // avoid spamming

export function say(text: string){
  const now = Date.now();
  if (now - lastSpoken < COOLDOWN_MS) return;
  lastSpoken = now;
  try { Speech.speak(text, { rate: 1.0, pitch: 1.0, language: 'en-US' }); } catch {}
}

export function warn(){ Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(()=>{}); }
export function success(){ Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(()=>{}); }