import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const App = () => {
  const [allLeagues, setAllLeagues] = useState([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [standings, setStandings] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAllLeagues() {
      try {
        const res = await axios.get('https://apiv2.allsportsapi.com/football/', {
          params: {
            met: 'Leagues',
            APIkey: 'b3516224c9c1787c7e1e98adf3387889712d6dc8924654e030328a18c85e66aa',
          },
        });

        const lista = res.data.result || [];
        const formatado = lista.map(l => ({
          label: l.league_name,
          value: l.league_key,
          logo: l.league_logo,
        }));

        setAllLeagues(formatado);
      } catch (err) {
        console.error('Erro ao buscar ligas:', err);
      }
    }

    fetchAllLeagues();
  }, []);

  const fetchStandings = async (leagueKey) => {
    try {
      setLoading(true);
      const res = await axios.get('https://apiv2.allsportsapi.com/football/', {
        params: {
          met: 'Standings',
          leagueId: leagueKey,
          APIkey: 'b3516224c9c1787c7e1e98adf3387889712d6dc8924654e030328a18c85e66aa',
        },
      });

      const data = res.data.result?.total || [];
      setStandings(data);
    } catch (err) {
      console.error('Erro ao buscar classificação:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchLeagues = (text) => {
    setQuery(text);
    if (text.length < 2) return setSuggestions([]);

    const lower = text.toLowerCase();
    const resultados = allLeagues.filter(l =>
      l.label.toLowerCase().includes(lower)
    );
    setSuggestions(resultados);
  };

  const selectLeague = (liga) => {
    setSelectedLeague(liga);
    setQuery(liga.label);
    setSuggestions([]);
    fetchStandings(liga.value);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.pos}>{item.standing_place}</Text>
      <Image source={{ uri: item.team_logo }} style={styles.logo} />
      <Text style={styles.name}>{item.standing_team}</Text>
      <Text style={styles.points}>{item.standing_PTS} pts</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Classificação</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar liga..."
        placeholderTextColor="#ccc"
        value={query}
        onChangeText={searchLeagues}
      />

      {suggestions.length > 0 ? (
        suggestions.map((l, index) => (
          <TouchableOpacity key={index} onPress={() => selectLeague(l)} style={styles.suggestionItem}>
            <Image source={{ uri: l.logo }} style={styles.suggestionLogo} />
            <Text style={styles.suggestionText}>{l.label}</Text>
          </TouchableOpacity>
        ))
      ) : query.length > 1 ? (
        <Text style={styles.noResults}>Nenhuma liga encontrada</Text>
      ) : null}

      {selectedLeague && (
        <Text style={styles.subtitle}>Liga: {selectedLeague.label}</Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#FFF" />
      ) : (
        <FlatList
          data={standings}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFF',
    marginVertical: 8,
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderRadius: 6,
    padding: 10,
    color: '#FFF',
    marginBottom: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 4,
    marginBottom: 2,
  },
  suggestionLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  suggestionText: {
    color: '#FFF',
    fontSize: 14,
  },
  noResults: {
    color: '#aaa',
    padding: 10,
    fontStyle: 'italic',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  pos: {
    width: 30,
    color: '#FFF',
  },
  logo: {
    width: 24,
    height: 24,
    marginHorizontal: 8,
  },
  name: {
    flex: 1,
    color: '#FFF',
  },
  points: {
    color: '#0f0',
    fontWeight: 'bold',
  },
});

export default App;
