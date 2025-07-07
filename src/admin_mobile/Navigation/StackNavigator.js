import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from '../Screens/Login';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import BottomTabs from './BottomTabs';
import Users from '../Screens/Users';
import UpdateScreen from '../Screens/UpdateScreen';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (storedToken) {
        setToken(storedToken); // Set token from AsyncStorage if available
      }
    };
    checkToken();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={token ? 'Main' : 'Login'}>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Users"
          component={Users}
          options={{ headerShown: false }}
        />
          <Stack.Screen
          name="UpdateProduct"
          component={UpdateScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      
    </NavigationContainer>
  );
};

export default StackNavigator;
