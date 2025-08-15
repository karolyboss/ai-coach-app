import React from 'react';
import { View, Text } from 'react-native';
import Coach3D from '../modules/coach3d/Coach3D';
import { useCoachController } from '../modules/coach3d/useCoachController';
export default function Session3DScreen(){
  const coach = useCoachController();
  const clipToSrc: Record<string, any> = {
    squat_perfect: require('../assets/coach/animations/squat_perfect.glb'),
    squat_knee_valgus: require('../assets/coach/animations/squat_knee_valgus.glb'),
  };
  return (
    <View style={{ flex:1, backgroundColor:'#000' }}>
      <View style={{ position:'absolute', right: 12, bottom: 12, width: 220, height: 280, borderRadius: 16, overflow:'hidden' }}>
        <Coach3D
          avatarSrc={require('../assets/coach/avatars/coach_f.glb')}
          clipSrc={clipToSrc[coach.clip]}
          speed={coach.speed}
          mirror={coach.mirror}
        />
      </View>
      <View style={{ position:'absolute', top: 50, left: 20 }}>
        <Text style={{ color:'#fff' }}>Session (demo)</Text>
      </View>
    </View>
  );
}
