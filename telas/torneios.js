import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const App = ({ navigation }) => {
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  const ligas = [
    { label: 'Brasileirão Série A', value: 99 },
    { label: 'Premier League', value: 152 },
    { label: 'Ligue 1', value: 168 }, // ← ID real da La Liga
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

      const data = res.data.result?.total || [];
      const tabela = data.map(item => ({
        rank: parseInt(item.standing_place),
        team: { name: item.team_name, logo: item.team_logo },
        points: parseInt(item.standing_PTS),
        played: parseInt(item.standing_P),
        win: parseInt(item.standing_W),
        draw: parseInt(item.standing_D),
        lose: parseInt(item.standing_L),
        goalsFor: parseInt(item.standing_F),
        goalsAgainst: parseInt(item.standing_A),
        goalDiff: parseInt(item.standing_F) - parseInt(item.standing_A),
        form: item.standing_PForm?.split(',') || [],
      }));
      setTimes(tabela);
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
      <Text style={styles.cell}>{item.points}</Text>
      <Text style={styles.cell}>{item.played}</Text>
      <Text style={styles.cell}>{item.win}</Text>
      <Text style={styles.cell}>{item.draw}</Text>
      <Text style={styles.cell}>{item.lose}</Text>
      <Text style={styles.cell}>{item.goalsFor}</Text>
      <Text style={styles.cell}>{item.goalsAgainst}</Text>
      <Text style={styles.cell}>{item.goalDiff}</Text>
      <View style={styles.formContainer}>
        {item.form.map((f, i) => (
          <View
            key={i}
            style={[
              styles.formDot,
              {
                backgroundColor:
                  f === 'W' ? '#4caf50' : f === 'D' ? '#ffc107' : '#f44336',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Troque pela logo da Play Scout */}
        <Image source={require('../assets/logo.png')} style={styles.logoHeader} />

        {/* Placeholder para balancear o espaço */}
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.title}>Classificação</Text>
        <RNPickerSelect
          onValueChange={setSelectedLeague}
          items={ligas}
          placeholder={{ label: 'Selecione liga...', value: null }}
          style={pickerStyles}
          Icon={() => <Ionicons name="chevron-down" size={20} color="#FFF" />}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFF" />
      ) : (
        <>
          <View style={styles.tableHeader}>
            {['#', 'PTS', 'PJ', 'VIT', 'E', 'DER', 'GM', 'GC', 'SG', 'Últ.5'].map((h, i) => (
              <Text key={i} style={styles.headerCell}>{h}</Text>
            ))}
          </View>
          <FlatList
            data={times}
            keyExtractor={item => item.rank.toString()}
            renderItem={renderItem}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const pickerStyles = {
  inputIOS: {
    color: '#FFF',
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 6,
    marginLeft: 10,
    width: 150,
  },
  inputAndroid: {
    color: '#FFF',
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 6,
    marginLeft: 10,
    width: 150,
  },
};

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
  logoHeader: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    position: 'absolute',
    left: '50%',
    marginLeft: -25,
  },

  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#222',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  headerCell: {
    flex: 1,
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },

  row: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 2,
    alignItems: 'center',
  },
  rank: { width: 24, fontWeight: 'bold', textAlign: 'center' },
  teamContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  logo: { width: 24, height: 24, marginRight: 6 },
  teamName: { fontSize: 14, flexShrink: 1 },
  cell: { width: 32, textAlign: 'center', fontSize: 12 },

  formContainer: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  formDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default App;
