import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, FlatList, ActivityIndicator, SafeAreaView,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

const ligas = [
  { label: 'Brasileirão Série A', value: 71 },
  { label: 'Premier League', value: 39 },
  { label: 'La Liga', value: 140 },
  { label: 'Serie A', value: 135 },
  { label: 'Bundesliga', value: 78 },
];

export default function Competicoes() {
  const [selectedLeague, setSelectedLeague] = useState(71);
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStandings = async (leagueId) => {
    setLoading(true);

    // Dados manuais do Brasileirão Série A 2025 (TOP 20)
    if (leagueId === 71) {
      const tabelaManual = [
        { rank: 1, team: { name: 'Flamengo', logo: 'https://crests.football-data.org/1765.png' }, points: 24, all: { played: 11, win: 7, draw: 3, lose: 1, goals: { for: 24, against: 4 } } },
        { rank: 2, team: { name: 'Cruzeiro', logo: 'https://crests.football-data.org/1767.png' }, points: 24, all: { played: 12, win: 7, draw: 3, lose: 2, goals: { for: 17, against: 8 } } },
        { rank: 3, team: { name: 'Bragantino', logo: 'https://crests.football-data.org/1769.png' }, points: 23, all: { played: 12, win: 7, draw: 2, lose: 3, goals: { for: 14, against: 11 } } },
        { rank: 4, team: { name: 'Palmeiras', logo: 'https://crests.football-data.org/1766.png' }, points: 22, all: { played: 11, win: 7, draw: 1, lose: 3, goals: { for: 18, against: 10 } } },
        { rank: 5, team: { name: 'Bahia', logo: 'https://crests.football-data.org/1770.png' }, points: 21, all: { played: 12, win: 6, draw: 3, lose: 3, goals: { for: 14, against: 11 } } },
        { rank: 6, team: { name: 'Fluminense', logo: 'https://crests.football-data.org/1768.png' }, points: 20, all: { played: 11, win: 6, draw: 2, lose: 3, goals: { for: 15, against: 12 } } },
        { rank: 7, team: { name: 'Atlético-MG', logo: 'https://crests.football-data.org/1764.png' }, points: 20, all: { played: 12, win: 6, draw: 2, lose: 4, goals: { for: 13, against: 10 } } },
        { rank: 8, team: { name: 'Botafogo', logo: 'https://crests.football-data.org/1763.png' }, points: 18, all: { played: 11, win: 5, draw: 3, lose: 3, goals: { for: 14, against: 7 } } },
        { rank: 9, team: { name: 'Mirassol', logo: 'https://crests.football-data.org/1771.png' }, points: 17, all: { played: 11, win: 5, draw: 2, lose: 4, goals: { for: 12, against: 5 } } },
        { rank: 10, team: { name: 'Corinthians', logo: 'https://crests.football-data.org/1762.png' }, points: 16, all: { played: 12, win: 4, draw: 4, lose: 4, goals: { for: 15, against: 17 } } },
        { rank: 11, team: { name: 'Grêmio', logo: 'https://crests.football-data.org/1772.png' }, points: 16, all: { played: 12, win: 4, draw: 4, lose: 4, goals: { for: 12, against: 15 } } },
        { rank: 12, team: { name: 'Ceará SC', logo: 'https://crests.football-data.org/1773.png' }, points: 15, all: { played: 11, win: 4, draw: 3, lose: 4, goals: { for: 13, against: 11 } } },
        { rank: 13, team: { name: 'Vasco da Gama', logo: 'https://crests.football-data.org/1761.png' }, points: 13, all: { played: 12, win: 4, draw: 1, lose: 7, goals: { for: 14, against: 16 } } },
        { rank: 14, team: { name: 'São Paulo', logo: 'https://crests.football-data.org/1760.png' }, points: 12, all: { played: 12, win: 3, draw: 3, lose: 6, goals: { for: 10, against: 14 } } },
        { rank: 15, team: { name: 'Santos', logo: 'https://crests.football-data.org/1774.png' }, points: 11, all: { played: 11, win: 3, draw: 2, lose: 6, goals: { for: 14, against: 14 } } },
        { rank: 16, team: { name: 'EC Vitória', logo: 'https://crests.football-data.org/1775.png' }, points: 11, all: { played: 12, win: 2, draw: 5, lose: 5, goals: { for: 14, against: 18 } } },
        { rank: 17, team: { name: 'Internacional', logo: 'https://crests.football-data.org/1763.png' }, points: 11, all: { played: 12, win: 2, draw: 5, lose: 5, goals: { for: 12, against: 18 } } },
        { rank: 18, team: { name: 'Fortaleza', logo: 'https://crests.football-data.org/1776.png' }, points: 10, all: { played: 12, win: 2, draw: 4, lose: 6, goals: { for: 12, against: 18 } } },
        { rank: 19, team: { name: 'Juventude', logo: 'https://crests.football-data.org/1777.png' }, points: 8, all: { played: 11, win: 2, draw: 2, lose: 7, goals: { for: 8, against: 24 } } },
        { rank: 20, team: { name: 'Sport Recife', logo: 'https://crests.football-data.org/1778.png' }, points: 3, all: { played: 11, win: 0, draw: 3, lose: 8, goals: { for: 8, against: 21 } } },
      ];
      setTimes(tabelaManual);
      setLoading(false);
      return;
    }

    // Se for outra liga, usa a API
    try {
      const res = await axios.get("https://v3.football.api-sports.io/standings", {
        headers: {
          'x-apisports-key': '871e40f7e101b878c3a30d28a7e9663f',
        },
        params: {
          league: leagueId,
          season: 2024,
        },
      });
      const response = res.data.response;
      if (response && response.length > 0) {
        const tabela = response[0].league.standings[0];
        setTimes(tabela);
      } else {
        setTimes([]);
      }
    } catch (err) {
      console.error('Erro ao buscar a tabela:', err);
      setTimes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStandings(selectedLeague);
  }, [selectedLeague]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Image source={require('../assets/logo.png')} style={styles.logoTop} />
        <Text style={styles.title}>Competições</Text>
        <Ionicons name="trophy" size={24} color="#fff" />
      </View>

      <RNPickerSelect
        onValueChange={(value) => setSelectedLeague(value)}
        items={ligas}
        placeholder={{ label: 'Escolha uma liga', value: null }}
        style={pickerSelectStyles}
        value={selectedLeague}
        Icon={() => <Ionicons name="chevron-down" size={20} color="#000" />}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={times}
          keyExtractor={(item) => item.team.name}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rank}>{item.rank}</Text>
              <Image source={{ uri: item.team.logo }} style={styles.logo} />
              <View style={styles.statsRow}>
                <Text style={styles.statText}>PTS {item.points}</Text>
                <Text style={styles.statText}>PJ {item.all.played}</Text>
                <Text style={styles.statText}>VIT {item.all.win}</Text>
                <Text style={styles.statText}>E {item.all.draw}</Text>
                <Text style={styles.statText}>DER {item.all.lose}</Text>
                <Text style={styles.statText}>GM {item.all.goals.for}</Text>
                <Text style={styles.statText}>GC {item.all.goals.against}</Text>
                <Text style={styles.statText}>SG {item.all.goals.for - item.all.goals.against}</Text>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.navbar}>
        <FontAwesome5 name="calendar-alt" size={22} color="#fff" />
        <Ionicons name="trophy" size={22} color="#fff" />
        <Ionicons name="notifications" size={22} color="#fff" />
        <MaterialIcons name="bar-chart" size={22} color="#fff" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 70,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  logoTop: {
    width: 35,
    height: 35,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  row: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    fontWeight: 'bold',
    width: 25,
    fontSize: 14,
  },
  logo: {
    width: 30,
    height: 30,
    marginHorizontal: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    flexWrap: 'wrap',
    rowGap: 2,
  },
  statText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#333',
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    color: '#000',
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    color: '#000',
    marginBottom: 10,
  },
};
