import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { EngineView, useEngine } from '@babylonjs/react-native';
import { Scene, ArcRotateCamera, Vector3, HemisphericLight, Color4 } from '@babylonjs/core';
import '@babylonjs/loaders';
export type Coach3DProps = {
  avatarSrc: string; clipSrc: string; speed?: number; highlightJoint?: string; mirror?: boolean; onReady?: () => void; };
export default function Coach3D({ avatarSrc, clipSrc, speed = 1, highlightJoint, mirror, onReady }: Coach3DProps){
  const engine = useEngine();
  const sceneRef = useRef<any>(null);
  useEffect(() => { if(!engine) return; const scene = new Scene(engine); scene.clearColor = new Color4(0,0,0,0);
    const cam = new ArcRotateCamera('cam', Math.PI/2, Math.PI/3, 2.2, new Vector3(0,1.1,0), scene); cam.attachControl(true);
    new HemisphericLight('hemi', new Vector3(0,1,0), scene);
    (async () => {
      const { SceneLoader } = await import('@babylonjs/core/Loading/sceneLoader');
      try { await SceneLoader.AppendAsync('', require('../../data/env/studio.hdr.ktx2'), scene); } catch(e) {}
      try { await SceneLoader.AppendAsync('', avatarSrc as any, scene); } catch(e) {}
      try { await SceneLoader.AppendAsync('', clipSrc as any, scene); } catch(e) {}
      const ag = scene.animationGroups[0]; if (ag){ ag.speedRatio = speed; ag.loopAnimation = true; ag.start(true); }
      if(mirror){ scene.meshes.forEach(m => { m.scaling.x *= -1; }); }
      sceneRef.current = scene; onReady?.(); })();
    return () => { scene.dispose(); sceneRef.current = null; }; }, [engine, avatarSrc, clipSrc, speed, mirror]);
  return (<View style={styles.root}><EngineView style={StyleSheet.absoluteFill} /></View>);
}
const styles = StyleSheet.create({ root: { flex:1, backgroundColor: 'transparent' } });
