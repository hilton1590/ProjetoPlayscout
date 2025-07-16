import {
  AntDesign,
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  LayoutAnimation,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
  ScrollView,
} from 'react-native';
import axios from 'axios';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const avataresFutebol = [
  'https://img.icons8.com/?size=100&id=84687&format=png&color=000000',
  'https://img.icons8.com/?size=100&id=84686&format=png&color=000000',
  'https://img.icons8.com/?size=100&id=84688&format=png&color=000000',
  'https://img.icons8.com/?size=100&id=84689&format=png&color=000000',
  'https://img.icons8.com/?size=100&id=84690&format=png&color=000000',
  'https://img.icons8.com/?size=100&id=84691&format=png&color=000000',
  'https://img.icons8.com/?size=100&id=84693&format=png&color=000000',
  'https://img.icons8.com/?size=100&id=36878&format=png&color=000000',
];

export default function UserScreen({ navigation }) {
  const [userData, setUserData] = useState({});
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [openSection, setOpenSection] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const scrollRef = useRef(null);
  const [scrollX, setScrollX] = useState(0);

  useEffect(() => {
    async function loadUserData() {
      try {
        const data = await AsyncStorage.getItem('userData');
        const avatar = await AsyncStorage.getItem('userAvatar');
        if (data) setUserData(JSON.parse(data));
        if (avatar) setFotoPerfil(avatar);
      } catch (e) {
        console.error('Erro ao carregar usuário:', e);
      }
    }
    loadUserData();
  }, []);

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSection(openSection === key ? '' : key);
  };

  const selecionarIcone = async (url) => {
    setFotoPerfil(url);
    await AsyncStorage.setItem('userAvatar', url);
    Alert.alert('Sucesso', 'Avatar atualizado!');
  };

  const handleUpdateUser = async () => {
    try {
      const response = await axios.patch(`http://localhost:3000/users/${userData.id}`, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        icon: fotoPerfil,
      });

      await AsyncStorage.setItem('userData', JSON.stringify(response.data));
      Alert.alert('Sucesso', 'Informações atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Alert.alert('Erro', 'Não foi possível atualizar as informações.');
    }
  };

  const handleLogout = async () => {
    try {
      // Verifica se o avatar está armazenado e salva em outro lugar antes de remover
      const avatar = await AsyncStorage.getItem('userAvatar');
      
      // Remove os dados do usuário e avatar do AsyncStorage
      await AsyncStorage.removeItem('userData'); 
      await AsyncStorage.removeItem('userAvatar'); 

      // Verifica se existe o avatar salvo e mantém até que o usuário faça login novamente
      if (avatar) {
        await AsyncStorage.setItem('userAvatar', avatar); 
      }

      // Redireciona para a tela de login
      navigation.replace('Login'); 

    } catch (error) {
      console.error('Erro ao sair:', error);
      Alert.alert('Erro', 'Não foi possível sair da conta.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Usuário</Text>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/128/1144/1144760.png' }}
          style={styles.profileIcon}
        />
      </View>

      {/* Avatar e Nome */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: fotoPerfil || 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png' }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{userData.username || 'Carregando...'}</Text>
      </View>

      {/* Cartão de opções */}
      <View style={styles.card}>
        {/* Carrossel */}
        <Option
          label="Escolher avatar"
          icon="https://cdn-icons-png.flaticon.com/128/847/847969.png"
          expanded={openSection === 'avatar'}
          onPress={() => toggleSection('avatar')}
        >
          <View style={styles.carouselContainer}>
            <TouchableOpacity
              onPress={() =>
                scrollRef.current?.scrollTo({ x: Math.max(scrollX - 100, 0), animated: true })
              }
            >
              <AntDesign name="leftcircleo" size={28} color="#000" />
            </TouchableOpacity>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              ref={scrollRef}
              onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
              scrollEventThrottle={16}
              style={styles.avatarScroll}
            >
              {avataresFutebol.map((url, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => selecionarIcone(url)}
                  style={styles.avatarOptionWrapper}
                >
                  {fotoPerfil === url ? (
                    <View style={styles.selectedCircle}>
                      <Image source={{ uri: url }} style={styles.avatarOptionImage} />
                    </View>
                  ) : (
                    <Image source={{ uri: url }} style={styles.avatarOptionImage} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => scrollRef.current?.scrollTo({ x: scrollX + 100, animated: true })}
            >
              <AntDesign name="rightcircleo" size={28} color="#000" />
            </TouchableOpacity>
          </View>
        </Option>

        {/* Alterar Informações */}
        <Option
          label="Alterar informações"
          icon="https://cdn-icons-png.flaticon.com/128/1250/1250615.png"
          expanded={openSection === 'alterar'}
          onPress={() => toggleSection('alterar')}
        >
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>novo nome</Text>
            <TextInput
              style={styles.inputFlex}
              placeholder="Digite seu novo nome"
              placeholderTextColor="#888"
              value={userData.username}
              onChangeText={(text) => setUserData({ ...userData, username: text })}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>nova gmail</Text>
            <TextInput
              style={styles.inputFlex}
              placeholder="Digite seu novo e-mail"
              placeholderTextColor="#888"
              keyboardType="email-address"
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>nova senha</Text>
            <View style={styles.inputFlexContainer}>
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                <Feather name={mostrarSenha ? 'eye-off' : 'eye'} size={20} color="#666" />
              </TouchableOpacity>
              <TextInput
                style={styles.inputField}
                placeholder="Digite sua nova senha"
                placeholderTextColor="#888"
                secureTextEntry={!mostrarSenha}
                value={userData.password}
                onChangeText={(text) => setUserData({ ...userData, password: text })}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateUser}>
            <Text style={styles.saveButtonText}>Salvar alterações</Text>
          </TouchableOpacity>
        </Option>

        {/* Outras opções */}
        <Option
          label="E-mail"
          icon="https://cdn-icons-png.flaticon.com/128/561/561127.png"
          expanded={openSection === 'email'}
          onPress={() => toggleSection('email')}
        >
          <Text style={styles.subOption}>Seu e-mail: {userData.email || '...'}</Text>
        </Option>

        <Option
          label="Senha"
          icon="eye"
          iconType="Feather"
          expanded={openSection === 'senha'}
          onPress={() => toggleSection('senha')}
        >
          <Text style={styles.subOption}>Sua senha: {userData.password || '••••••'}</Text>
        </Option>

        <Option
          label="Suporte"
          icon="help-circle"
          iconType="Feather"
          expanded={openSection === 'suporte'}
          onPress={() => toggleSection('suporte')}
        >
          <TouchableOpacity onPress={() => Linking.openURL('https://rnms14.wixsite.com/my-site-2')}>
            <Text style={[styles.subOption, { color: 'blue', textDecorationLine: 'underline' }]}>
              Quem somos
            </Text>
          </TouchableOpacity>
          <Text style={styles.subOption}>Contato: playscout@gmail.com</Text>
          <Text style={styles.subOption}>Política</Text>
        </Option>

        {/* Botão Sair */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Option({ icon, iconType, label, expanded, onPress, children }) {
  const isUrl = icon?.startsWith('http');
  const IconComponent = {
    FontAwesome5,
    Ionicons,
    MaterialIcons,
    Feather,
  }[iconType || 'FontAwesome5'];

  return (
    <View style={{ marginBottom: 15 }}>
      <TouchableOpacity style={styles.optionRow} onPress={onPress}>
        {isUrl ? (
          <Image source={{ uri: icon }} style={styles.optionIcon} />
        ) : (
          <IconComponent name={icon} size={24} color="#000" style={{ marginRight: 10 }} />
        )}
        <Text style={styles.optionLabel}>{label}</Text>
      </TouchableOpacity>
      {expanded && <View style={styles.expandedContent}>{children}</View>}
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
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    tintColor: '#fff',
    backgroundColor: '#444',
  },
  avatarContainer: { alignItems: 'center', marginBottom: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarOptionWrapper: { marginHorizontal: 8, borderRadius: 30 },
  selectedCircle: {
    backgroundColor: '#fff',
    borderRadius: 35,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOptionImage: { width: 60, height: 60, borderRadius: 30 },
  userName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  optionRow: { flexDirection: 'row', alignItems: 'center' },
  optionIcon: { width: 24, height: 24, marginRight: 10 },
  optionLabel: { fontSize: 16, color: '#000', fontWeight: '500' },
  expandedContent: { marginTop: 10, paddingLeft: 34 },
  subOption: { fontSize: 18, color: '#333', marginBottom: 5 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  inputLabel: {
    width: 80,
    fontSize: 14,
    color: '#555',
    textTransform: 'lowercase',
    marginRight: 10,
  },
  inputFlex: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#000',
  },
  inputFlexContainer: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingVertical: 8,
    paddingRight: 10,
    paddingLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputField: { flex: 1, color: '#000', paddingLeft: 10 },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarScroll: {
    maxHeight: 80,
    marginHorizontal: 10,
  },
  logoutButton: {
    backgroundColor: 'red',  // Cor de fundo vermelha
    paddingVertical: 10,      // Padding vertical
    borderRadius: 8,         // Bordas arredondadas
    alignItems: 'center',    // Alinha o texto no centro
    marginTop: 20,           // Espaçamento superior
  },
  logoutButtonText: {
    color: '#fff',           // Cor do texto (branco)
    fontWeight: 'bold',      // Negrito no texto
  },
});
