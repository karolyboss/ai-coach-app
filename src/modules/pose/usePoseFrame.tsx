import { useMemo, useRef, useState } from 'react';
import type { Pose } from './poseTypes';
import { angle, torsoLean, get } from './geom';

export type FormCues = {
  cues: string[];              // e.g., ["Knees caving", "Lean too far forward"]
  repCount: number;            // squat reps
  phase: 'idle'|'down'|'up';   // simple state
  metrics: Record<string, number>; // debug angles
};

export function useFormCues(pose?: Pose): FormCues {
  const [reps, setReps] = useState(0);
  const phase = useRef<'idle'|'down'|'up'>('idle');
  const atBottom = useRef(false);

  const out = useMemo<FormCues>(() => {
    if (!pose) return { cues: [], repCount: reps, phase: phase.current, metrics: {} };

    const map = new Map(pose.landmarks.map(l => [l.name, l] as const));
    let cues: string[] = [];
    let metrics: Record<string, number> = {};

    try {
      const ls = get(map,'leftShoulder'), rs = get(map,'rightShoulder');
      const lh = get(map,'leftHip'), rh = get(map,'rightHip');
      const lk = get(map,'leftKnee'), rk = get(map,'rightKnee');
      const la = get(map,'leftAnkle'), ra = get(map,'rightAnkle');

      // Key angles
      const kneeL = angle(lh, lk, la); // ~180 standing, smaller when bent
      const kneeR = angle(rh, rk, ra);
      const lean = torsoLean(ls, rs, lh, rh); // 0 upright, higher = leaning forward
      metrics = { kneeL, kneeR, lean };

      // --- Form cues ---
      if (lean > 35) cues.push('Torso leaning too far forward');

      // knee valgus: knee x more medial than ankle relative to hip center
      const hipX = (lh.x + rh.x)/2;
      const kneeMid = (lk.x + rk.x)/2;
      const ankleMid = (la.x + ra.x)/2;
      const kneeDeviation = Math.abs(kneeMid - hipX);
      const ankleDeviation = Math.abs(ankleMid - hipX);
      if (kneeDeviation + 8 < ankleDeviation) cues.push('Knees caving (valgus)');

      // depth cue (not a fault): near bottom when average knee angle is small
      const kneeAvg = (kneeL + kneeR) / 2;
      if (kneeAvg < 100) cues.push('Good depth');

      // --- Simple squat rep counter ---
      // Standing threshold ~150+, bottom threshold ~100-
      const standing = kneeAvg > 150;
      const bottom = kneeAvg < 100;

      if (phase.current === 'idle') {
        if (!standing && !bottom) phase.current = 'down'; // start moving down
      } else if (phase.current === 'down') {
        if (bottom) { atBottom.current = true; phase.current = 'up'; }
      } else if (phase.current === 'up') {
        if (standing && atBottom.current) {
          atBottom.current = false;
          // Count rep when we fully stand up after reaching bottom
          setReps(r => r + 1);
          phase.current = 'idle';
        }
      }

      return { cues, repCount: reps, phase: phase.current, metrics };
    } catch {
      return { cues, repCount: reps, phase: phase.current, metrics };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pose]);

  return out;
}