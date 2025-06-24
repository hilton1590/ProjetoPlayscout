import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';

export default function Cadastro({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCadastro = () => {
    // Lógica de cadastro aqui

    // Navegar para o MenuPrincipal ou para outra tela após o cadastro
    navigation.navigate('MenuPrincipal');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Image source={require('../assets/playscout.png')} style={styles.headerImage} />
      <View style={styles.container}>
        <Text style={styles.title}>cadastro</Text>

        <Text style={styles.label}>e-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="hello@reallygreatsite.com"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>senha</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>confirmar senha</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••"
          placeholderTextColor="#999"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleCadastro}>
          <Text style={styles.loginButtonText}>cadastrar</Text>
        </TouchableOpacity>

        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>já tem conta? entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#000',
  },
  headerImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  container: {
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#000',
    fontWeight: 'bold',
    textTransform: 'lowercase', // As letras do botão "Cadastrar" estão minúsculas
  },
  linksContainer: {
    alignItems: 'center',
  },
  linkText: {
    color: '#fff',
    marginBottom: 10,
  },
});
