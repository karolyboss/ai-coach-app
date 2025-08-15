import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Pressable, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Very small in-memory food DB (per 100g)
const FOOD_DB: Record<string, { kcal: number; protein: number; carbs: number; fat: number }>= {
  'Chicken Breast': { kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  'Rice (cooked)': { kcal: 130, protein: 2.4, carbs: 28, fat: 0.3 },
  'Broccoli': { kcal: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  'Salmon': { kcal: 208, protein: 20, carbs: 0, fat: 13 },
  'Avocado': { kcal: 160, protein: 2, carbs: 9, fat: 15 },
};

type Item = {
  id: string;
  name: string;
  grams: number; // editable grams
};

export default function LogMealScreen(){
  const [uri, setUri] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');
  const matches = useMemo(() => Object.keys(FOOD_DB).filter(n=> n.toLowerCase().includes(query.toLowerCase())), [query]);

  const analyzeStub = async (photoUri: string): Promise<Item[]> => {
    // 🧪 Stub detections: return a few typical foods
    return [
      { id: 'chicken', name: 'Chicken Breast', grams: 150 },
      { id: 'rice', name: 'Rice (cooked)', grams: 200 },
      { id: 'broc', name: 'Broccoli', grams: 80 },
    ];
  };

  const pickFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, selectionLimit: 1, quality: 0.9 });
    if (!res.canceled) {
      const chosen = res.assets[0];
      setUri(chosen.uri);
      const detected = await analyzeStub(chosen.uri);
      setItems(detected);
    }
  };

  const updateGrams = (id: string, g: string) => {
    const grams = Math.max(0, Number(g.replace(/[^0-9.]/g,'')) || 0);
    setItems(prev => prev.map(it => it.id===id? { ...it, grams } : it));
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(it=>it.id!==id));

  const addItem = (name: string) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + '-' + Math.random().toString(36).slice(2,6);
    setItems(prev => [{ id, name, grams: 100 }, ...prev]);
    setAdding(false);
    setQuery('');
  };

  const totals = useMemo(() => {
    let kcal=0, p=0, c=0, f=0;
    for (const it of items) {
      const facts = FOOD_DB[it.name];
      if (!facts) continue; // unknown items don’t contribute unless in DB
      const factor = it.grams / 100;
      kcal += facts.kcal * factor;
      p += facts.protein * factor;
      c += facts.carbs * factor;
      f += facts.fat * factor;
    }
    return { kcal: Math.round(kcal), p: +(p.toFixed(1)), c: +(c.toFixed(1)), f: +(f.toFixed(1)) };
  }, [items]);

  const saveMeal = () => {
    // For now, just show an alert + console. Later: persist to storage/cloud.
    console.log('Saved meal', { uri, items, totals });
    Alert.alert('Meal saved', `${totals.kcal} kcal • P ${totals.p}g • C ${totals.c}g • F ${totals.f}g`);
  };

  return (
    <View style={{ flex:1, backgroundColor:'#0a0a0a', padding:16, gap:12 }}>
      <Text style={{ color:'#fff', fontSize:20, fontWeight:'700' }}>Log a Meal</Text>

      {/* Pick photo */}
      <Pressable onPress={pickFromGallery} style={{ padding:14, backgroundColor:'#111', borderRadius:12 }}>
        <Text style={{ color:'#fff', textAlign:'center' }}>Pick from Gallery</Text>
      </Pressable>

      {/* Preview */}
      {uri && (
        <Image source={{ uri }} style={{ width:'100%', aspectRatio:1, borderRadius:12, backgroundColor:'#222' }} />
      )}

      {/* Items list */}
      <FlatList
        data={items}
        keyExtractor={(it)=>it.id}
        contentContainerStyle={{ gap:10, paddingBottom:140 }}
        renderItem={({ item }) => (
          <View style={{ padding:12, borderRadius:12, backgroundColor:'#121212', borderColor:'#222', borderWidth:1, gap:8 }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
              <Text style={{ color:'#fff', fontSize:16, fontWeight:'600' }}>{item.name}</Text>
              <Pressable onPress={()=>removeItem(item.id)} style={{ paddingVertical:6, paddingHorizontal:10, backgroundColor:'#2a2a2a', borderRadius:8 }}>
                <Text style={{ color:'#ddd' }}>Remove</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
              <Text style={{ color:'#aaa', width:60 }}>Grams</Text>
              <TextInput
                keyboardType="numeric"
                value={String(item.grams)}
                onChangeText={(t)=>updateGrams(item.id, t)}
                style={{ flex:1, color:'#fff', backgroundColor:'#1b1b1b', padding:10, borderRadius:8 }}
                placeholder="e.g. 150"
                placeholderTextColor="#666"
              />
            </View>
            {FOOD_DB[item.name] ? (
              <Text style={{ color:'#888' }}>* {FOOD_DB[item.name].kcal} kcal / 100g</Text>
            ) : (
              <Text style={{ color:'#cc9' }}>No facts — won’t count until added to DB</Text>
            )}
          </View>
        )}
      />

      {/* Add item panel */}
      {!adding ? (
        <Pressable onPress={()=>setAdding(true)} style={{ position:'absolute', bottom:86, left:16, right:16, padding:16, backgroundColor:'#1a1a1a', borderRadius:12, borderWidth:1, borderColor:'#2a2a2a' }}>
          <Text style={{ color:'#fff', textAlign:'center' }}>+ Add Item</Text>
        </Pressable>
      ) : (
        <View style={{ position:'absolute', bottom:86, left:16, right:16, padding:12, backgroundColor:'#0f0f0f', borderRadius:12, borderWidth:1, borderColor:'#2a2a2a', gap:8 }}>
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search (e.g. Salmon)"
            placeholderTextColor="#666"
            style={{ color:'#fff', backgroundColor:'#1b1b1b', padding:10, borderRadius:8 }}
          />
          <View style={{ maxHeight:160 }}>
            <FlatList
              data={matches}
              keyExtractor={(n)=>n}
              renderItem={({ item: n }) => (
                <Pressable onPress={()=>addItem(n)} style={{ padding:10 }}>
                  <Text style={{ color:'#fff' }}>{n}</Text>
                </Pressable>
              )}
              ListEmptyComponent={<Text style={{ color:'#777', padding:10 }}>No matches in DB</Text>}
            />
          </View>
          <View style={{ flexDirection:'row', gap:10 }}>
            <Pressable onPress={()=>setAdding(false)} style={{ flex:1, padding:12, borderRadius:10, borderWidth:1, borderColor:'#333' }}>
              <Text style={{ color:'#ddd', textAlign:'center' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Totals bar */}
      <View style={{ position:'absolute', bottom:16, left:16, right:16, padding:14, backgroundColor:'#0e0e0e', borderWidth:1, borderColor:'#222', borderRadius:14 }}>
        <Text style={{ color:'#fff', fontSize:16, fontWeight:'700' }}>{totals.kcal} kcal</Text>
        <Text style={{ color:'#bbb' }}>P {totals.p}g • C {totals.c}g • F {totals.f}g</Text>
        <View style={{ flexDirection:'row', gap:10, marginTop:10 }}>
          <Pressable onPress={saveMeal} style={{ flex:1, padding:12, backgroundColor:'#11a36c', borderRadius:10, alignItems:'center' }}>
            <Text style={{ color:'#fff', fontWeight:'700' }}>Save</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
