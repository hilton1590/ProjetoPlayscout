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
  const [favorito, setFavorito] = useState(null);
  const [time, setTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPlayers, setShowPlayers] = useState(false); // controla menu jogadores
  const [showCoaches, setShowCoaches] = useState(false); // controla menu técnicos (opcional)

  async function carregarTimeFavorito() {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const teamId = user.favorito;
        setFavorito(teamId);

        if (teamId) {
          const res = await axios.get(BASE_URL, {
            params: {
              met: 'Teams',
              teamId: teamId,
              APIkey: API_KEY,
            },
          });

          console.log('DADOS DO TIME:', res.data.result[0]);

          if (res.data.result && res.data.result.length > 0) {
            setTime(res.data.result[0]);
          } else {
            setTime(null);
          }
        } else {
          setTime(null);
        }
      }
    } catch (error) {
      console.log('Erro ao carregar:', error);
      Alert.alert('Erro', 'Erro ao carregar time favorito.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarTimeFavorito);
    return unsubscribe;
  }, [navigation]);

  async function removerFavorito() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) return;

      const user = JSON.parse(userData);

      await axios.patch(`http://localhost:3000/users/${user.id}`, {
        favorito: '',
      });

      const novoUser = { ...user, favorito: '' };
      await AsyncStorage.setItem('userData', JSON.stringify(novoUser));

      setFavorito(null);
      setTime(null);
      Alert.alert('Sucesso', 'Time removido dos favoritos!');
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Não foi possível remover o favorito.');
    }
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

          <Text style={styles.headerTitle}>Favorito</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView>
          <Text style={styles.title}>⭐ Seu Time Favorito</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
          ) : !time ? (
            <Text style={styles.text}>Nenhum time favoritado ainda.</Text>
          ) : (
            <View style={styles.card}>
              <Image source={{ uri: time.team_logo }} style={styles.logo} />
              <Text style={styles.name}>{time.team_name}</Text>

              {/* Menu jogadores */}
              <TouchableOpacity
                style={styles.menuHeader}
                onPress={() => setShowPlayers(!showPlayers)}
              >
                <Text style={styles.section}>👥 Jogadores {showPlayers ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showPlayers &&
                time.players?.map((player, index) => (
                  <Text key={index} style={styles.text}>
                    {player.player_name} - {player.player_type}
                  </Text>
                ))}

              {/* Menu técnicos */}
              <TouchableOpacity
                style={styles.menuHeader}
                onPress={() => setShowCoaches(!showCoaches)}
              >
                <Text style={styles.section}>🧠 Técnicos {showCoaches ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showCoaches &&
                time.coaches?.map((coach, index) => (
                  <Text key={index} style={styles.text}>
                    {coach.coach_name}
                  </Text>
                ))}

              <TouchableOpacity style={styles.btn} onPress={removerFavorito}>
                <Ionicons name="star" size={24} color="gold" />
                <Text style={styles.btnText}>Remover dos favoritos</Text>
              </TouchableOpacity>
            </View>
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
