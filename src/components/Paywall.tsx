import React from 'react';
import { View, Text, Pressable } from 'react-native';
export default function Paywall({ onClose, onBuy }: { onClose: ()=>void; onBuy: ()=>void; }){
  return (
    <View style={{ padding:20 }}>
      <Text style={{ fontSize:22, fontWeight:'700', marginBottom:8 }}>Go Pro</Text>
      <Text>Unlimited workouts & posture scans, advanced insights, AR portions.</Text>
      <Pressable onPress={onBuy} style={{ marginTop:16, padding:16, backgroundColor:'#111', borderRadius:12 }}>
        <Text style={{ color:'#fff' }}>Start Pro (€7.99/mo)</Text>
      </Pressable>
      <Pressable onPress={onClose} style={{ marginTop:12 }}>
        <Text>Maybe later</Text>
      </Pressable>
    </View>
  );
}
