import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

  if (/^\d+(\+\d+)?$/.test(s)) {
    return `${statusRaw}'`;
  }

  if (s === 'finished' || s === 'ft') return 'Finalizado';
  if (s === 'cancelled') return 'Cancelado';
  if (s === 'ht' || s === 'half time') return 'Intervalo';
  if (s === 'postponed') return 'Adiado';
  if (s === 'abandoned') return 'Interrompido';

  return statusRaw;
}

export default function Calendario({ navigation }) {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const groupedFilteredFixtures = Object.keys(groupedFixtures).reduce((filtered, league) => {
    const filteredGames = groupedFixtures[league].filter((game) => {
      if (searchTerm.length < 3) return true;
      const term = searchTerm.toLowerCase();
      return (
        game.event_home_team.toLowerCase().includes(term) ||
        game.event_away_team.toLowerCase().includes(term)
      );
    });
    if (filteredGames.length > 0) filtered[league] = filteredGames;
    return filtered;
  }, {});

  const orderedLeagues = Object.keys(groupedFilteredFixtures).sort((a, b) => {
    const nameA = a.split(' (')[0];
    const nameB = b.split(' (')[0];

    const hasLiveA = groupedFilteredFixtures[a].some((game) => game.event_live === '1');
    const hasLiveB = groupedFilteredFixtures[b].some((game) => game.event_live === '1');

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
        const rawTime = g.time?.toString().trim() || '';
        const time = rawTime ? `${rawTime}'` : '';
        const isHome = !!g.home_scorer;
        const emoji = '⚽';
        eventos.push(`${time} ${emoji} [${isHome ? 'CASA' : 'VIS'}]`);
      });
    }

    if (item.cards && Array.isArray(item.cards)) {
      item.cards.forEach((c) => {
        const rawTime = c.time?.toString().trim() || '';
        const time = rawTime ? `${rawTime}'` : '';
        const isHome = !!c.home_fault;
        const player = (c.home_fault || c.away_fault || '').trim();
        const cardIcon = c.card === 'yellow card' ? '🟨' : '🟥';
        eventos.push(`${time} ${cardIcon} [${isHome ? 'CASA' : 'VIS'}] ${player}`);
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

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('DetalhesDaPartida', { partida: item, event_key: item.event_key })}
        >
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

      <TextInput
        placeholder="Buscar time (min 3 letras)..."
        placeholderTextColor="#888"
        style={styles.searchInput}
        value={searchTerm}
        onChangeText={setSearchTerm}
        autoCapitalize="none"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : Object.keys(groupedFilteredFixtures).length === 0 ? (
        <Text style={styles.noGames}>Nenhum jogo disponível hoje.</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {orderedLeagues.map((league) => {
            const leagueName = league.split(' (')[0]; // Remove a parte do país, se necessário
            return (
              <View key={league}>
                <View style={styles.leagueContainer}>
                  <Text style={styles.leagueTitle}>🏆 {leagueName}</Text>
                </View>
                {groupedFilteredFixtures[league].map((game) => renderItem(game))}
              </View>
            );
          })}
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
  searchInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 16,
  },
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
  btn: {
    marginTop: 8,
    backgroundColor: '#0066cc',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
