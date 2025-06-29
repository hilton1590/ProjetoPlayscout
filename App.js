import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './telas/login';
import Cadastro from './telas/cadastro';
import MenuPrincipal from './telas/menuPrincipal';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="MenuPrincipal" component={MenuPrincipal} />
        {/* Futuras telas, só descomentar e criar depois */}
        {/* <Stack.Screen name="Calendario" component={Calendario} /> */}
        {/* <Stack.Screen name="Torneios" component={Torneios} /> */}
        {/* <Stack.Screen name="Notificacoes" component={Notificacoes} /> */}
        {/* <Stack.Screen name="Estatisticas" component={Estatisticas} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
