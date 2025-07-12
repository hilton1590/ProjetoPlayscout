import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Image, ScrollView, Alert, Platform
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function Cadastro({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [foto, setFoto] = useState(null); // caminho local ou base64

  const selecionarImagem = async () => {
    console.log('Abrindo seletor de imagem...');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: Platform.OS === 'web', // só ativa base64 no navegador
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];

      if (Platform.OS === 'web') {
        const imagemBase64 = `data:image/jpeg;base64,${asset.base64}`;
        setFoto(imagemBase64);
        console.log('Imagem (base64):', imagemBase64);
      } else {
        const originalUri = asset.uri;
        const novoCaminho = FileSystem.documentDirectory + 'fotoUsuario_' + Date.now() + '.jpg';

        try {
          await FileSystem.copyAsync({ from: originalUri, to: novoCaminho });
          setFoto(novoCaminho);
          console.log('Imagem salva em:', novoCaminho);
        } catch (err) {
          console.log('Erro ao copiar imagem:', err);
          Alert.alert('Erro', 'Não foi possível salvar a imagem.');
        }
      }
    } else {
      console.log('Imagem cancelada ou inválida.');
    }
  };

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

      // Salva sessão e imagem
      await AsyncStorage.setItem('userData', JSON.stringify(response.data));
      if (foto) {
        await AsyncStorage.setItem('userPhoto', foto);
      }

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

      <TouchableOpacity onPress={selecionarImagem}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.fotoPerfil} />
        ) : (
          <View style={styles.fotoPlaceholder}>
            <Text style={styles.fotoTexto}>Selecionar foto de perfil</Text>
          </View>
        )}
      </TouchableOpacity>

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
  fotoPerfil: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  fotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  fotoTexto: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 10,
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
