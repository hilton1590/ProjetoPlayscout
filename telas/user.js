import {
  AntDesign,
  Feather,
  FontAwesome5, Ionicons, MaterialIcons,
} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
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
} from 'react-native';

// Ativa animações no Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function UserScreen({ navigation }) {
  const [userData, setUserData] = useState({});
  const [openSection, setOpenSection] = useState('');

  useEffect(() => {
    async function loadUserData() {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          const parsed = JSON.parse(data);
          setUserData(parsed);
        }
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

  const handleUpdateUser = async () => {
    try {
      console.log('Atualizando usuário:', userData); // Verificação de ID

      const response = await axios.patch(`http://localhost:3000/users/${userData.id}`, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });

      await AsyncStorage.setItem('userData', JSON.stringify(response.data));
      Alert.alert('Sucesso', 'Informações atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Alert.alert('Erro', 'Não foi possível atualizar as informações.');
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

      {/* Avatar + nome */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} />
        <Text style={styles.userName}>{userData.username || 'Carregando...'}</Text>
        <Text style={styles.favorito}>
          {userData.favorito ? `Time favorito: ${userData.favorito}` : 'Nenhum time favorito'}
        </Text>
      </View>

      {/* Bloco de opções */}
      <View style={styles.card}>
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
            <TextInput
              style={styles.inputFlex}
              placeholder="Digite sua nova senha"
              placeholderTextColor="#888"
              secureTextEntry
              value={userData.password}
              onChangeText={(text) => setUserData({ ...userData, password: text })}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateUser}>
            <Text style={styles.saveButtonText}>Salvar alterações</Text>
          </TouchableOpacity>
        </Option>

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
  userName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  favorito: { color: '#ccc', fontSize: 16, marginTop: 4 },

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
  expandedContent: {
    marginTop: 10,
    paddingLeft: 34,
  },
  subOption: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

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

  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
});