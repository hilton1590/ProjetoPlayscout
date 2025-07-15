import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Image, ScrollView, Alert
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Cadastro({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validarEmailComDominios = (email) => {
    const regex = /^[^\s@]+@(gmail\.com|hotmail\.com|yahoo\.com|outlook\.com|live\.com)$/;
    return regex.test(email);
  };

  const handleCadastro = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    if (!validarEmailComDominios(email)) {
      Alert.alert('Erro', 'Use um email válido de Gmail, Hotmail, Yahoo, Outlook ou Live!');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }

    try {
      const res = await axios.get('http://localhost:3000/users');
      const users = res.data;

      const emailExiste = users.some((u) => u.email === email);
      if (emailExiste) {
        Alert.alert('Erro', 'Este e-mail já está cadastrado!');
        return;
      }

      const novoUsuario = {
        username,
        email,
        password,
        token: Math.random().toString(36).substring(2),
        favorito: '',
      };

      const response = await axios.post('http://localhost:3000/users', novoUsuario);

      await AsyncStorage.setItem('userData', JSON.stringify(response.data));

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      navigation.navigate('MenuPrincipal');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao conectar com o servidor');
      console.log(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/playscout.png')} style={styles.image} />

      <Text style={styles.title}>cadastro</Text>

      <Text style={styles.label}>nome de usuário</Text>
      <TextInput style={styles.input} value={username} onChangeText={setUsername} />

      <Text style={styles.label}>e-mail</Text>
      <TextInput style={styles.input} keyboardType="email-address" value={email} onChangeText={setEmail} />

      <Text style={styles.label}>senha</Text>
      <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

      <Text style={styles.label}>confirmar senha</Text>
      <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      <TouchableOpacity style={styles.button} onPress={handleCadastro}>
        <Text style={styles.buttonText}>cadastrar</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        já tem conta?{' '}
        <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
          entrar
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
