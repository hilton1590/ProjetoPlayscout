import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';

export default function Calendario() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const timeoutRef = useRef(null);

  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async function fetchFixtures() {
    setLoading(true);
    try {
      const today = getTodayDate();

      const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
        headers: {
          'x-apisports-key': '5b1504a699f0b8a041aa4f8fff3a501f',
        },
        params: {
          date: today,
          timezone: 'America/Sao_Paulo',
        },
      });

      setFixtures(response.data.response);
    } catch (error) {
      console.error('Erro ao buscar jogos:', error);
    } finally {
      setLoading(false);
    }
  }

  function scheduleUpdateAfterLastGame() {
    if (!fixtures.length) return;

    const lastGame = fixtures.reduce((latest, current) => {
      const currentTime = new Date(current.fixture.date).getTime();
      const latestTime = new Date(latest.fixture.date).getTime();
      return currentTime > latestTime ? current : latest;
    });

    const lastGameTime = new Date(lastGame.fixture.date).getTime();
    const delay = lastGameTime + 10 * 60 * 1000 - Date.now();

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        fetchFixtures();
        scheduleUpdateAfterLastGame();
      }, delay);
    } else {
      fetchFixtures();
    }
  }

  useEffect(() => {
    fetchFixtures();
    const interval = setTimeout(() => {
      scheduleUpdateAfterLastGame();
    }, 2000);

    return () => {
      clearTimeout(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Atualiza o tempo a cada 30 segundos para manter o minuto sempre certo
  useEffect(() => {
    const timeUpdater = setInterval(() => {
      setNow(new Date());
    }, 30 * 1000); // atualiza duas vezes por minuto

    return () => clearInterval(timeUpdater);
  }, []);

  const renderItem = ({ item }) => {
    const { home, away } = item.teams;
    const { date, status } = item.fixture;
    const { home: homeGoals, away: awayGoals } = item.goals;

    const fixtureTime = new Date(date);

    const isFinished = status.short === 'FT';
    const isLive = ['1H', '2H', 'ET', 'P', 'LIVE'].includes(status.short);
    const isNotStarted = status.short === 'NS';

    // Placar exibido
    let scoreDisplay = 'x';
    if ((isLive || isFinished) && homeGoals !== null && awayGoals !== null) {
      scoreDisplay = `${homeGoals} x ${awayGoals}`;
    } else if (isLive && (homeGoals === null || awayGoals === null)) {
      scoreDisplay = '– x –';
    }

    // Cálculo do tempo corrido (simulado em tempo real)
    let statusDisplay = '';
    if (isFinished) {
      statusDisplay = 'Finalizado';
    } else if (isNotStarted) {
      const formattedTime = fixtureTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      statusDisplay = `${formattedTime}`;
    } else if (isLive) {
      const elapsed = Math.floor((now.getTime() - fixtureTime.getTime()) / 60000);
      statusDisplay = `${elapsed > 0 ? elapsed : 0}’`;
    } else if (status.elapsed !== null) {
      statusDisplay = `${status.elapsed}’`;
    } else {
      statusDisplay = status.short;
    }

    return (
      <View style={styles.card}>
        <View style={styles.teamsRow}>
          <View style={styles.team}>
            <Image source={{ uri: home.logo }} style={styles.logo} />
            <Text style={styles.teamName}>{home.name}</Text>
          </View>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>{scoreDisplay}</Text>
            <Text style={styles.statusText}>{statusDisplay}</Text>
          </View>

          <View style={styles.team}>
            <Image source={{ uri: away.logo }} style={styles.logo} />
            <Text style={styles.teamName}>{away.name}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={() => {}}>
          <Text style={styles.buttonText}>Ver Detalhes</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jogos de Hoje ({getTodayDate()})</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : fixtures.length === 0 ? (
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
          Nenhum jogo disponível hoje.
        </Text>
      ) : (
        <FlatList
          data={fixtures}
          keyExtractor={(item) => item.fixture.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
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
  logo: {
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
