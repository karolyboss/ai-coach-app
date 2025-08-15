import React from 'react';
import { View, Text, Pressable } from 'react-native';
export default function MealsScreen(){
  return (
    <View style={{ flex:1, padding:20, paddingTop:64 }}>
      <Text style={{ fontSize:22, fontWeight:'700' }}>Meal Capture</Text>
      <Text style={{ marginTop:8 }}>Snap a photo to estimate calories/macros.</Text>
      <Pressable style={{ marginTop:16, padding:16, backgroundColor:'#111', borderRadius:12 }}>
        <Text style={{ color:'#fff' }}>Open Camera</Text>
      </Pressable>
    </View>
  );
}
