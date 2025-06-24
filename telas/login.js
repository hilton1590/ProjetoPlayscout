import React from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';

export default function LoginScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../assets/playscout.png')}
        style={styles.image}
        resizeMode="cover"
      />

      <Text style={styles.title}>login</Text>

      <Text style={styles.label}>e-mail</Text>
      <TextInput
        style={styles.input}
        placeholder="hello@reallygreatsite.com"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>senha</Text>
      <TextInput
        style={styles.input}
        placeholder="**"
        placeholderTextColor="#999"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>entrar</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        não tem conta?{" "}
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate('Cadastro')} // Navega para a tela de Cadastro
        >
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
    backgroundColor: '#fff', // botão branco
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#000', // texto preto
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerText: {
    color: '#aaa',
  },
  linkText: {
    color: '#fff', // texto branco para "Cadastrar"
    fontWeight: 'bold',
  },
});
