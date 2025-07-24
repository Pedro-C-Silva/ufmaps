import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const ufpaCoordinates = {
  latitude: -1.4756406985055783,
  longitude: -48.45731971263614,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function App() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const mapRef = useRef(null); // Ref para o mapa

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada');
        setRegion(ufpaCoordinates);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (newLocation) => {
            setLocation(newLocation);
          }
        );
      } catch (error) {
        console.error('Erro ao obter localização: ', error);
        setErrorMsg('Erro ao obter localização. Mostrando localização padrão.');
        setRegion(ufpaCoordinates);
      }
    })();
  }, []);

  const centralizarNoUsuario = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header com busca */}
      <View style={styles.header}>
        <Ionicons name="search" size={20} color="#fff" />
        <TextInput
          placeholder="Pesquise aqui"
          placeholderTextColor="#ccc"
          style={styles.searchInput}
        />
      </View>

      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {['Pavilhões', 'Laboratórios', 'Bibliotecas', 'Cantinas'].map((item, index) => (
          <TouchableOpacity key={index} style={styles.filterButton}>
            <Text style={styles.filterText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Mapa */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region || ufpaCoordinates}
        showsUserLocation={true}
      >
        <Marker
          coordinate={ufpaCoordinates}
          title="UFPA"
          description="Campus Belém"
          pinColor="green"
        />
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Você está aqui"
            pinColor="blue"
          />
        )}
      </MapView>

      {/* Botão de centralizar */}
      <TouchableOpacity style={styles.centerButton} onPress={centralizarNoUsuario}>
        <Ionicons name="locate" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="compass" size={20} color="#fff" />
          <Text style={styles.footerText}>Explorar</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="bookmark" size={20} color="#fff" />
          <Text style={styles.footerText}>Salvos</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.footerText}>Contribuir</Text>
        </View>
      </View>

      {/* Mensagem de carregamento */}
      {!region && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{errorMsg || 'Obtendo localização...'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 30,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#333',
    marginLeft: 8,
    padding: 6,
    borderRadius: 8,
    color: '#fff',
  },
  filters: {
    flexGrow: 0,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#1E1E1E',
  },
  filterButton: {
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: { color: '#fff', fontSize: 14 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 180,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1E1E1E',
    paddingVertical: 10,
  },
  footerItem: { alignItems: 'center' },
  footerText: { color: '#fff', fontSize: 12, marginTop: 2 },
  loadingContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  loadingText: {
    color: '#fff', fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10, borderRadius: 8,
  },
  centerButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    zIndex: 999,
  },
});

