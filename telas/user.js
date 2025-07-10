import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function UserScreen() {
  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.headerTitle}>Usuario</Text>
        <Image source={require('../assets/ancelotti.jpg')} style={styles.profileIcon} />
      </View>

      {/* Avatar + nome */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} />
        <Text style={styles.userName}>Silvano</Text>
      </View>

      {/* Bloco de opções */}
      <View style={styles.card}>
        <Item icon="https://cdn-icons-png.flaticon.com/128/1250/1250615.png" label="Alterar informações" />
        <Item icon="https://cdn-icons-png.flaticon.com/128/561/561127.png" label="E-mail" />
        <Item icon="https://cdn-icons-png.flaticon.com/128/2913/2913436.png" label="Senha" />
        <Item icon="https://cdn-icons-png.flaticon.com/128/1077/1077114.png" label="usuario" />
        <Item icon="https://cdn-icons-png.flaticon.com/128/1828/1828919.png" label="Suporte" />
      </View>

      {/* Rodapé */}
      <View style={styles.navbar}>
        <FontAwesome5 name="calendar-alt" size={24} color="#fff" />
        <Ionicons name="trophy" size={24} color="#fff" />
        <Ionicons name="notifications" size={24} color="#fff" />
        <MaterialIcons name="bar-chart" size={24} color="#fff" />
      </View>
    </View>
  );
}

function Item({ icon, label }) {
  return (
    <View style={styles.optionRow}>
      <Image source={{ uri: icon }} style={styles.optionIcon} />
      <Text style={styles.optionLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 40, alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 10,
  },
  logo: { width: 30, height: 30, resizeMode: 'contain' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  profileIcon: { width: 30, height: 30, tintColor: '#fff' },

  avatarContainer: { alignItems: 'center', marginBottom: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  userName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 5 },

  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 10,
  },
  optionLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },

  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#444',
    paddingVertical: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  iconFooter: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
});
