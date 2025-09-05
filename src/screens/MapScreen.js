// src/screens/MapScreen.js

import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { initializeDatabase, searchLocationsByName } from "../database/queries";

// Coordenadas da UFPA para referência
const ufpaCoordinates = {
  latitude: -1.475640,
  longitude: -48.457319,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function MapScreen() {
  const [region, setRegion] = useState(ufpaCoordinates);
  const [userLocation, setUserLocation] = useState(null);
  
  const [busca, setBusca] = useState("");
  const [locais, setLocais] = useState([]);

  // Efeito para inicializar o banco e buscar a localização do usuário
  useEffect(() => {
    // 1. Inicializa e carrega os dados do Realm
    initializeDatabase();
    handleSearch(); // Carrega todos os locais na primeira vez

    // 2. Pede permissão e busca a localização do usuário
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permissão de localização negada");
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        const userCoords = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };
        setUserLocation(userCoords);
        setRegion({ ...userCoords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      } catch (error) {
        console.error("Erro ao obter localização: ", error);
      }
    })();
  }, []);

  // Função para lidar com a busca
  const handleSearch = () => {
    const results = searchLocationsByName(busca);
    setLocais([...results]); // Converte a coleção do Realm para um array
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Digite o nome do local..."
          value={busca}
          onChangeText={setBusca}
        />
        <Button title="Buscar" onPress={handleSearch} />
      </View>

      <MapView
        style={styles.map}
        initialRegion={ufpaCoordinates}
        region={region}
        showsUserLocation={true}
      >
        {/* Marcadores dos locais da busca */}
        {locais.map((local) =>
            local.latitude && local.longitude && (
              <Marker
                key={local.id}
                coordinate={{
                  latitude: parseFloat(local.latitude),
                  longitude: parseFloat(local.longitude),
                }}
                title={local.nome}
                pinColor="red"
              />
            )
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchBox: {
    position: "absolute",
    top: 50,
    left: 10,
    right: 10,
    zIndex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    marginRight: 5,
  },
});