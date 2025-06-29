import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

export default function SeuTime({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Topo com logo e ícone de notificações */}
        <View style={styles.topBar}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Ionicons name="notifications" size={24} color="#fff" />
        </View>

        {/* Título e escudo */}
        <View style={styles.header}>
          <Text style={styles.title}>Seu time</Text>
          <Image source={require('../assets/sport.png')} style={styles.escudo} />
        </View>

        {/* Competições */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Competições</Text>
          <Text style={styles.text}>20º Brasileirão Serie A</Text>
          <Text style={styles.text}>2º Copa do Nordeste grupo A</Text>
        </View>

        {/* Próximos confrontos */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Próximos confrontos:</Text>
          <View style={styles.matchContainer}>
            <View style={styles.matchCard}>
              <Image source={require('../assets/sport.png')} style={styles.teamLogo} />
              <Text style={styles.vsText}>X</Text>
              <Image source={require('../assets/santa.png')} style={styles.teamLogo} />
              <Text style={styles.matchInfo}>21/07 - 21:30</Text>
            </View>
            <View style={styles.matchCard}>
              <Image source={require('../assets/sport.png')} style={styles.teamLogo} />
              <Text style={styles.vsText}>X</Text>
              <Image source={require('../assets/santa.png')} style={styles.teamLogo} />
              <Text style={styles.matchInfo}>25/07 - 22:30</Text>
            </View>
          </View>
        </View>

        {/* Notícias */}
        <Text style={styles.subtitle}>Notícias:</Text>
        <View style={styles.newsCard}>
             <Image source={require('../assets/jogo.png')} style={styles.newsImage}/>
          <Text style={styles.newsTitle}>
            Lanterna, Sport vive expectativa de se "reorganizar" durante pausa do Mundial:{"\n"}"Rever algumas coisas"
          </Text>
          <TouchableOpacity>
            <Text style={styles.link}>Ver notícia</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra inferior com navegação */}
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
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scroll: {
    padding: 15,
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
  width: 50,
  height: 50,
  resizeMode: 'contain',
  },
  header: {
    alignItems: 'center',
    marginVertical: 10,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  escudo: {
    width: 70,
    height: 90,
    resizeMode: 'contain',
    marginTop: 5,
  },
  section: {
    marginVertical: 15,
  },
  subtitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  matchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    width: '48%',
    alignItems: 'center',
  },
  teamLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  matchInfo: {
    fontSize: 12,
    marginTop: 5,
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
  },
  newsTitle: {
    color: '#000',
    fontSize: 14,
    marginBottom: 10,
  },
  newsImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  link: {
    color: '#000',
    fontSize: 14,
    marginTop: 5,
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
