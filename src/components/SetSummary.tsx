import React from 'react';
import { View, Text, Pressable } from 'react-native';

type Props = { reps: number; cues: string[]; onClose: () => void };
export default function SetSummary({ reps, cues, onClose }: Props){
  return (
    <View style={{ position:'absolute', left:0, right:0, top:0, bottom:0, backgroundColor:'#000000CC', alignItems:'center', justifyContent:'center', padding:20 }}>
      <View style={{ width:'88%', backgroundColor:'#0f0f0f', borderRadius:14, borderWidth:1, borderColor:'#222', padding:16 }}>
        <Text style={{ color:'#fff', fontSize:18, fontWeight:'700' }}>Set complete</Text>
        <Text style={{ color:'#bbb', marginTop:6 }}>Reps: {reps}</Text>
        <Text style={{ color:'#bbb', marginTop:6, marginBottom:8 }}>Common cues seen:</Text>
        {cues.length ? cues.slice(0,4).map((c,i)=>(
          <Text key={i} style={{ color:'#ffb3b3' }}>• {c}</Text>
        )) : <Text style={{ color:'#777' }}>None</Text>}
        <Pressable onPress={onClose} style={{ marginTop:14, alignSelf:'flex-end', paddingVertical:8, paddingHorizontal:14, backgroundColor:'#11a36c', borderRadius:10 }}>
          <Text style={{ color:'#fff', fontWeight:'700' }}>OK</Text>
        </Pressable>
      </View>
    </View>
  );
}