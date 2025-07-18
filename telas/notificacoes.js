import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Image,
  StyleSheet, ActivityIndicator, Alert, Keyboard, SafeAreaView, ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_KEY = '6873e62710ee00a679445c6e0c5656f7570db2473835f2771e516a300c820c45';
const BASE_URL = 'https://apiv2.allsportsapi.com/football/';

export default function Notificacoes({ navigation }) {
  const [search, setSearch] = useState('');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [user, setUser] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    async function carregarUser() {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const userObj = JSON.parse(userData);
        setUser(userObj);

        if (userObj.favorito) {
          const favArray = Array.isArray(userObj.favorito)
            ? userObj.favorito
            : [userObj.favorito];

          const favObj = {};
          favArray.forEach((id) => {
            favObj[id] = true;
          });
          setFavorites(favObj);
        }
      }
    }
    carregarUser();
  }, []);

  async function buscarTimesPorNome(nome) {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Digite o nome de um time para buscar.');
      return;
    }

    setLoading(true);
    setTeams([]);
    setSelectedTeam(null);
    Keyboard.dismiss();

    try {
      const res = await axios.get(BASE_URL, {
        params: {
          met: 'Teams',
          teamName: nome.trim(),
          APIkey: API_KEY,
        },
      });

      const json = res.data;

      if (json.result && json.result.length > 0) {
        const filtrados = json.result.filter(
          (item) => !/U\d+|W|Sub/i.test(item.team_name)
        );

        const nomesUnicos = new Set();
        const final = [];
        filtrados.forEach((item) => {
          const nomeBase = item.team_name.toLowerCase().trim();
          if (!nomesUnicos.has(nomeBase)) {
            nomesUnicos.add(nomeBase);
            final.push(item);
          }
        });

        if (final.length > 0) {
          setTeams(final);
        } else {
          Alert.alert('Nenhum time válido encontrado.');
        }
      } else {
        Alert.alert('Nenhum time encontrado', `Nenhum time com "${nome}" foi encontrado.`);
      }
    } catch (e) {
      console.log('Erro ao buscar time:', e);
      Alert.alert('Erro', 'Erro ao buscar times: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function buscarDetalhesDoTime(teamObj) {
    setLoading(true);
    setSelectedTeam(null);
    try {
      const [res1, res2] = await Promise.all([
        axios.get(BASE_URL, {
          params: {
            met: 'Teams',
            teamId: teamObj.team_key,
            APIkey: API_KEY,
          },
        }),
        axios.get(BASE_URL, {
          params: {
            met: 'Fixtures',
            teamId: teamObj.team_key,
            APIkey: API_KEY,
          },
        }),
      ]);

      setSelectedTeam({
        ...teamObj,
        leagues: res1.data.result || [],
        fixtures: res2.data.result?.slice(0, 5) || [],
      });
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do time.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(id) {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para favoritar um time.');
      return;
    }

    const isFavorito = favorites[id];
    const novosFavoritos = { ...favorites };

    if (isFavorito) {
      delete novosFavoritos[id]; // remove favorito
    } else {
      novosFavoritos[id] = true; // adiciona favorito
    }

    setFavorites(novosFavoritos);

    try {
      const res = await axios.get(`http://localhost:3000/users?email=${user.email}`);
      const userData = res.data[0];

      if (!userData) {
        Alert.alert('Erro', 'Usuário não encontrado no servidor');
        return;
      }

      const favoritosArray = Object.keys(novosFavoritos);

      await axios.patch(`http://localhost:3000/users/${userData.id}`, {
        favorito: favoritosArray,
      });

      const novoUserData = { ...user, favorito: favoritosArray };
      setUser(novoUserData);
      await AsyncStorage.setItem('userData', JSON.stringify(novoUserData));

      Alert.alert('Sucesso', isFavorito ? 'Removido dos favoritos!' : 'Time favoritado!');
    } catch (error) {
      console.log('Erro ao atualizar favoritos:', error);
      Alert.alert('Erro', 'Erro ao atualizar os favoritos.');
    }
  }

  function renderTeamItem({ item }) {
    const id = item.team_key;
    return (
      <TouchableOpacity style={styles.teamItem} onPress={() => buscarDetalhesDoTime(item)}>
        <Image source={{ uri: item.team_logo }} style={styles.teamLogoSmall} />
        <Text style={styles.teamName}>{item.team_name}</Text>
        <TouchableOpacity onPress={() => toggleFavorite(id)}>
          <Ionicons
            name={favorites[id] ? 'star' : 'star-outline'}
            size={24}
            color={favorites[id] ? 'gold' : '#ccc'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Topo com botão de voltar e logo */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>

          <Image source={require('../assets/logo.png')} style={styles.logo} />

          <View style={{ width: 24 }} /> {/* espaço vazio para alinhar */}
        </View>

        <Text style={styles.title}>Buscar times</Text>

        <View style={styles.searchContainer}>
          <TextInput
            ref={searchInputRef}
            placeholder="Digite o nome do time"
            placeholderTextColor="#aaa"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => buscarTimesPorNome(search)}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={() => buscarTimesPorNome(search)} style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <FlatList
            data={teams}
            keyExtractor={(item) => item.team_key.toString()}
            renderItem={renderTeamItem}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 120 }}
            style={{ marginTop: 10 }}
          />
        )}

        {selectedTeam && (
          <ScrollView style={styles.selectedTeamContainer}>
            <Text style={styles.subtitle}>{selectedTeam.team_name}</Text>
            <Image source={{ uri: selectedTeam.team_logo }} style={styles.escudo} />
            <Text style={styles.text}>País: {selectedTeam.team_country}</Text>
            <Text style={styles.text}>Fundado: {selectedTeam.team_founded || 'Desconhecido'}</Text>
            <Text style={styles.text}>Estádio: {selectedTeam.venue?.name || 'Não informado'}</Text>

            <TouchableOpacity
              onPress={() => toggleFavorite(selectedTeam.team_key)}
              style={styles.favoriteButton}
            >
              <Ionicons
                name={favorites[selectedTeam.team_key] ? 'star' : 'star-outline'}
                size={24}
                color="gold"
              />
              <Text style={{ color: 'gold', marginLeft: 5 }}>
                {favorites[selectedTeam.team_key] ? 'Desfavoritar' : 'Favoritar'}
              </Text>
            </TouchableOpacity>

            {selectedTeam.leagues?.length > 0 && (
              <>
                <Text style={styles.section}>🏆 Competições:</Text>
                {selectedTeam.leagues.map((l, index) => (
                  <Text key={index} style={styles.text}>
                    • {l.league_name} ({l.country_name})
                  </Text>
                ))}
              </>
            )}

            {selectedTeam.fixtures?.length > 0 && (
              <>
                <Text style={styles.section}>📅 Próximos jogos:</Text>
                {selectedTeam.fixtures.map((f, index) => (
                  <Text key={index} style={styles.text}>
                    {f.homeTeam} x {f.awayTeam} - {f.fixture_date?.slice(0, 10)}
                  </Text>
                ))}
              </>
            )}
          </ScrollView>
        )}
      </View>

      {/* Botão de ir para favoritos */}
      {Object.keys(favorites).length > 0 && (
        <TouchableOpacity
          style={styles.fullButton}
          onPress={() => navigation.navigate('Favoritos')}
        >
          <Text style={styles.fullButtonText}>⭐ Ver Times Favoritos</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, padding: 15, paddingBottom: 80 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    minHeight: 50,
  },
  backButton: { paddingRight: 10 },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    position: 'absolute',
    left: '50%',
    marginLeft: -25,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchContainer: { flexDirection: 'row', marginBottom: 10 },
  searchInput: {
    flex: 1,
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#555',
    marginLeft: 8,
    borderRadius: 8,
  },
  teamItem: {
    flexDirection: 'row',
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'red',
  },
  teamLogoSmall: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 15,
  },
  teamName: { flex: 1, color: '#fff', fontSize: 16 },
  selectedTeamContainer: {
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    maxHeight: 300,
  },
  escudo: {
    width: 70,
    height: 90,
    resizeMode: 'contain',
    marginVertical: 10,
    alignSelf: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  text: { color: '#fff', fontSize: 14, marginBottom: 5, textAlign: 'center' },
  section: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  favoriteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#333',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  fullButton: {
    backgroundColor: '#444',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    zIndex: 2,
  },
  fullButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

