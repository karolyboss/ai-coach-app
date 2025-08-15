import type { Landmark } from './poseTypes';

export function deg(rad: number){ return rad * 180 / Math.PI; }

// angle ABC (at B), in degrees
export function angle(A: Landmark, B: Landmark, C: Landmark){
  const v1x = A.x - B.x, v1y = A.y - B.y;
  const v2x = C.x - B.x, v2y = C.y - B.y;
  const dot = v1x*v2x + v1y*v2y;
  const m1 = Math.hypot(v1x, v1y) || 1;
  const m2 = Math.hypot(v2x, v2y) || 1;
  const cos = Math.max(-1, Math.min(1, dot / (m1*m2)));
  return deg(Math.acos(cos));
}

// lean angle (shoulder→hip vs vertical). 0 = upright, bigger = leaning forward
export function torsoLean(leftShoulder: Landmark, rightShoulder: Landmark, leftHip: Landmark, rightHip: Landmark){
  const sx = (leftShoulder.x + rightShoulder.x)/2;
  const sy = (leftShoulder.y + rightShoulder.y)/2;
  const hx = (leftHip.x + rightHip.x)/2;
  const hy = (leftHip.y + rightHip.y)/2;
  const vx = 0, vy = 1; // vertical
  const ux = hx - sx, uy = hy - sy; // torso vector
  const dot = ux*vx + uy*vy;
  const m1 = Math.hypot(ux, uy) || 1;
  const m2 = Math.hypot(vx, vy) || 1;
  const cos = Math.max(-1, Math.min(1, dot / (m1*m2)));
  return deg(Math.acos(cos));
}

export function get(map: Map<string, Landmark>, name: string){
  const v = map.get(name); if (!v) throw new Error('missing ' + name); return v;
}