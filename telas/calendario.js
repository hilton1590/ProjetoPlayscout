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

  function getTodayDate() {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }

  async function fetchFixtures() {
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

      if (resp.data.success === 1 && Array.isArray(resp.data.result)) {
        // DEBUG: Mostrar dados do primeiro jogo para inspecionar goalscorer
        if (resp.data.result.length > 0) {
          console.log('Exemplo goalscorer do primeiro jogo:', resp.data.result[0].goalscorer);
        }

        const sorted = resp.data.result.sort(
          (a, b) =>
            new Date(`${a.event_date}T${a.event_time}:00-03:00`) -
            new Date(`${b.event_date}T${b.event_time}:00-03:00`)
        );
        setFixtures(sorted);
      } else {
        setFixtures([]);
      }
    } catch (error) {
      console.error('Erro ao buscar jogos:', error);
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFixtures();
    const interval = setInterval(() => fetchFixtures(), 15000);
    return () => clearInterval(interval);
  }, []);

  function renderItem({ item }) {
    const status = item.event_status;
    const isFinished = status.toLowerCase() === 'finished';
    const isLive = item.event_live === '1' && !isFinished;
    const isNotStarted = status === 'Not Started';

    const score =
      (isLive || isFinished) && item.event_final_result
        ? item.event_final_result.replace(' - ', ' x ')
        : 'x';

    let displayStatus = '';
    if (isNotStarted) {
      displayStatus = new Date(`${item.event_date}T${item.event_time}:00-03:00`).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (isLive) {
      displayStatus = 'Ao vivo';
    } else if (status.toLowerCase().includes('half')) {
      displayStatus = 'Intervalo';
    } else if (isFinished) {
      displayStatus = 'Finalizado';
    } else {
      displayStatus = status;
    }

    // Monta a lista de eventos: gols e cartões
    const eventos = [];

    // Gols (todos)
    if (item.goalscorer && Array.isArray(item.goalscorer)) {
      item.goalscorer.forEach((g) => {
        const time = g.time || '';
        // Tentando puxar nome do jogador corretamente
        const player =
          g.home_scorer?.trim() ||
          g.away_scorer?.trim() ||
          g.player?.trim() || // tentativa extra
          'Gol';

        eventos.push(`${time}’ ⚽ ${player}`);
      });
    }

    // Cartões
    if (item.cards && Array.isArray(item.cards)) {
      item.cards.forEach((c) => {
        const abbr = c.home_fault ? 'CASA' : 'VIS';
        const player = (c.home_fault || c.away_fault || '').trim();
        const cardIcon = c.card === 'yellow card' ? '🟨' : '🟥';
        eventos.push(`${c.time}’ ${cardIcon} [${abbr}] ${player}`);
      });
    }

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.team}>
            {item.home_team_logo && <Image source={{ uri: item.home_team_logo }} style={styles.logo} />}
            <Text style={styles.teamName}>{item.event_home_team}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>{score}</Text>
            <Text style={styles.statusText}>{displayStatus}</Text>
          </View>
          <View style={styles.team}>
            {item.away_team_logo && <Image source={{ uri: item.away_team_logo }} style={styles.logo} />}
            <Text style={styles.teamName}>{item.event_away_team}</Text>
          </View>
        </View>

        {eventos.length > 0 && (
          <View style={styles.events}>
            {eventos.map((e, i) => (
              <Text key={i} style={styles.eventText}>• {e}</Text>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>Ver Detalhes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Jogos de Hoje</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : fixtures.length === 0 ? (
        <Text style={styles.noGames}>Nenhum jogo disponível hoje.</Text>
      ) : (
        <FlatList
          data={fixtures}
          keyExtractor={(item) => item.event_key}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 40, paddingHorizontal: 10 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  back: { padding: 10 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  noGames: { color: '#fff', textAlign: 'center', marginTop: 20 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 10, padding: 12, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  team: { flex: 1, alignItems: 'center' },
  logo: { width: 40, height: 40, marginBottom: 5 },
  teamName: { color: '#fff', fontSize: 13, textAlign: 'center' },
  scoreBox: { flex: 1, alignItems: 'center' },
  scoreText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  statusText: { color: '#ccc', fontSize: 12, marginTop: 2 },
  events: { marginTop: 6 },
  eventText: { color: '#fff', fontSize: 12, marginBottom: 2 },
  btn: { backgroundColor: '#007bff', marginTop: 10, padding: 8, borderRadius: 5, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
