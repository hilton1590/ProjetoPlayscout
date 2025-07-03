import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_KEY = '8c54011079c4f1b49846ec32e822b41d8cd8b1aa2da96cfaf5b6860db3293378';

export default function Calendario({ navigation }) {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  function getTodayDate() {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(
      t.getDate()
    ).padStart(2, '0')}`;
  }

  async function fetchFixtures(silent = false) {
    try {
      const today = getTodayDate();
      const resp = await axios.get('https://apiv2.allsportsapi.com/football/', {
        params: {
          met: 'Fixtures',
          APIkey: API_KEY,
          from: today,
          to: today,
          timezone: 'America/Sao_Paulo',
        },
      });

      if (resp.data.success !== 1 || !Array.isArray(resp.data.result)) {
        if (!silent) {
          setFixtures([]);
          setLoading(false);
        }
        return;
      }

      let newList = resp.data.result.sort(
        (a, b) =>
          new Date(`${a.event_date}T${a.event_time}:00-03:00`) -
          new Date(`${b.event_date}T${b.event_time}:00-03:00`)
      );

      if (silent) {
        const oldKeys = fixtures.map((f) => f.event_key);
        const newKeys = newList.map((f) => f.event_key);
        if (JSON.stringify(oldKeys) === JSON.stringify(newKeys)) {
          let hasChanges = false;
          for (let i = 0; i < newList.length; i++) {
            if (
              fixtures[i].event_final_result !== newList[i].event_final_result ||
              fixtures[i].event_status !== newList[i].event_status ||
              fixtures[i].event_live !== newList[i].event_live ||
              fixtures[i].event_minute !== newList[i].event_minute
            ) {
              hasChanges = true;
              break;
            }
          }
          if (!hasChanges) {
            return;
          }
        }
      }

      setFixtures(newList);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar jogos:', error);
      if (!silent) {
        setLoading(false);
        setFixtures([]);
      }
    }
  }

  useEffect(() => {
    fetchFixtures();
    const intervalFetch = setInterval(() => fetchFixtures(true), 25000);
    const intervalNow = setInterval(() => setNow(new Date()), 30000);
    return () => {
      clearInterval(intervalFetch);
      clearInterval(intervalNow);
    };
  }, []);

  function renderItem({ item }) {
    const fixtureDateTime = new Date(`${item.event_date}T${item.event_time}:00-03:00`).getTime();
    const isFinished = item.event_status === 'Finished';
    const isLive = item.event_live === '1';
    const isNotStarted = item.event_status === 'Not Started';

    let score = 'x';
    if ((isLive || isFinished) && item.event_final_result) {
      const [homeScore, awayScore] = item.event_final_result.split(' - ');
      score = `${homeScore} x ${awayScore}`;
    } else if (isLive) {
      score = '– x –';
    }

    let status = '';
    if (isNotStarted) {
      status = new Date(fixtureDateTime).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (isLive) {
      let minuto = item.event_minute;
      if (minuto === undefined || minuto === null) {
        minuto = Math.floor((Date.now() - fixtureDateTime) / 60000);
        minuto = minuto > 0 ? minuto : 0;
      }
      status = `${minuto}’`;
    } else if (isFinished) {
      status = 'Finalizado';
    } else {
      status = item.event_status;
    }

    return (
      <View style={styles.card}>
        <View style={styles.teamsRow}>
          <View style={styles.team}>
            {item.home_team_logo && <Image source={{ uri: item.home_team_logo }} style={styles.logo} />}
            <Text style={styles.teamName}>{item.event_home_team}</Text>
          </View>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>{score}</Text>
            <Text style={styles.statusText}>{status}</Text>
          </View>

          <View style={styles.team}>
            {item.away_team_logo && <Image source={{ uri: item.away_team_logo }} style={styles.logo} />}
            <Text style={styles.teamName}>{item.event_away_team}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={() => {}}>
          <Text style={styles.buttonText}>Ver Detalhes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Troque essa imagem pelo logo da Play Scout */}
        <Image source={require('../assets/logo.png')} style={styles.logo} />

        <View style={{ width: 28 }} /> {/* Placeholder para balancear o espaço */}
      </View>

      <Text style={styles.title}>Jogos de Hoje ({getTodayDate()})</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : fixtures.length === 0 ? (
        <Text style={styles.noGamesText}>Nenhum jogo disponível hoje.</Text>
      ) : (
        <FlatList
          data={fixtures}
          keyExtractor={(item) => item.event_key}
          renderItem={renderItem}
          extraData={now}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
    marginBottom: 10,
  },
  backButton: {
    paddingRight: 10,
  },
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
  noGamesText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  team: {
    alignItems: 'center',
    flex: 1,
  },
  logoTeam: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  teamName: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
  },
  scoreBox: {
    flex: 1,
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
  },
  button: {
    backgroundColor: '#007bff',
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
