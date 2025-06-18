import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

// Coordenadas da UFPA para fácil referência
const ufpaCoordinates = {
  latitude: -1.4756406985055783,
  longitude: -48.45731971263614, // Corrigido: apenas um sinal de menos
  latitudeDelta: 0.02, // Ajuste o delta conforme necessário para o zoom inicial
  longitudeDelta: 0.02,
};

export default function App() {
  const [location, setLocation] = useState(null);
  // Iniciamos 'region' com as coordenadas da UFPA ou null se preferir que comece sem foco até obter a localização.
  // Usar as coordenadas da UFPA para initialRegion no MapView é uma boa abordagem.
  // O estado 'region' será atualizado assim que a localização do usuário for obtida.
  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada');
        // Se a permissão for negada, podemos definir a região para UFPA como fallback
        setRegion(ufpaCoordinates);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        const userRegion = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01, // Zoom mais próximo para a localização do usuário
          longitudeDelta: 0.01,
        };
        setRegion(userRegion);

        Location.watchPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // 1 segundo
          distanceInterval: 1, // 1 metro
        }, (newLocation) => {
          setLocation(newLocation);
          // Atualiza a região para centralizar no usuário conforme ele se move
          // Se você não quiser que o mapa siga o usuário automaticamente, pode comentar a linha setRegion abaixo.
          setRegion({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.01, // Mantém o nível de zoom
            longitudeDelta: 0.01,
          });
        });

      } catch (error) {
        console.error("Erro ao obter localização: ", error);
        setErrorMsg('Erro ao obter localização. Mostrando localização padrão.');
        setRegion(ufpaCoordinates); // Define para UFPA em caso de erro
      }
    })();
  }, []);

  let displayText = 'Obtendo localização e carregando mapa...';
  if (errorMsg) {
    displayText = errorMsg;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        // Define uma região inicial. O mapa tentará mostrar isso primeiro.
        // Assim que 'region' no estado for atualizado com a localização do usuário,
        // o atributo 'region' abaixo (se descomentado e usado) assumirá o controle.
        initialRegion={ufpaCoordinates}
        // Se você quiser que o mapa se mova dinamicamente com 'region' do estado:
        region={region} // Se 'region' for null inicialmente, pode causar um flash. initialRegion lida com isso.
        showsUserLocation={true} // Mostra o ponto azul padrão para a localização do usuário
      >
        {/* Marcador da UFPA */}
        <Marker
          coordinate={{
            latitude: ufpaCoordinates.latitude,
            longitude: ufpaCoordinates.longitude,
          }}
          title="UFPA"
          description="Campus Belém"
          pinColor="green" // Diferenciar o marcador da UFPA
        />

        {/* Marcador para a localização do usuário (opcional, pois showsUserLocation já faz algo similar) */}
        {/* Se você quiser um marcador personalizado para o usuário, pode usar este */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Você está aqui"
            pinColor="blue" // Cor para o marcador do usuário
          />
        )}
      </MapView>
      {/* Exibe mensagem de carregamento/erro sobre o mapa, se necessário, ou em um local dedicado */}
      {!region && ( // Mostra o texto apenas se a região ainda não foi definida (nem pelo usuário, nem pelo fallback)
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{displayText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  // Estilo opcional para a mensagem de carregamento/erro
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', // Fundo semi-transparente
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
  }
});