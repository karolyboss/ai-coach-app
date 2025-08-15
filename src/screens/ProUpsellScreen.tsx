import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useEntitlements } from '../modules/entitlements/EntitlementsProvider';

export default function ProUpsell(){
  const { unlockProDev, resetToFreeDev } = useEntitlements();
  return (
    <View style={{ flex:1, padding:20, backgroundColor:'#000' }}>
      <Text style={{ color:'#fff', fontSize:24, fontWeight:'800', marginTop:8 }}>Go Pro</Text>
      <Text style={{ color:'#bbb', marginTop:8 }}>Unlock:</Text>
      <Text style={{ color:'#ddd', marginTop:6 }}>• Unlimited workouts per day</Text>
      <Text style={{ color:'#ddd', marginTop:4 }}>• Full workout history</Text>
      <Text style={{ color:'#ddd', marginTop:4 }}>• Voice coaching & haptics</Text>
      <Text style={{ color:'#ddd', marginTop:4 }}>• Posture programs</Text>

      <View style={{ marginTop:24, gap:12 }}>
        <Pressable onPress={unlockProDev} style={{ backgroundColor:'#11a36c', padding:14, borderRadius:12 }}>
          <Text style={{ color:'#fff', fontWeight:'700', textAlign:'center' }}>Unlock Pro (dev)</Text>
        </Pressable>
        <Pressable onPress={resetToFreeDev} style={{ borderColor:'#333', borderWidth:1, padding:12, borderRadius:12 }}>
          <Text style={{ color:'#ddd', textAlign:'center' }}>Back to Free (dev)</Text>
        </Pressable>
      </View>

      <Text style={{ color:'#555', fontSize:12, marginTop:14 }}>Note: In production this will use Play Billing / App Store purchases.</Text>
    </View>
  );
}