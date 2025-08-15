import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { EDGES, Pose } from '../modules/pose/poseTypes';

type Edge = [string, string];

type Props = {
  pose?: Pose;
  width: number;
  height: number;
  highlight?: Edge[]; // edges to color as faults (red)
};

export default function PoseOverlay({ pose, width, height, highlight }: Props){
  if (!pose) return null;
  const map = new Map(pose.landmarks.map(l => [l.name, l] as const));

  const hset = new Set<string>();
  (highlight ?? []).forEach(([a,b])=>{
    const k1 = `${a}-${b}`; const k2 = `${b}-${a}`;
    hset.add(k1); hset.add(k2);
  });

  return (
    <View pointerEvents="none" style={{ position:'absolute', left:0, top:0, width, height }}>
      <Svg width={width} height={height}>
        {EDGES.map(([a,b], i) => {
          const A = map.get(a); const B = map.get(b);
          if (!A || !B) return null;
          const key = `${a}-${b}`;
          const isFault = hset.has(key);
          return (
            <Line
              key={`e-${i}`}
              x1={A.x} y1={A.y} x2={B.x} y2={B.y}
              stroke={isFault? '#ff4d4f' : '#00FFC2'}
              strokeWidth={isFault? 5 : 3}
              strokeLinecap="round"
            />
          );
        })}
        {pose.landmarks.map((l,i) => (
          <Circle key={`k-${i}`} cx={l.x} cy={l.y} r={4} fill="#00FFC2" />
        ))}
      </Svg>
    </View>
  );
}