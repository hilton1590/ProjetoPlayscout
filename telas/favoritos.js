import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_KEY = '6873e62710ee00a679445c6e0c5656f7570db2473835f2771e516a300c820c45';
const BASE_URL = 'https://apiv2.allsportsapi.com/football/';

export default function TimesFavoritos({ navigation }) {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlayers, setShowPlayers] = useState({}); // chave por time
  const [showCoaches, setShowCoaches] = useState({}); // chave por time

  async function carregarTimesFavoritos() {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        setFavoritos([]);
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const favoritosArray = Array.isArray(user.favorito)
        ? user.favorito
        : user.favorito ? [user.favorito] : [];

      if (favoritosArray.length === 0) {
        setFavoritos([]);
        setLoading(false);
        return;
      }

      // Buscar dados completos de todos os favoritos em paralelo
      const requests = favoritosArray.map((teamId) =>
        axios.get(BASE_URL, {
          params: {
            met: 'Teams',
            teamId: teamId,
            APIkey: API_KEY,
          },
        })
      );

      const responses = await Promise.all(requests);

      const times = responses
        .map((res) => (res.data.result && res.data.result.length > 0 ? res.data.result[0] : null))
        .filter(Boolean);

      setFavoritos(times);
    } catch (error) {
      console.log('Erro ao carregar favoritos:', error);
      Alert.alert('Erro', 'Erro ao carregar times favoritos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarTimesFavoritos);
    return unsubscribe;
  }, [navigation]);

  async function removerFavorito(teamId) {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) return;

      const user = JSON.parse(userData);

      let favoritosArray = Array.isArray(user.favorito)
        ? user.favorito
        : user.favorito ? [user.favorito] : [];

      favoritosArray = favoritosArray.filter((id) => id !== teamId);

      await axios.patch(`http://localhost:3000/users/${user.id}`, {
        favorito: favoritosArray,
      });

      const novoUser = { ...user, favorito: favoritosArray };
      await AsyncStorage.setItem('userData', JSON.stringify(novoUser));

      setFavoritos((prev) => prev.filter((t) => t.team_key !== teamId));
      Alert.alert('Sucesso', 'Time removido dos favoritos!');
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Não foi possível remover o favorito.');
    }
  }

  function toggleShowPlayers(teamKey) {
    setShowPlayers((prev) => ({ ...prev, [teamKey]: !prev[teamKey] }));
  }

  function toggleShowCoaches(teamKey) {
    setShowCoaches((prev) => ({ ...prev, [teamKey]: !prev[teamKey] }));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Favoritos</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView>
          <Text style={styles.title}>⭐ Seus Times Favoritos</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
          ) : favoritos.length === 0 ? (
            <Text style={styles.text}>Nenhum time favoritado ainda.</Text>
          ) : (
            favoritos.map((time) => (
              <View key={time.team_key} style={styles.card}>
                <Image source={{ uri: time.team_logo }} style={styles.logo} />
                <Text style={styles.name}>{time.team_name}</Text>

                <TouchableOpacity
                  style={styles.menuHeader}
                  onPress={() => toggleShowPlayers(time.team_key)}
                >
                  <Text style={styles.section}>
                    👥 Jogadores {showPlayers[time.team_key] ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
                {showPlayers[time.team_key] &&
                  time.players?.map((player, index) => (
                    <Text key={index} style={styles.text}>
                      {player.player_name} - {player.player_type}
                    </Text>
                  ))}

                <TouchableOpacity
                  style={styles.menuHeader}
                  onPress={() => toggleShowCoaches(time.team_key)}
                >
                  <Text style={styles.section}>
                    🧠 Técnicos {showCoaches[time.team_key] ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
                {showCoaches[time.team_key] &&
                  time.coaches?.map((coach, index) => (
                    <Text key={index} style={styles.text}>
                      {coach.coach_name}
                    </Text>
                  ))}

                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => removerFavorito(time.team_key)}
                >
                  <Ionicons name="star" size={24} color="gold" />
                  <Text style={styles.btnText}>Remover dos favoritos</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    padding: 15,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  menuHeader: {
    marginTop: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 5,
  },
  card: {
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  btn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
  },
  btnText: {
    color: 'gold',
    marginLeft: 8,
    fontWeight: 'bold',
  },
});
