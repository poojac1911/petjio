// App.js

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import uuid from 'react-native-uuid';

const STORAGE_KEY = '@petjio_pets_v1';

function PetListScreen({ navigation }) {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // reload happens in parent via AsyncStorage effect in App container, but keep it safe
      loadPets();
    });
    loadPets();
    return unsubscribe;
  }, [navigation]);

  async function loadPets() {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const list = json ? JSON.parse(json) : [];
      setPets(list);
    } catch (e) {
      console.warn('Failed to load pets', e);
    }
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No pets added yet. Tap "+ Add Pet" to create one.</Text>
      </View>
    );
  }

  function renderItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Details', { petId: item.id })}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.petName}>{item.name}</Text>
            <Text style={styles.petType}>{item.type}{item.age ? ` • ${item.age} yr` : ''}</Text>
          </View>
          <View>
            {item.favorite ? <Text style={styles.favoriteBadge}>★ Favorite</Text> : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>PetJio — My Pets</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddPet')}>
          <Text style={styles.addButtonText}>+ Add Pet</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={pets.length === 0 && { flex: 1 }}
        data={pets}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}

function AddPetScreen({ navigation }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [age, setAge] = useState('');
  const [breed, setBreed] = useState('');
  const [saving, setSaving] = useState(false);

  async function savePet() {
    // validation
    if (!name.trim()) {
      Alert.alert('Validation', 'Pet Name is required');
      return;
    }
    if (!type.trim()) {
      Alert.alert('Validation', 'Pet Type is required');
      return;
    }

    setSaving(true);
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const list = json ? JSON.parse(json) : [];
      const newPet = {
        id: uuid.v4(),
        name: name.trim(),
        type: type.trim(),
        age: age ? Number(age) : null,
        breed: breed ? breed.trim() : null,
        favorite: false,
        createdAt: new Date().toISOString(),
      };
      const updated = [newPet, ...list];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSaving(false);
      navigation.goBack();
    } catch (e) {
      console.warn('Failed to save pet', e);
      setSaving(false);
      Alert.alert('Error', 'Failed to save pet. Try again.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.form}>
          <Text style={styles.label}>Pet Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Buddy"
            style={styles.input}
            accessibilityLabel="Pet Name"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Pet Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={type}
              onValueChange={(val) => setType(val)}
              accessibilityLabel="Pet Type picker"
            >
              <Picker.Item label="Select type" value="" />
              <Picker.Item label="Dog" value="Dog" />
              <Picker.Item label="Cat" value="Cat" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>Age (years)</Text>
          <TextInput
            value={age}
            onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
            placeholder="e.g. 3"
            keyboardType="number-pad"
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Breed (optional)</Text>
          <TextInput
            value={breed}
            onChangeText={setBreed}
            placeholder="e.g. Labrador"
            style={styles.input}
          />

          <TouchableOpacity style={styles.saveButton} onPress={savePet} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Pet'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PetDetailsScreen({ route, navigation }) {
  const { petId } = route.params;
  const [pet, setPet] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPet();
    });
    loadPet();
    return unsubscribe;
  }, [navigation]);

  async function loadPet() {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const list = json ? JSON.parse(json) : [];
      const found = list.find((p) => p.id === petId) || null;
      setPet(found);
    } catch (e) {
      console.warn('Failed to load pet', e);
    }
  }

  async function toggleFavorite() {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const list = json ? JSON.parse(json) : [];
      const updated = list.map((p) => {
        if (p.id === petId) {
          return { ...p, favorite: !p.favorite };
        }
        return p;
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setPet((prev) => (prev ? { ...prev, favorite: !prev.favorite } : prev));
    } catch (e) {
      console.warn('Failed to toggle favorite', e);
      Alert.alert('Error', 'Could not update favorite.');
    }
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <Text style={styles.emptyText}>Pet not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.detailsCard}>
        <Text style={styles.detailLabel}>Name</Text>
        <Text style={styles.detailValue}>{pet.name}</Text>

        <Text style={styles.detailLabel}>Type</Text>
        <Text style={styles.detailValue}>{pet.type}</Text>

        <Text style={styles.detailLabel}>Age</Text>
        <Text style={styles.detailValue}>{pet.age ?? '—'}</Text>

        <Text style={styles.detailLabel}>Breed</Text>
        <Text style={styles.detailValue}>{pet.breed ?? '—'}</Text>

        <Text style={styles.detailLabel}>Added</Text>
        <Text style={styles.detailValue}>{new Date(pet.createdAt).toLocaleString()}</Text>

        <TouchableOpacity style={styles.favoriteToggle} onPress={toggleFavorite}>
          <Text style={styles.favoriteToggleText}>{pet.favorite ? '★ Unmark Favorite' : '☆ Mark Favorite'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

//const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         <Stack.Screen name="Home" component={PetListScreen} options={{ headerShown: false }} />
//         <Stack.Screen name="AddPet" component={AddPetScreen} options={{ title: 'Add Pet' }} />
//         <Stack.Screen name="Details" component={PetDetailsScreen} options={{ title: 'Pet Details' }} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9fafb',
//     padding: 16,
//   },
//   containerCentered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#f9fafb',
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: '700',
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   addButton: {
//     backgroundColor: '#0f172a',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//   },
//   addButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   card: {
//     backgroundColor: '#fff',
//     padding: 14,
//     borderRadius: 10,
//     marginBottom: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.04,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   petName: { fontSize: 18, fontWeight: '600' },
//   petType: { fontSize: 13, color: '#475569', marginTop: 4 },
//   favoriteBadge: { color: '#b45309', fontWeight: '700' },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   emptyText: { color: '#64748b', fontSize: 16, textAlign: 'center' },
//   form: { marginTop: 8 },
//   label: { fontSize: 13, color: '#334155', marginBottom: 6 },
//   input: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   pickerContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   saveButton: {
//     marginTop: 20,
//     backgroundColor: '#0f172a',
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   saveButtonText: { color: '#fff', fontWeight: '700' },
//   detailsCard: {
//     backgroundColor: '#fff',
//     padding: 18,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.04,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   detailLabel: { marginTop: 10, color: '#64748b', fontSize: 12 },
//   detailValue: { fontSize: 16, fontWeight: '600' },
//   favoriteToggle: {
//     marginTop: 18,
//     paddingVertical: 12,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     alignItems: 'center',
//   },
//   favoriteToggleText: { fontSize: 16, fontWeight: '700' },
// });
