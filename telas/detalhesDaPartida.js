import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_KEY = '8c54011079c4f1b49846ec32e822b41d8cd';

export default function DetalhesPartida({ route }) {
  const { partida } = route.params;
  const [abaAtiva, setAbaAtiva] = useState('Sumário');
  const [eventos, setEventos] = useState([]);
  const [formacoes, setFormacoes] = useState({ casa: [], visitante: [] });
  const [moduloCasa, setModuloCasa] = useState('');
  const [moduloVisitante, setModuloVisitante] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchDetalhes() {
      try {
        const resp = await axios.get('https://apiv2.allsportsapi.com/football/', {
          params: {
            met: 'Fixtures',
            APIkey: API_KEY,
            eventId: partida.event_key,
            from: partida.event_date,
            to: partida.event_date,
          },
        });

        if (resp.data.success === 1 && Array.isArray(resp.data.result)) {
          const game = resp.data.result[0];
          const tempEventos = [];

          if (game.goalscorer && Array.isArray(game.goalscorer)) {
            game.goalscorer.forEach((g) => {
              const rawTime = g.time?.toString().trim() || '';
              const time = rawTime ? `${rawTime}'` : '';
              const isHome = !!g.home_scorer;
              const emoji = '⚽';
              tempEventos.push(`${time} ${emoji} [${isHome ? 'CASA' : 'VIS'}]`);
            });
          }

          if (game.cards && Array.isArray(game.cards)) {
            game.cards.forEach((c) => {
              const rawTime = c.time?.toString().trim() || '';
              const time = rawTime ? `${rawTime}'` : '';
              const isHome = !!c.home_fault;
              const player = (c.home_fault || c.away_fault || '').trim();
              const cardIcon = c.card === 'yellow card' ? '🟨' : '🟥';
              tempEventos.push(`${time} ${cardIcon} [${isHome ? 'CASA' : 'VIS'}] ${player}`);
            });
          }

          setEventos(tempEventos);

          const casa = game.lineups?.home_team?.starting_lineups || [];
          const visitante = game.lineups?.away_team?.starting_lineups || [];
          const modCasa = game.lineups?.home_team?.formation || '';
          const modVis = game.lineups?.away_team?.formation || '';

          setFormacoes({ casa, visitante });
          setModuloCasa(modCasa);
          setModuloVisitante(modVis);
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
      }
    }

    fetchDetalhes();
  }, [partida.event_key]);

  const renderCampinho = (jogadores, modulo) => {
    if (!modulo || jogadores.length === 0) return <Text style={styles.detail}>Sem formação</Text>;

    const linhas = modulo.split('-').map(n => parseInt(n));
    const escalacaoPorLinha = [];
    let idx = 0;

    for (let i = 0; i < linhas.length; i++) {
      const linha = jogadores.slice(idx, idx + linhas[i]);
      escalacaoPorLinha.push(linha);
      idx += linhas[i];
    }

    return (
      <View style={styles.campo}>
        {escalacaoPorLinha.map((linha, i) => (
          <View key={i} style={styles.linhaPosicional}>
            {linha.map((jogador, j) => (
              <Text key={j} style={styles.jogadorTexto}>
                {jogador.player_number} {jogador.player}
              </Text>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

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

      <View style={styles.abas}>
        {['Sumário', 'Eventos', 'Formações'].map((aba) => (
          <TouchableOpacity
            key={aba}
            onPress={() => setAbaAtiva(aba)}
            style={[styles.aba, abaAtiva === aba && styles.abaAtiva]}
          >
            <Text style={[styles.abaTexto, abaAtiva === aba && styles.abaTextoAtiva]}>
              {aba}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.conteudo}>
        {abaAtiva === 'Sumário' && (
          <View>
            <Text style={styles.detail}>Data: {partida.event_date}</Text>
            <Text style={styles.detail}>Hora: {partida.event_time}</Text>
            <Text style={styles.detail}>Status: {partida.event_status}</Text>
            <Text style={styles.detail}>Liga: {partida.league_name} ({partida.league_country})</Text>
            <Text style={styles.detail}>--- Eventos ---</Text>
            {eventos.length === 0 ? (
              <Text style={styles.detail}>Sem eventos registrados.</Text>
            ) : (
              eventos.map((e, i) => (
                <Text key={i} style={styles.eventText}>• {e}</Text>
              ))
            )}
          </View>
        )}

        {abaAtiva === 'Eventos' && (
          <View>
            {eventos.length === 0 ? (
              <Text style={styles.detail}>Sem eventos registrados.</Text>
            ) : (
              eventos.map((e, i) => (
                <Text key={i} style={styles.eventText}>• {e}</Text>
              ))
            )}
          </View>
        )}

        {abaAtiva === 'Formações' && (
          <View>
            <Text style={styles.detailTitle}>Time da Casa:</Text>
            {renderCampinho(formacoes.casa, moduloCasa)}

            <Text style={[styles.detailTitle, { marginTop: 12 }]}>Time Visitante:</Text>
            {renderCampinho(formacoes.visitante, moduloVisitante)}
          </View>
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
    marginBottom: 16,
    marginTop: 40,
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
    marginVertical: 12,
  },
  aba: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#222',
  },
  abaAtiva: {
    backgroundColor: '#e50914',
  },
  abaTexto: {
    color: '#aaa',
    fontSize: 14,
  },
  abaTextoAtiva: {
    color: '#fff',
    fontWeight: 'bold',
  },
  conteudo: {
    paddingBottom: 30,
  },
  detail: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 6,
  },
  eventText: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 4,
  },
  detailTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  campo: {
    backgroundColor: '#0a2a0a',
    borderRadius: 12,
    padding: 10,
    marginVertical: 8,
  },
  linhaPosicional: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 4,
  },
  jogadorTexto: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    width: 60,
  },
});
