import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { BACKEND_URL } from '../config';

const ReviewScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params || {}; // Chỉ cần truyền orderId

  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchOrderDetail = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await axios.post(`${BACKEND_URL}/api/order/userorders`, { userId });

      if (res.data.success) {
        const foundOrder = res.data.orders.find(o => o._id === orderId);
        setOrder(foundOrder);
      } else {
        Alert.alert('❌ Lỗi', res.data.message || 'Không tìm thấy đơn hàng.');
      }
    } catch (err) {
      console.error('❌ API Error:', err.message);
      Alert.alert('❌ Lỗi', 'Không thể tải đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, []);

  const handleStarPress = (star) => {
    setRating(star);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('⚠️ Vui lòng chọn số sao!');
      return;
    }
  
    try {
      setSubmitting(true);
      const res = await axios.post(`${BACKEND_URL}/api/review/${orderId}/add`, {
        rating,
        comment,
      });
  
      if (res.data.message) {
        Alert.alert('🎉', res.data.message, [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Main', { screen: 'Home' }), // 👉 chuyển thẳng về HomeScreen
          },
        ]);
      }      
    } catch (err) {
      console.error('❌ Error submitting review:', err.message);
      Alert.alert('❌ Lỗi', 'Không thể gửi đánh giá.');
    } finally {
      setSubmitting(false);
    }
  };
  

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy đơn hàng.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛍️ Đánh giá đơn hàng</Text>

      <View style={styles.productsGrid}>
        {order.items.map((item, idx) => (
          <View key={idx} style={styles.productBox}>
            <Image
              source={{ uri: item?.image?.[0] || 'https://via.placeholder.com/60' }}
              style={styles.productImage}
            />
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.subTitle}>⭐ Đánh giá số sao</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
            <Text style={[styles.star, rating >= star && { color: '#f1c40f' }]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subTitle}>✍️ Bình luận</Text>
      <TextInput
        style={styles.input}
        placeholder="Viết nhận xét của bạn..."
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmitReview}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>{submitting ? 'Đang gửi...' : 'Gửi đánh giá'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#13274F',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10,
  },
  productBox: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginBottom: 5,
  },
  productName: {
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c3e50',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  star: {
    fontSize: 32,
    color: '#ccc',
    marginHorizontal: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
