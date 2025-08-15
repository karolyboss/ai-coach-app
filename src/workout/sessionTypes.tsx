export type WorkoutSet = {
  id: string;
  exercise: 'squat' | 'pushup';
  reps: number;
  targetReps: number;
  setIndex: number;
  totalSets: number;
  restSec: number;
  createdAt: number;
  cues?: string[]; // NEW: cues seen during the set
};