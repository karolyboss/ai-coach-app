import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions, View, Text, ActivityIndicator, Pressable } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { say, warn, success } from '../modules/voice/voice';
import { usePoseFrame } from '../modules/pose/usePoseFrame';
import PoseOverlay from '../components/PoseOverlay';
import { useFormCues } from '../modules/pose/useFormCues';
import { usePushupCues } from '../modules/pose/usePushupCues';
import RestTimer from '../components/RestTimer';
import { saveSet } from '../workout/sessionStore';
import SetSummary from '../components/SetSummary';

export default function LiveFormScreen(){
  const devices = useCameraDevices();
  const device = devices.back ?? devices.front;
  const cameraRef = useRef<Camera>(null);
  const [perm, setPerm] = useState<'authorized'|'denied'|'not-determined'>('not-determined');
  const { width, height } = useWindowDimensions();

  const { pose, frameProcessor } = usePoseFrame({ width, height });

  // Mode toggle + cues
  const [mode, setMode] = useState<'squat'|'pushup'>('squat');
  const squat = useFormCues(pose);
  const push  = usePushupCues(pose);
  const ui = mode === 'squat' ? squat : push;

  // TTS: remember last spoken cue so we don't repeat every frame
  const lastCueRef = useRef<string | null>(null);

  // Set Builder state
  const [targetReps, setTargetReps] = useState(10);
  const [totalSets, setTotalSets]   = useState(3);
  const [restSec, setRestSec]       = useState(60);
  const [currentSet, setCurrentSet] = useState(0); // 0 = not started
  const [baseCount, setBaseCount]   = useState(0); // reps offset at start of each set
  const [isRest, setIsRest]         = useState(false);

  // Set summary state
  const [seenCues, setSeenCues] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const setReps = Math.max(0, ui.repCount - baseCount);

  useEffect(() => { (async () => {
    const status = await Camera.requestCameraPermission();
    setPerm(status === 'granted' ? 'authorized' : 'denied');
  })(); }, []);

  // Speak when a NEW cue appears during an active set
  useEffect(()=>{
    if (currentSet > 0 && !isRest && ui.cues.length){
      const first = ui.cues[0];
      if (first && first !== lastCueRef.current){
        lastCueRef.current = first;
        say(first);    // voice
        warn();        // haptic warning
      }
    }
  }, [ui.cues, currentSet, isRest]);

  // Track cues seen during the active set (for summary/history)
  useEffect(()=>{
    if (currentSet > 0 && !isRest) {
      const newOnes = ui.cues.filter(c => !seenCues.includes(c));
      if (newOnes.length) setSeenCues(prev => [...prev, ...newOnes]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.cues, currentSet, isRest]);

  // Auto-complete a set when target is reached
  useEffect(() => {
    if (currentSet > 0 && !isRest && setReps >= targetReps) {
      void saveSet({
        id: 'set-' + Math.random().toString(36).slice(2,10),
        exercise: mode,
        reps: setReps,
        targetReps,
        setIndex: currentSet,
        totalSets,
        restSec,
        createdAt: Date.now(),
        cues: seenCues,
      });
      say(`Set ${currentSet} complete. Rest ${restSec} seconds.`);
      success();
      setShowSummary(true);
      if (currentSet < totalSets) {
        setIsRest(true);
      } else {
        setCurrentSet(0);
      }
    }
  }, [setReps, currentSet, isRest, mode, targetReps, totalSets, restSec, seenCues]);

  const startSession = () => {
    setCurrentSet(1);
    setBaseCount(ui.repCount);
    setSeenCues([]);
    lastCueRef.current = null;
  };
  const nextSet = () => {
    setCurrentSet((s)=> s + 1);
    setBaseCount(ui.repCount);
    setIsRest(false);
    setSeenCues([]);
    lastCueRef.current = null;
  };
  const resetSession = () => {
    setCurrentSet(0);
    setBaseCount(ui.repCount);
    setIsRest(false);
    setSeenCues([]);
    lastCueRef.current = null;
  };

  const preview = useMemo(() => {
    if (!device) return <ActivityIndicator style={{ marginTop: 40 }} />;
    if (perm !== 'authorized') return <Text style={{ margin: 24, color:'#fff' }}>Camera permission required. Check Settings.</Text>;
    return (
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        photo={false}
        video={false}
        audio={false}
        frameProcessor={frameProcessor}
        frameProcessorFps={10}
      />
    );
  }, [device, perm, frameProcessor]);

  return (
    <View style={{ flex:1, backgroundColor:'#000' }}>
      {preview}
      {/* highlight is optional — default to [] to avoid TS issues if hooks aren't updated yet */}
      <PoseOverlay pose={pose} width={width} height={height} highlight={(ui as any).highlight || []} />

      {/* HUD */}
      <View style={{ position:'absolute', top: 40, left: 16, right: 16, gap: 6 }}>
        <Text style={{ color:'#fff', fontSize:18, fontWeight:'700' }}>Live Form ({mode})</Text>
        <Text style={{ color:'#fff' }}>Reps: {setReps} {currentSet>0?`(Set ${currentSet}/${totalSets})`:''}</Text>
        {ui.cues.slice(0,2).map((c,i)=>(
          <Text key={i} style={{ color:'#ffb3b3' }}>⚠ {c}</Text>
        ))}
        <View style={{ flexDirection:'row', gap:10, marginTop:8 }}>
          <Text onPress={()=>setMode('squat')} style={{ color: mode==='squat'?'#00FFC2':'#aaa' }}>Squat</Text>
          <Text style={{ color:'#555' }}>|</Text>
          <Text onPress={()=>setMode('pushup')} style={{ color: mode==='pushup'?'#00FFC2':'#aaa' }}>Push‑up</Text>
        </View>
      </View>

      {/* Set Builder */}
      <View style={{ position:'absolute', bottom: 16, left: 16, right: 16, padding:12, backgroundColor:'#0e0e0e', borderWidth:1, borderColor:'#222', borderRadius:12, gap:10 }}>
        <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
          <Text style={{ color:'#fff', fontWeight:'700' }}>Set Builder</Text>
          <Pressable onPress={resetSession}><Text style={{ color:'#ddd' }}>Reset</Text></Pressable>
        </View>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
          <Text style={{ color:'#ccc', width:80 }}>Reps</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <Pressable onPress={()=>setTargetReps(Math.max(1, targetReps-1))} style={{ padding:6, borderWidth:1, borderColor:'#333', borderRadius:8 }}><Text style={{ color:'#fff' }}>-</Text></Pressable>
            <Text style={{ color:'#fff', width:32, textAlign:'center' }}>{targetReps}</Text>
            <Pressable onPress={()=>setTargetReps(targetReps+1)} style={{ padding:6, borderWidth:1, borderColor:'#333', borderRadius:8 }}><Text style={{ color:'#fff' }}>+</Text></Pressable>
          </View>
          <Text style={{ color:'#ccc', width:80, textAlign:'right' }}>Rest</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <Pressable onPress={()=>setRestSec(Math.max(10, restSec-5))} style={{ padding:6, borderWidth:1, borderColor:'#333', borderRadius:8 }}><Text style={{ color:'#fff' }}>-</Text></Pressable>
            <Text style={{ color:'#fff', width:40, textAlign:'center' }}>{restSec}s</Text>
            <Pressable onPress={()=>setRestSec(restSec+5)} style={{ padding:6, borderWidth:1, borderColor:'#333', borderRadius:8 }}><Text style={{ color:'#fff' }}>+</Text></Pressable>
          </View>
        </View>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
          <Text style={{ color:'#ccc', width:80 }}>Sets</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <Pressable onPress={()=>setTotalSets(Math.max(1, totalSets-1))} style={{ padding:6, borderWidth:1, borderColor:'#333', borderRadius:8 }}><Text style={{ color:'#fff' }}>-</Text></Pressable>
            <Text style={{ color:'#fff', width:32, textAlign:'center' }}>{totalSets}</Text>
            <Pressable onPress={()=>setTotalSets(totalSets+1)} style={{ padding:6, borderWidth:1, borderColor:'#333', borderRadius:8 }}><Text style={{ color:'#fff' }}>+</Text></Pressable>
          </View>
          <View style={{ flex:1 }} />
          {currentSet === 0 ? (
            <Pressable onPress={startSession} style={{ paddingVertical:10, paddingHorizontal:14, backgroundColor:'#11a36c', borderRadius:10 }}>
              <Text style={{ color:'#fff', fontWeight:'700' }}>Start</Text>
            </Pressable>
          ) : (
            <Text style={{ color:'#00FFC2' }}>In Set {currentSet}/{totalSets}</Text>
          )}
        </View>
      </View>

      {/* Rest overlay */}
      {isRest && (
        <RestTimer
          seconds={restSec}
          onDone={()=>{ say('Go'); if (currentSet < totalSets) nextSet(); else resetSession(); }}
          onSkip={()=>{ say('Skipped'); nextSet(); }}
        />
      )}

      {/* Set Summary */}
      {showSummary && (
        <SetSummary reps={setReps} cues={seenCues} onClose={()=>{ setShowSummary(false); setSeenCues([]); }} />
      )}
    </View>
  );
}
