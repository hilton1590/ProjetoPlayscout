import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './telas/login';
import Cadastro from './telas/cadastro';
import MenuPrincipal from './telas/menuPrincipal';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="MenuPrincipal" component={MenuPrincipal} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
