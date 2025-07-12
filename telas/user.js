import {
  AntDesign,
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
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

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function UserScreen({ navigation }) {
  const [userData, setUserData] = useState({});
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [openSection, setOpenSection] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      try {
        const data = await AsyncStorage.getItem('userData');
        const foto = await AsyncStorage.getItem('userPhoto');
        if (data) {
          const parsed = JSON.parse(data);
          setUserData(parsed);
        }
        if (foto) {
          setFotoPerfil(foto);
        }
      } catch (e) {
        console.error('Erro ao carregar usuário:', e);
      }
    }
    loadUserData();
  }, []);

  const alterarFotoPerfil = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.6,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;

        // Deleta imagem anterior se for local
        const antigaFoto = await AsyncStorage.getItem('userPhoto');
        if (antigaFoto && antigaFoto.startsWith(FileSystem.documentDirectory)) {
          await FileSystem.deleteAsync(antigaFoto, { idempotent: true });
        }

        // Copia a nova imagem para o armazenamento local (exceto na Web)
        let localUri = imageUri;
        if (Platform.OS !== 'web') {
          const nomeArquivo = imageUri.split('/').pop();
          const novoCaminho = FileSystem.documentDirectory + nomeArquivo;
          await FileSystem.copyAsync({ from: imageUri, to: novoCaminho });
          localUri = novoCaminho;
        }

        setFotoPerfil(localUri);
        await AsyncStorage.setItem('userPhoto', localUri);
        Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      }
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a imagem.');
    }
  };

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSection(openSection === key ? '' : key);
  };

  const handleUpdateUser = async () => {
    try {
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

      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={alterarFotoPerfil}>
          <Image
            source={fotoPerfil ? { uri: fotoPerfil } : require('../assets/default-avatar.png')}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={styles.userName}>{userData.username || 'Carregando...'}</Text>
      </View>

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
  inputField: {
    flex: 1,
    color: '#000',
    paddingLeft: 10,
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
