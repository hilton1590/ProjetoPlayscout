import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

export default function MenuPrincipal() {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatch() {
      try {
        const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
          headers: {
            'x-apisports-key': 'c33f4c4af00048fc32af1f462e2cb0ba',
          },
          params: {
            league: 39, // Premier League
            season: 2024,
            next: 1,
          },
        });

        const data = response.data.response[0];
        setMatch(data);
      } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMatch();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#333" style={{ marginLeft: 10 }} />
          <TextInput placeholder="Buscar..." placeholderTextColor="#666" style={styles.input} />
        </View>

        <Text style={styles.title}>Principais notícias</Text>

        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>
            Ancelotti faz mistério sobre seleção, mas Real já planeja futuro sem ele.
          </Text>
          <Image source={require('../assets/ancelotti.jpg')} style={styles.image} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : match ? (
          <View style={styles.matchCard}>
            <Text style={styles.matchTitle}>
              {match.league.name} - {match.league.round}
            </Text>
            <Text style={styles.matchSub}>
              {match.teams.home.name} x {match.teams.away.name}
            </Text>
            <Text style={styles.broadcastIcon}>📡 📡</Text>

            <View style={styles.scoreRow}>
              <View style={styles.teamBox}>
                <Image source={{ uri: match.teams.home.logo }} style={styles.teamLogo} />
                <Text style={styles.teamName}>{match.teams.home.name}</Text>
              </View>

              <Text style={styles.score}>
                {match.goals.home} - {match.goals.away}
              </Text>

              <View style={styles.teamBox}>
                <Image source={{ uri: match.teams.away.logo }} style={styles.teamLogo} />
                <Text style={styles.teamNameRight}>{match.teams.away.name}</Text>
              </View>
            </View>

            <Text style={styles.matchTime}>
              {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>

            <TouchableOpacity>
              <Text style={styles.detailsLink}>Detalhes do Jogo e análise ao vivo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={{ color: '#fff', textAlign: 'center' }}>Nenhum jogo encontrado.</Text>
        )}
      </ScrollView>

      <View style={styles.navbar}>
        <FontAwesome5 name="calendar-alt" size={22} color="#fff" />
        <Ionicons name="trophy" size={22} color="#fff" />
        <Ionicons name="notifications" size={22} color="#fff" />
        <MaterialIcons name="bar-chart" size={22} color="#fff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    height: 35,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#000',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 10,
  },
  newsCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  newsTitle: {
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  matchCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  matchTitle: {
    fontSize: 12,
    color: '#333',
  },
  matchSub: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  broadcastIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamBox: {
    alignItems: 'center',
    width: 80,
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 2,
    resizeMode: 'contain',
  },
  teamName: {
    color: '#3949ab',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  teamNameRight: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  matchTime: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  detailsLink: {
    color: '#1565c0',
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#444',
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});
