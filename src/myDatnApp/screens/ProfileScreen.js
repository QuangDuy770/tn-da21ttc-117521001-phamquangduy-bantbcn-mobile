import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import { BACKEND_URL } from '../config';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // <- để khi bấm vào Tab này mới chạy lại
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginAndFetch = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setUserInfo(null);
        setLoading(false);
        Alert.alert(
          'Bạn chưa đăng nhập',
          'Vui lòng đăng nhập để xem thông tin tài khoản.',
          [
            { text: 'Huỷ' },
            { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
          ]
        );
        return;
      }

      try {
        const res = await axios.post(`${BACKEND_URL}/api/user/info`, { userId });
        if (res.data.success) {
          setUserInfo(res.data.user);
        } else {
          setUserInfo(null);
        }
      } catch (err) {
        console.log('❌ Lỗi kết nối API:', err.message);
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      checkLoginAndFetch();
    }
  }, [isFocused]);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    Alert.alert('✅ Đã đăng xuất');
    navigation.replace('Main'); // về lại BottomTabs
  };

  const handleViewOrders = () => {
    if (!userInfo) {
      Alert.alert(
        'Bạn chưa đăng nhập',
        'Vui lòng đăng nhập để xem đơn hàng.',
        [
          { text: 'Huỷ' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
        ]
      );
    } else {
      navigation.navigate('place');
    }
  };

  const handleViewAccountInfo = () => {
    if (!userInfo) {
      Alert.alert(
        'Bạn chưa đăng nhập',
        'Vui lòng đăng nhập để xem thông tin tài khoản.',
        [
          { text: 'Huỷ' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
        ]
      );
    } else {
      navigation.navigate('info', { userInfo });
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>{userInfo?.name || 'Guest'}</Text>
      </View>

      <View style={styles.optionsList}>
        {userInfo && (
          <>
            <TouchableOpacity style={styles.optionItem} onPress={handleViewOrders}>
              <Text style={styles.optionText}>🛒 Xem đơn hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={handleViewAccountInfo}>
              <Text style={styles.optionText}>📝 Thông tin tài khoản</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('CSKH')}>
              <Text style={styles.optionText}>📞 Liên hệ CSKH</Text>
            </TouchableOpacity>

          </>
        )}

        {userInfo && (
          <TouchableOpacity
            style={[styles.optionItem, { backgroundColor: '#ffeded' }]}
            onPress={handleLogout}
          >
            <Text style={[styles.optionText, { color: '#e74c3c' }]}>🚪 Đăng xuất</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: 50,
    marginBottom: 30,
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  optionsList: {
    marginHorizontal: 20,
  },
  optionItem: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
});
