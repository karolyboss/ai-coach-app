// top types
type Cues = {
  cues: string[];
  repCount: number;
  metrics: Record<string, number>;
  highlight: [string,string][]; // NEW
};

export function usePushupCues(pose?: Pose): Cues {
  // ...existing state
  const out = useMemo<Cues>(() => {
    if (!pose) return { cues: [], repCount: reps, metrics: {}, highlight: [] };

    const map = new Map(pose.landmarks.map(l => [l.name, l] as const));
    const get = (n: string) => { const v = map.get(n); if (!v) throw new Error('missing ' + n); return v; };

    try {
      // ...existing landmarks & metrics
      const highlight: [string,string][] = [];

      // bottom/top detection, phase machine ...

      const cues: string[] = [];
      if (!bottom && !top && elbowAvg > 150) cues.push('Go deeper');
      if (hipSag) { cues.push('Hips sagging — squeeze glutes/core'); highlight.push(['leftHip','leftShoulder'], ['rightHip','rightShoulder']); }
      if (flare)  { cues.push('Elbows flaring — tuck ~45°'); highlight.push(['leftShoulder','leftElbow'], ['leftElbow','leftWrist'], ['rightShoulder','rightElbow'], ['rightElbow','rightWrist']); }

      return { cues, repCount: reps, metrics: { elbowAvg, shoulderSpanX, elbowSpanX }, highlight };
    } catch {
      return { cues: [], repCount: reps, metrics: {}, highlight: [] };
    }
  }, [pose]);

  return out;
}