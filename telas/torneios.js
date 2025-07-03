import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, FlatList, ActivityIndicator, SafeAreaView,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const App = () => {
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  const ligas = [
    { label: 'Brasileirão Série A', value: 99 },  // 🔴 ATUALIZE AQUI
    { label: 'Premier League', value: 152 },
    { label: 'La Liga', value: 97 },
    { label: 'Serie A', value: 207 },
    { label: 'Bundesliga', value: 175 },
  ];

  const fetchStandings = async (leagueId) => {
    setLoading(true);
    try {
      const res = await axios.get('https://apiv2.allsportsapi.com/football/', {
        params: {
          met: 'Standings',
          leagueId,
          APIkey: '62a0e1b85e6d4b3307a04df1d6b8e3993446b8a922d80e34b96e5bf0e060cd69',
        },
      });

      const data = res.data.result?.total;
      if (Array.isArray(data)) {
        const tabela = data.map(item => ({
          rank: parseInt(item.standing_place),
          team: {
            name: item.team_name,
            logo: item.team_logo,
          },
          points: parseInt(item.standing_PTS),
          all: {
            played: parseInt(item.standing_P),
            win: parseInt(item.standing_W),
            draw: parseInt(item.standing_D),
            lose: parseInt(item.standing_L),
            goals: {
              for: parseInt(item.standing_F),
              against: parseInt(item.standing_A),
            },
          },
        }));
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
    if (selectedLeague) fetchStandings(selectedLeague);
  }, [selectedLeague]);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.rank}>{item.rank}</Text>
      <View style={styles.teamContainer}>
        <Image source={{ uri: item.team.logo }} style={styles.logo} />
        <Text style={styles.teamName}>{item.team.name}</Text>
      </View>
      <Text style={styles.points}>{item.points}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Classificação</Text>
      <RNPickerSelect
        placeholder={{ label: 'Selecione uma liga...', value: null }}
        onValueChange={setSelectedLeague}
        items={ligas}
        style={{
          inputAndroid: styles.picker,
          inputIOS: styles.picker,
        }}
        Icon={() => <Ionicons name="chevron-down" size={24} color="gray" />}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={times}
          keyExtractor={item => item.rank.toString()}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  picker: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    color: '#FFF',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  rank: {
    width: 30,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  points: {
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
    fontSize: 16,
    color: '#000',
  },
});


export default App;
