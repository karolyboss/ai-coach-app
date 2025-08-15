import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View, Alert } from 'react-native';
import { loadSets, clearSets } from '../workout/sessionStore';
import type { WorkoutSet } from '../workout/sessionTypes';
import { useEntitlements } from '../modules/entitlements/EntitlementsProvider';
import { isAllowed } from '../modules/entitlements/featureGate';

export default function WorkoutHistoryScreen(){
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const { plan } = useEntitlements();
  const reload = async ()=> setSets(await loadSets());
  useEffect(()=>{ reload(); },[]);

  const clearAll = async () => {
    Alert.alert('Clear history?', 'This will remove all logged sets.', [
      { text:'Cancel', style:'cancel' },
      { text:'Clear', style:'destructive', onPress: async ()=>{ await clearSets(); reload(); } }
    ]);
  };

  const data = isAllowed(plan,'history.unlimited') ? sets : sets.slice(0,10);

  return (
    <View style={{ flex:1, backgroundColor:'#0a0a0a', padding:16 }}>
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <Text style={{ color:'#fff', fontSize:20, fontWeight:'700' }}>Workout History</Text>
        <Pressable onPress={clearAll} style={{ paddingVertical:6, paddingHorizontal:10, borderRadius:8, borderWidth:1, borderColor:'#333' }}>
          <Text style={{ color:'#ddd' }}>Clear</Text>
        </Pressable>
      </View>
      <FlatList
        data={data}
        keyExtractor={(s)=>s.id}
        contentContainerStyle={{ gap:12, paddingBottom:40 }}
        renderItem={({ item }) => (
          <View style={{ padding:12, borderRadius:12, backgroundColor:'#121212', borderWidth:1, borderColor:'#222' }}>
            <Text style={{ color:'#fff', fontWeight:'700' }}>{item.exercise.toUpperCase()} — Set {item.setIndex}/{item.totalSets}</Text>
            <Text style={{ color:'#bbb', marginTop:4 }}>{item.reps} / {item.targetReps} reps • Rest {item.restSec}s</Text>
            <Text style={{ color:'#777', marginTop:4 }}>{new Date(item.createdAt).toLocaleString()}</Text>
            {Array.isArray(item.cues) && item.cues.length > 0 && (
              <View style={{ marginTop:8, gap:4 }}>
                <Text style={{ color:'#aaa' }}>Cues:</Text>
                {item.cues.slice(0,4).map((c,i)=>(
                  <Text key={i} style={{ color:'#ffb3b3' }}>• {c}</Text>
                ))}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={{ color:'#777' }}>No sets yet — log some from Live Form.</Text>}
      />
    </View>
  );
}