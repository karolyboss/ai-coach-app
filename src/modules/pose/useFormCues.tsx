// ...existing imports
export type FormCues = {
  cues: string[];
  repCount: number;
  phase: 'idle'|'down'|'up';
  metrics: Record<string, number>;
  highlight: [string,string][]; // NEW: edges to color red
};

export function useFormCues(pose?: Pose): FormCues {
  // ...existing state
  const out = useMemo<FormCues>(() => {
    if (!pose) return { cues: [], repCount: reps, phase: phase.current, metrics: {}, highlight: [] };

    const map = new Map(pose.landmarks.map(l => [l.name, l] as const));
    let cues: string[] = [];
    let metrics: Record<string, number> = {};
    const highlight: [string,string][] = [];

    try {
      // ...existing landmark gets
      // ...compute kneeAvg, lean, valgus etc

      if (lean > 35) { cues.push('Torso leaning too far forward'); highlight.push(['leftShoulder','leftHip'], ['rightShoulder','rightHip']); }

      // valgus heuristic
      if (kneeDeviation + 8 < ankleDeviation) {
        cues.push('Knees caving (valgus)');
        highlight.push(['leftKnee','leftAnkle'], ['rightKnee','rightAnkle']);
      }

      const kneeAvg = (kneeL + kneeR) / 2;
      if (kneeAvg < 100) cues.push('Good depth');

      // ...rep state machine unchanged

      return { cues, repCount: reps, phase: phase.current, metrics, highlight };
    } catch {
      return { cues, repCount: reps, phase: phase.current, metrics, highlight };
    }
  }, [pose]);

  return out;
}