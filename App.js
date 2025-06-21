import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

import Ancelotti from './assets/ancelotti.jpg';
import Aston from './assets/Aston-Villa.png';
import Fulham from './assets/fulham.png';

export default function App() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Barra de busca */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#333" style={{ marginLeft: 10 }} />
          <TextInput
            placeholder="Buscar..."
            placeholderTextColor="#666"
            style={styles.input}
          />
        </View>

        {/* Título */}
        <Text style={styles.title}>Principais notícias</Text>

        {/* Card da notícia */}
        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>
            Ancelotti faz mistério sobre seleção, mas Real já planeja futuro sem ele.
          </Text>
          <Image
            source={Ancelotti}
            style={styles.image}
          />
        </View>

        {/* Card do jogo com escudos */}
        <View style={styles.matchCard}>
          <Text style={styles.matchTitle}>Premier League - 35ª Rodada</Text>
          <Text style={styles.matchSub}>JOGÃO na Inglaterra</Text>

          {/* Ícones de transmissão */}
          <Text style={styles.broadcastIcon}>📡 📡</Text>

          {/* Placar com logos */}
          <View style={styles.scoreRow}>
            <View style={styles.teamBox}>
              <Image
                source={Aston}
                style={styles.teamLogo}
              />
              <Text style={styles.teamName}>ASTON</Text>
            </View>

            <Text style={styles.score}>1 - 0</Text>

            <View style={styles.teamBox}>
              <Image
                source={Fulham}
                style={styles.teamLogo}
              />
              <Text style={styles.teamNameRight}>FULHAM</Text>
            </View>
          </View>

          {/* Tempo */}
          <Text style={styles.matchTime}>20 : 33</Text>

          {/* Link */}
          <TouchableOpacity>
            <Text style={styles.detailsLink}>Detalhes do Jogo e análise ao vivo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra inferior */}
      <View style={styles.navbar}>
        <FontAwesome5 name="calendar-alt" size={22} color="#fff" />
        <Ionicons name="trophy" size={22} color="#fff" />
        <Ionicons name="notifications" size={22} color="#fff" />
        <MaterialIcons name="bar-chart" size={22} color="#fff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 10,
    paddingBottom: 80, // espaço para a navbar
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    height: 35,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#000',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 10,
  },
  newsCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  newsTitle: {
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  matchCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  matchTitle: {
    fontSize: 12,
    color: '#333',
  },
  matchSub: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  broadcastIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamBox: {
    alignItems: 'center',
    width: 70,
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 2,
    resizeMode: 'contain',
  },
  teamName: {
    color: '#3949ab',
    fontWeight: 'bold',
    fontSize: 13,
  },
  teamNameRight: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 13,
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  matchTime: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  detailsLink: {
    color: '#1565c0',
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
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
