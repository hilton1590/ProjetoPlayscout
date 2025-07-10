import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

export default function DetalhesPartida({ route }) {
  const { partida } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Detalhes da Partida</Text>

      <View style={styles.teams}>
        <View style={styles.team}>
          <Image source={{ uri: partida.home_team_logo }} style={styles.logo} />
          <Text style={styles.name}>{partida.event_home_team}</Text>
        </View>

        <Text style={styles.score}>{partida.event_final_result || 'x'}</Text>

        <View style={styles.team}>
          <Image source={{ uri: partida.away_team_logo }} style={styles.logo} />
          <Text style={styles.name}>{partida.event_away_team}</Text>
        </View>
      </View>

      <Text style={styles.detail}>Data: {partida.event_date}</Text>
      <Text style={styles.detail}>Hora: {partida.event_time}</Text>
      <Text style={styles.detail}>Status: {partida.event_status}</Text>
      <Text style={styles.detail}>Liga: {partida.league_name} ({partida.league_country})</Text>

      {/* Você pode adicionar mais detalhes aqui conforme necessário */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#000', flex: 1 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  teams: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  team: { alignItems: 'center', flex: 1 },
  logo: { width: 50, height: 50, marginBottom: 8 },
  name: { color: '#fff', fontSize: 14, textAlign: 'center' },
  score: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  detail: { color: '#ccc', fontSize: 14, marginBottom: 6 },
});
