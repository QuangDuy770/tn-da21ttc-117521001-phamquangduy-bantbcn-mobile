import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BACKEND_URL } from '../config';

const InfoScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState(route.params?.userInfo || null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      try {
        const res = await axios.post(`${BACKEND_URL}/api/user/get`, { userId });
        if (res.data.success) {
          setUserInfo(res.data.user);
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin người dùng:', err);
      }
    };

    if (!userInfo) {
      fetchUserInfo();
    }
  }, []);

  if (!userInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.noInfoText}>Không có thông tin người dùng.</Text>
        <Pressable
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>👉 Đăng nhập ngay</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Thông tin tài khoản</Text>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Mã ID:</Text>
          <Text style={styles.value}>{userInfo._id}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Tên:</Text>
          <Text style={styles.value}>{userInfo.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{userInfo.email}</Text>
        </View>
      </View>
    </View>
  );
};

export default InfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  noInfoText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 100,
  },
  loginButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  loginButtonText: {
    color: '#27ae60',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    width: '100%',
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
});
