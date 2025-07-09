import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
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
  View,
} from 'react-native';

export default function MenuPrincipal({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loadingMatch, setLoadingMatch] = useState(true);
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchTerm, setSearchTerm] = useState('futebol');

  useEffect(() => {
    async function fetchMatch() {
      try {
        const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
          headers: {
            'x-apisports-key': 'c33f4c4af00048fc32af1f462e2cb0ba', // sua chave de API
          },
          params: {
            status: 'live', // ✅ CORRIGIDO AQUI
          },
        });
        setMatches(response.data.response);
      } catch (error) {
        console.error('Erro ao buscar partidas ao vivo:', error);
      } finally {
        setLoadingMatch(false);
      }
    }

    fetchMatch();
  }, []);

  useEffect(() => {
    async function fetchNews() {
      setLoadingNews(true);
      try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
          params: {
            q: searchTerm,
            language: 'pt',
            sortBy: 'publishedAt',
            apiKey: 'da079195afc94296843cdb95bcc2cf2f',
            pageSize: 20,
          },
        });
        setNews(response.data.articles);
      } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        setNews([]);
      } finally {
        setLoadingNews(false);
      }
    }
    fetchNews();
  }, [searchTerm]);

  const keywords = [
    'futebol', 'gol', 'campeonato', 'liga', 'time', 'clube',
    'atacante', 'zagueiro', 'meia', 'volante', 'técnico',
    'treinador', 'jogo', 'partida', 'cartão', 'pênalti', 'torcida'
  ];

  const ignoredSources = ['Globo', 'UOL Economia', 'Revista Veja', 'Estadão Política'];
  const negativeWords = ['covid', 'vacina', 'política', 'morte', 'governo'];

  const normalize = str =>
    str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const seenTitles = new Set();
  const filteredNews = news.filter(article => {
    if (!article.title || !article.description) return false;

    const title = normalize(article.title);
    const description = normalize(article.description);
    const fullText = `${title} ${description}`;

    if (ignoredSources.includes(article.source.name)) return false;
    if (negativeWords.some(w => fullText.includes(w))) return false;

    const relevantWords = keywords.filter(keyword => fullText.includes(keyword));
    const isDuplicate = seenTitles.has(title);

    if (relevantWords.length >= 2 && !isDuplicate) {
      seenTitles.add(title);
      return true;
    }
    return false;
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#333" style={{ marginLeft: 10 }} />
          <TextInput
            placeholder="Buscar notícias..."
            placeholderTextColor="#666"
            style={styles.input}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => {
              const trimmed = searchText.trim();
              setSearchTerm(trimmed || 'futebol');
            }}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              const trimmed = searchText.trim();
              setSearchTerm(trimmed || 'futebol');
            }}
          >
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Principais notícias</Text>
        {loadingNews ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : filteredNews.length > 0 ? (
          filteredNews.map((article, index) => (
            <TouchableOpacity
              key={index}
              style={styles.newsCard}
              onPress={() => navigation.navigate('Noticia', { url: article.url })}
            >
              {article.urlToImage && (
                <Image source={{ uri: article.urlToImage }} style={styles.image} />
              )}
              <Text style={styles.newsTitle}>{article.title}</Text>
              <Text style={styles.newsSource}>{article.source.name}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ color: '#fff', textAlign: 'center' }}>Nenhuma notícia relevante encontrada.</Text>
        )}

        <Text style={[styles.title, { marginTop: 20 }]}>Partidas ao vivo</Text>
        {loadingMatch ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : matches.length > 0 ? (
          matches.map((match, index) => (
            <View key={index} style={styles.matchCard}>
              <Text style={styles.matchTitle}>
                {match.league.name} - {match.league.round}
              </Text>
              <Text style={styles.matchSub}>
                {match.teams.home.name} x {match.teams.away.name}
              </Text>
              <Text style={styles.broadcastIcon}>📡 Ao vivo</Text>

              <View style={styles.scoreRow}>
                <View style={styles.teamBox}>
                  <Image source={{ uri: match.teams.home.logo }} style={styles.teamLogo} />
                  <Text style={styles.teamName}>{match.teams.home.name}</Text>
                </View>

                <Text style={styles.score}>
                  {match.goals.home ?? '-'} - {match.goals.away ?? '-'}
                </Text>

                <View style={styles.teamBox}>
                  <Image source={{ uri: match.teams.away.logo }} style={styles.teamLogo} />
                  <Text style={styles.teamNameRight}>{match.teams.away.name}</Text>
                </View>
              </View>

              <Text style={styles.matchTime}>
                {new Date(match.fixture.date).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>

              <TouchableOpacity onPress={() => navigation.navigate('DetalhesPartida', { match })}>
                <Text style={styles.detailsLink}>Detalhes do Jogo e análise ao vivo</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={{ color: '#fff', textAlign: 'center' }}>Nenhuma partida ao vivo no momento.</Text>
        )}
      </ScrollView>

      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate('Calendario')}>
          <FontAwesome5 name="calendar-alt" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Torneios')}>
          <Ionicons name="trophy" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Notificacoes')}>
          <Ionicons name="notifications" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Estatisticas')}>
          <MaterialIcons name="bar-chart" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { paddingTop: 40, paddingHorizontal: 10, paddingBottom: 80 },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    height: 35,
    marginBottom: 10,
  },
  input: { flex: 1, paddingHorizontal: 10, fontSize: 14, color: '#000' },
  searchButton: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'center',
    marginRight: 5,
  },
  searchButtonText: { color: '#fff', fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#fff', marginBottom: 10 },
  newsCard: { backgroundColor: '#fff', padding: 10, borderRadius: 12, marginBottom: 15, overflow: 'hidden' },
  newsTitle: { fontWeight: 'bold', fontSize: 14, marginTop: 8, color: '#000' },
  newsSource: { fontSize: 12, color: '#666', marginTop: 4, textAlign: 'right' },
  image: { width: '100%', height: 180, borderRadius: 10, resizeMode: 'cover' },
  matchCard: { backgroundColor: '#fff', padding: 10, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  matchTitle: { fontSize: 12, color: '#333' },
  matchSub: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  broadcastIcon: { fontSize: 18, marginBottom: 4 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', alignItems: 'center', marginBottom: 4 },
  teamBox: { alignItems: 'center', width: 80 },
  teamLogo: { width: 40, height: 40, marginBottom: 2, resizeMode: 'contain' },
  teamName: { color: '#3949ab', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  teamNameRight: { color: '#e53935', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  score: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  matchTime: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  detailsLink: { color: '#1565c0', fontSize: 12, textAlign: 'center', textDecorationLine: 'underline' },
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
