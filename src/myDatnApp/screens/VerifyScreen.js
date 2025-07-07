import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config';

const VerifyScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const verify = async () => {
      const { success, orderId } = route.params || {};
      const userId = await AsyncStorage.getItem('userId');

      if (!orderId) {
        setStatus('error');
        return;
      }

      try {
        const res = await axios.post(`${BACKEND_URL}/api/order/verifyStripe`, {
          success,
          orderId,
          userId,
        });

        if (res.data.success) {
          setStatus('success');
          setTimeout(() => navigation.replace('Orders'), 2000);
        } else {
          setStatus('error');
          setTimeout(() => navigation.navigate('Cart'), 2000);
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };

    verify();
  }, []);

  return (
    <View style={styles.container}>
      {status === 'loading' && <ActivityIndicator size="large" />}
      {status === 'success' && <Text style={styles.success}>✅ Thanh toán thành công!</Text>}
      {status === 'error' && <Text style={styles.error}>❌ Xác minh thất bại!</Text>}
    </View>
  );
};

export default VerifyScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  success: { fontSize: 20, color: 'green' },
  error: { fontSize: 20, color: 'red' },
});
