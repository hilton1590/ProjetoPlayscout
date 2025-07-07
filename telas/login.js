import React, { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  Image, StyleSheet, Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.get('http://localhost:3000/users');
      const users = response.data;

      const user = users.find((u) => u.email === email && u.password === senha);

      if (user) {
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        Alert.alert('Sucesso', 'Login efetuado!');
        navigation.navigate('MenuPrincipal');
      } else {
        Alert.alert('Erro', 'E-mail ou senha inválidos');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha na conexão com o servidor');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/playscout.png')} style={styles.image} />
      <Text style={styles.title}>login</Text>

      <Text style={styles.label}>e-mail</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder=""
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>senha</Text>
      <TextInput
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
        placeholder="••••••"
        placeholderTextColor="#999"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>entrar</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        não tem conta?{' '}
        <Text style={styles.linkText} onPress={() => navigation.navigate('Cadastro')}>
          cadastrar
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 300,
    height: 150,
    marginBottom: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  label: {
    alignSelf: 'flex-start',
    color: '#eee',
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#fff',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerText: {
    color: '#aaa',
  },
  linkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
