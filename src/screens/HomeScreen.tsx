import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useEntitlements } from '../modules/entitlements/EntitlementsProvider';
import { isAllowed } from '../modules/entitlements/featureGate';

export default function HomeScreen({ navigation }: any){
  const { plan } = useEntitlements();
  return (
    <View style={{ flex:1, padding:20, gap:16, paddingTop:64, backgroundColor:'#000' }}>
      <Text style={{ fontSize:24, fontWeight:'700', color:'#fff' }}>AI Coach</Text>
      <Text style={{ color:'#aaa' }}>Plan: {plan.toUpperCase()}</Text>

      <Pressable onPress={()=>navigation.navigate('LiveForm')} style={{ padding:16, backgroundColor:'#111', borderRadius:12 }}>
        <Text style={{ color:'#fff' }}>Start Workout</Text>
      </Pressable>

      <Pressable onPress={()=>navigation.navigate('LogMeal')} style={{ padding:16, backgroundColor:'#111', borderRadius:12 }}>
        <Text style={{ color:'#fff' }}>Log a Meal</Text>
      </Pressable>

      <Pressable onPress={()=>navigation.navigate('WorkoutHistory')} style={{ padding:16, backgroundColor:'#111', borderRadius:12 }}>
        <Text style={{ color:'#fff' }}>Workout History {isAllowed(plan,'history.unlimited')? '':'(last 10)'} </Text>
      </Pressable>

      {!isAllowed(plan,'workouts.unlimited') && (
        <Pressable onPress={()=>navigation.navigate('ProUpsell')} style={{ padding:16, borderWidth:1, borderRadius:12 }}>
          <Text style={{ color:'#fff' }}>Go Pro for unlimited sessions</Text>
        </Pressable>
      )}
    </View>
  );
}