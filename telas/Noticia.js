import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function Noticia({ route, navigation }) {
  const { url } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>Fechar</Text>
      </TouchableOpacity>
      <WebView source={{ uri: url }} />
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    height: 50,
    backgroundColor: '#1565c0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
 