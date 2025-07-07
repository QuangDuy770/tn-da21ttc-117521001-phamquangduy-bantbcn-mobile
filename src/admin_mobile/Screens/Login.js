import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../config'; // Ensure the correct URL is set
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Hàm xử lý đăng nhập
  const onSubmitHandler = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/user/admin`, { email, password });

      if (response.data.success) {
        const token = response.data.token;

        // Log the token to the console to verify it's correct
        console.log('Token received: ', token);

        await AsyncStorage.setItem('userToken', token); // Lưu token vào AsyncStorage

        // Chuyển đến màn hình Main (BottomTabs)
        navigation.replace('Main');
      } else {
        Alert.alert('Error', response.data.message); // Thông báo lỗi nếu đăng nhập không thành công
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message); // Thông báo lỗi nếu có sự cố
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Admin Panel</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.button} onPress={onSubmitHandler}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  card: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#008E97',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Login;
