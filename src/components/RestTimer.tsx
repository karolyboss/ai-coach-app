import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';

type Props = { seconds: number; onDone: () => void; onSkip?: () => void };
export default function RestTimer({ seconds, onDone, onSkip }: Props){
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    const id = setInterval(() => setLeft((x)=>{
      if (x <= 1) { clearInterval(id); onDone(); return 0; }
      return x - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  return (
    <View style={{ position:'absolute', left:0, right:0, bottom:0, padding:20, backgroundColor:'#000000CC' }}>
      <Text style={{ color:'#fff', fontSize:18, fontWeight:'700', textAlign:'center' }}>Rest {left}s</Text>
      {onSkip && (
        <Pressable onPress={onSkip} style={{ marginTop:12, alignSelf:'center', paddingVertical:8, paddingHorizontal:14, borderRadius:8, borderWidth:1, borderColor:'#fff' }}>
          <Text style={{ color:'#fff' }}>Skip</Text>
        </Pressable>
      )}
    </View>
  );
}