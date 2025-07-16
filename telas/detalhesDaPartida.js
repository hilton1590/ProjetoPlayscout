import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DetalhesPartida({ route, navigation }) {
  const { partida } = route.params;
  const [abaAtiva, setAbaAtiva] = useState('Resumo');
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const tempEventos = [];

    if (partida.goalscorer && Array.isArray(partida.goalscorer)) {
      partida.goalscorer.forEach((g) => {
        const time = g.time ? `${g.time.trim()}'` : '';
        const isHome = !!g.home_scorer;
        const nome = isHome ? g.home_scorer : g.away_scorer;
        tempEventos.push({ tipo: 'Gol', tempo: time, jogador: nome, time: isHome ? 'Casa' : 'Visitante', icone: '⚽' });
      });
    }

    if (partida.cards && Array.isArray(partida.cards)) {
      partida.cards.forEach((c) => {
        const time = c.time ? `${c.time.trim()}'` : '';
        const isHome = !!c.home_fault;
        const player = (c.home_fault || c.away_fault || '').trim();
        const cardIcon = c.card === 'yellow card' ? '🟨' : '🟥';
        tempEventos.push({ tipo: c.card, tempo: time, jogador: player, time: isHome ? 'Casa' : 'Visitante', icone: cardIcon });
      });
    }

    setEventos(tempEventos);
  }, [partida]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Detalhes da Partida</Text>

      <View style={styles.teams}>
        <View style={styles.team}>
          {partida.home_team_logo && (
            <Image source={{ uri: partida.home_team_logo }} style={styles.logo} />
          )}
          <Text style={styles.name}>{partida.event_home_team}</Text>
        </View>

        <Text style={styles.score}>{partida.event_final_result || 'x'}</Text>

        <View style={styles.team}>
          {partida.away_team_logo && (
            <Image source={{ uri: partida.away_team_logo }} style={styles.logo} />
          )}
          <Text style={styles.name}>{partida.event_away_team}</Text>
        </View>
      </View>

      {/* Abas */}
      <View style={styles.abas}>
        {['Resumo', 'Escalação'].map((aba) => (
          <TouchableOpacity
            key={aba}
            style={[styles.abaBtn, abaAtiva === aba && styles.abaAtiva]}
            onPress={() => setAbaAtiva(aba)}
          >
            <Text style={styles.abaTexto}>{aba}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.conteudo}>
        {abaAtiva === 'Resumo' && (
          <>
            <Text style={styles.sectionTitle}>Informações</Text>
            <Text style={styles.detail}>Data: {partida.event_date}</Text>
            <Text style={styles.detail}>Hora: {partida.event_time}</Text>
            <Text style={styles.detail}>Status: {partida.event_status}</Text>
            <Text style={styles.detail}>Liga: {partida.league_name} ({partida.league_country})</Text>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Eventos da Partida</Text>
            {eventos.length === 0 ? (
              <Text style={styles.noEventos}>Sem eventos registrados.</Text>
            ) : (
              eventos.map((e, i) => (
                <Text key={i} style={styles.eventText}>
                  {e.tempo} {e.icone} [{e.time}] {e.jogador} ({e.tipo})
                </Text>
              ))
            )}
          </>
        )}

        {abaAtiva === 'Escalação' && (
          <>
            <Text style={styles.sectionTitle}>Time da Casa</Text>
            {partida.lineup?.starting_lineups?.filter(p => p.player_team === 'home').length > 0 ? (
              partida.lineup.starting_lineups
                .filter(p => p.player_team === 'home')
                .map((p, i) => (
                  <Text key={i} style={styles.detail}>• {p.player}</Text>
                ))
            ) : (
              <Text style={styles.noEventos}>Sem escalação disponível.</Text>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Time Visitante</Text>
            {partida.lineup?.starting_lineups?.filter(p => p.player_team === 'away').length > 0 ? (
              partida.lineup.starting_lineups
                .filter(p => p.player_team === 'away')
                .map((p, i) => (
                  <Text key={i} style={styles.detail}>• {p.player}</Text>
                ))
            ) : (
              <Text style={styles.noEventos}>Sem escalação disponível.</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  btnVoltar: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    backgroundColor: '#111',
    padding: 8,
    borderRadius: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 40,
  },
  teams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  team: { alignItems: 'center', flex: 1 },
  logo: { width: 50, height: 50, marginBottom: 8 },
  name: { color: '#fff', fontSize: 14, textAlign: 'center' },
  score: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  abas: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 10,
  },
  abaBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  abaAtiva: {
    backgroundColor: '#0066cc',
  },
  abaTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  conteudo: { marginTop: 10 },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detail: { color: '#ccc', fontSize: 14, marginBottom: 4 },
  noEventos: { color: '#999', fontSize: 14, fontStyle: 'italic' },
  eventText: { color: '#fff', fontSize: 14, marginBottom: 6 },
});
