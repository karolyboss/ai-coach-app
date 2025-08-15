import { useState, useCallback } from 'react';
export function useCoachController(){
  const [clip, setClip] = useState('squat_perfect');
  const [speed, setSpeed] = useState(1);
  const [mirror, setMirror] = useState(false);
  const switchClip = useCallback((name:string)=> setClip(name), []);
  return { clip, speed, mirror, setSpeed, setMirror, switchClip };
}
