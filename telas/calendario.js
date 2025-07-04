import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const API_KEY = '8c54011079c4f1b49846ec32e822b41d8cd8b1aa2da96cfaf5b6860db3293378';

const mainLeagues = [
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Brasileirão',
  'Liga MX',
  'UEFA Champions League',
  'Copa Libertadores'
];

function translateStatus(statusRaw) {
  if (!statusRaw) return '';
  const s = statusRaw.toLowerCase();
  if (s === 'finished' || s === 'ft') return 'Finalizado';
  if (s === 'cancelled') return 'Cancelado';
  if (s === 'ht' || s === 'half time') return 'Intervalo';
  if (s === 'postponed') return 'Adiado';
  if (s === 'abandoned') return 'Interrompido';
  if (s.match(/\d+'(\+\d+')?/)) return statusRaw;
  return statusRaw;
}

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

  const groupedFixtures = fixtures.reduce((groups, item) => {
    const leagueName = item.league_name;
    const leagueCountry = item.league_country;
    if (leagueName === 'Premier League' && leagueCountry !== 'England') return groups;
    const leagueKey = `${leagueName} (${leagueCountry})`;
    if (!groups[leagueKey]) groups[leagueKey] = [];
    groups[leagueKey].push(item);
    return groups;
  }, {});

  const orderedLeagues = Object.keys(groupedFixtures).sort((a, b) => {
    const nameA = a.split(' (')[0];
    const nameB = b.split(' (')[0];

    const hasLiveA = groupedFixtures[a].some((game) => game.event_live === '1');
    const hasLiveB = groupedFixtures[b].some((game) => game.event_live === '1');

    if (hasLiveA && !hasLiveB) return -1;
    if (!hasLiveA && hasLiveB) return 1;

    const idxA = mainLeagues.indexOf(nameA);
    const idxB = mainLeagues.indexOf(nameB);

    if (idxA !== -1 || idxB !== -1) {
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return idxA === -1 ? 1 : -1;
    }

    return nameA.localeCompare(nameB);
  });

  function renderItem(item) {
    const statusRaw = item.event_status;
    const isFinished = statusRaw?.toLowerCase() === 'finished' || statusRaw === 'FT';
    const isLive = item.event_live === '1' && !isFinished;

    const isNotStarted =
      statusRaw === 'Not Started' ||
      statusRaw === 'NS' ||
      statusRaw === '' ||
      statusRaw === null ||
      (item.event_live === '0' && !item.event_final_result);

    const score =
      (isLive || isFinished) && item.event_final_result
        ? item.event_final_result.replace(' - ', ' x ')
        : 'x';

    let displayStatus = '';

    if (isNotStarted) {
      displayStatus = new Date(`${item.event_date}T${item.event_time}:00-03:00`)
        .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else {
      displayStatus = translateStatus(statusRaw);
    }

    const eventos = [];

    if (item.goalscorer && Array.isArray(item.goalscorer)) {
      item.goalscorer.forEach((g) => {
        const time = g.time || '';
        const isHome = !!g.home_scorer;
        const player =
          g.home_scorer?.trim() ||
          g.away_scorer?.trim() ||
          g.player?.trim() ||
          'Gol';
        eventos.push(`${time}’ ⚽ [${isHome ? 'CASA' : 'VIS'}] ${player}`);
      });
    }

    if (item.cards && Array.isArray(item.cards)) {
      item.cards.forEach((c) => {
        const isHome = !!c.home_fault;
        const player = (c.home_fault || c.away_fault || '').trim();
        const cardIcon = c.card === 'yellow card' ? '🟨' : '🟥';
        eventos.push(`${c.time}’ ${cardIcon} [${isHome ? 'CASA' : 'VIS'}] ${player}`);
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
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {orderedLeagues.map((league) => (
            <View key={league}>
              <View style={styles.leagueContainer}>
                <Text style={styles.leagueTitle}>🏆 {league}</Text>
              </View>
              {groupedFixtures[league].map((game) => renderItem(game))}
            </View>
          ))}
        </ScrollView>
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
  leagueContainer: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 6,
  },
  leagueTitle: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
  },
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
