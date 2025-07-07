import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';


const PlaceOrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('newest'); // mặc định là "newest"
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' mặc định


  const navigation = useNavigation();

  const handleCancelOrder = async (orderId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await axios.post(`${BACKEND_URL}/api/order/huyOrder`, {
        orderId,
        userId,
      });
      if (res.data.success) {
        alert('Đã hủy đơn thành công!');
        fetchOrders();
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      alert(error.message);
    }
  };



  const fetchOrders = async (filter = statusFilter, sort = sortOrder) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await axios.post(`${BACKEND_URL}/api/order/userorders`, { userId });
      if (res.data.success) {
        let data = res.data.orders;

        // ✅ Lọc trạng thái
        if (filter !== 'all') {
          data = data.filter((order) => order.status === filter);
        }

        // ✅ Sắp xếp ngày
        data = data.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return sort === 'newest' ? dateB - dateA : dateA - dateB;
        });
        setOrders(data);
      } else {
        console.log('❌ Lỗi khi lấy danh sách đơn hàng:', res.data.message);
      }
    } catch (err) {
      console.log('❌ Lỗi kết nối API:', err.message);
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Main', { screen: 'Home' })}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>🏠</Text>
      </TouchableOpacity>



      <Text style={styles.title}>🛒 Đơn hàng của bạn</Text>

      {/* 👇 Bộ trạng thái dạng nút vuốt ngang */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusMenu}
      >
        {[
          { label: 'Tất cả', value: 'all' },
          { label: 'Sẵn sàng', value: 'Sẵn sàng giao hàng' },
          { label: 'Đang vận chuyển', value: 'Đang vận chuyển' },
          { label: 'Đã giao hàng', value: 'Đã giao hàng' },
          { label: 'Hủy đơn', value: 'Hủy đơn' },
        ].map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.statusButton,
              statusFilter === item.value && styles.statusButtonActive,
            ]}
            onPress={async () => {
              setStatusFilter(item.value);
              setLoading(true);
              await fetchOrders(item.value, sortOrder);
            }}

          >
            <Text
              style={[
                styles.statusButtonText,
                statusFilter === item.value && styles.statusButtonTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>


      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.refreshButtonSmall}
          onPress={() => {
            setLoading(true);
            fetchOrders();
          }}
        >
          <Text style={styles.refreshButtonTextSmall}>🔄 Tải lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            sortOrder === 'newest' && styles.filterButtonActive,
          ]}
          onPress={async () => {
            setSortOrder('newest');
            setLoading(true);
            await fetchOrders(statusFilter, 'newest');
          }}

        >
          <Text style={sortOrder === 'newest' ? styles.filterButtonTextActive : styles.filterButtonText}>
            Mới nhất
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            sortOrder === 'oldest' && styles.filterButtonActive,
          ]}
          onPress={async () => {
            setSortOrder('oldest');
            setLoading(true);
            await fetchOrders(statusFilter, 'oldest');
          }}

        >
          <Text style={sortOrder === 'oldest' ? styles.filterButtonTextActive : styles.filterButtonText}>
            Cũ nhất
          </Text>
        </TouchableOpacity>


      </View>




      {orders.length === 0 ? (
        <Text style={styles.noOrderText}>Bạn chưa có đơn hàng nào.</Text>
      ) : (
        orders.map((order) => (
          <View key={order._id} style={styles.orderCard}>
            {/* Mã đơn + Nút Hủy */}
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Mã đơn: {order._id.slice(-8).toUpperCase()}</Text>
              {order.status !== 'Đã giao hàng' && order.status !== 'Hủy đơn' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelOrder(order._id)}
                >
                  <Text style={styles.cancelButtonText}>Hủy đơn</Text>
                </TouchableOpacity>
              )}

            </View>

            <View style={styles.productsGrid}>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <View key={idx} style={styles.productBox}>
                    <Image
                      source={{ uri: item?.image?.[0] || 'https://via.placeholder.com/60' }}
                      style={styles.productImage}
                    />
                    <Text numberOfLines={1} style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productBrand}>Thương hiệu: {item.thuongHieu || 'N/A'}</Text>
                    <Text style={styles.productInfo}>{item.thongTin || 'Không có mô tả.'}</Text>
                    <Text style={styles.productQuantity}>SL: {item.quantity}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ fontStyle: 'italic', color: '#888' }}>Không có sản phẩm.</Text>
              )}
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Thanh toán:</Text>
              <Text style={styles.value}>{order.paymentMethod}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Tổng tiền:</Text>
              <Text style={[styles.value, { fontWeight: 'bold', color: '#e74c3c' }]}>
                {order.amount.toLocaleString()}đ
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Ngày đặt:</Text>
              <Text style={styles.value}>
                {new Date(order.date).toLocaleDateString('vi-VN')}
              </Text>
            </View>

            <View
              style={[
                styles.statusRow,
                {
                  backgroundColor:
                    order.status === 'Đã giao hàng' ? '#E8F8F5' : '#FEF5E7',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: order.status === 'Đã giao hàng' ? '#27ae60' : '#e67e22',
                  },
                ]}
              >
                {order.status}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.checkButton}
                onPress={() => {
                  setLoading(true);
                  fetchOrders();
                }}
              >
                <Text style={styles.checkButtonText}>🔍 Kiểm tra đơn</Text>
              </TouchableOpacity>

              {order.status === 'Đã giao hàng' && (
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => {
                    navigation.navigate('review', { orderId: order._id }); // 🎯 TRUYỀN orderId SANG ReviewScreen
                  }}
                >
                  <Text style={styles.reviewButtonText}>⭐ Đánh giá</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

        ))
      )}
    </ScrollView>
  );
};

export default PlaceOrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#13274F',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 35,
  },
  noOrderText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 50,
  },
  orderCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderId: {
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 12,
    fontSize: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  productBox: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 6,
    marginBottom: 5,
    backgroundColor: '#eee',
  },
  productName: {
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 2,
    color: '#333',
  },
  productBrand: {
    fontSize: 11,
    color: '#777',
  },
  productInfo: {
    fontSize: 11,
    color: '#999',
  },
  productQuantity: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  label: {
    fontSize: 15,
    color: '#555',
  },
  value: {
    fontSize: 15,
    color: '#333',
  },
  statusRow: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
    gap: 10,
  },
  checkButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 8,
    borderColor: '#3498db',
    borderWidth: 1.5,
    alignItems: 'center',
  },
  checkButtonText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  reviewButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 8,
    borderColor: '#e67e22',
    borderWidth: 1.5,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#e67e22',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },

  refreshButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#27ae60',
    borderRadius: 8,
    marginBottom: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButtonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#27ae60',
    marginHorizontal: 5,
  },
  refreshButtonTextSmall: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27ae60',
    marginHorizontal: 5,
    backgroundColor: '#f9f9f9',
  },
  filterButtonActive: {
    backgroundColor: '#27ae60',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
  },
  filterButtonTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusMenu: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27ae60',
    margin: 4,
    backgroundColor: '#f9f9f9',
  },
  statusButtonActive: {
    backgroundColor: '#27ae60',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
  },
  statusButtonTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },


});
