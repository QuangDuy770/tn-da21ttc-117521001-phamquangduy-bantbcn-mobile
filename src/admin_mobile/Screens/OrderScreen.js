import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BACKEND_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [token, setToken] = useState(null);
  const [filter, setFilter] = useState(''); // Track the selected filter
  const [sortOrder, setSortOrder] = useState('newest');


  const applyFilterAndSort = (selectedFilter, order, data) => {
    let result = [...data];
    if (selectedFilter) {
      result = result.filter(order => order.status === selectedFilter);
    }
    result.sort((a, b) =>
      order === 'newest'
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );
    return result;
  };


  const getToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy token');
    }
  };

  const fetchAllOrders = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await axios.post(BACKEND_URL + '/api/order/list', {}, { headers: { token } });
      if (response.data.success) {
        setOrders(response.data.orders);
        setFilteredOrders(response.data.orders); // Set initial filtered orders to all orders
      } else {
        Alert.alert("Lỗi", response.data.message);
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    }
  };

  const updateOrderStatus = async (status, orderId) => {
    try {
      const response = await axios.post(BACKEND_URL + '/api/order/status', { orderId, status }, { headers: { token } });
      if (response.data.success) {
        Alert.alert("Thành công", `Trạng thái đơn hàng đã được cập nhật thành ${status}`);
        fetchAllOrders(); // Re-fetch orders after updating status
      } else {
        Alert.alert("Lỗi", response.data.message);
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    }
  };

  const handleFilterChange = (selectedStatus) => {
    setFilter(selectedStatus);
    if (selectedStatus === '') {
      setFilteredOrders(orders); // Show all orders if no filter is selected
    } else {
      const filtered = orders.filter(order => order.status === selectedStatus);
      setFilteredOrders(filtered);
    }
  };
  useEffect(() => {
    const updated = applyFilterAndSort(filter, sortOrder, orders);
    setFilteredOrders(updated);
  }, [orders, filter, sortOrder]);


  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchAllOrders();
    }
  }, [token]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Trang Đặt Hàng</Text>

      {/* Filter Section with Buttons */}
      <View style={styles.filterContainer}>
        {/* "Tất cả" Button on a new row */}
        {/* Hàng Bộ Lọc Chung */}
        <View style={styles.allButtonContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => handleFilterChange('')}
          >
            <Text style={styles.filterButtonText}>Tất cả</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              sortOrder === 'newest' && styles.selectedButton,
            ]}
            onPress={() => setSortOrder('newest')}
          >
            <Text style={styles.filterButtonText}>Mới nhất</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              sortOrder === 'oldest' && styles.selectedButton,
            ]}
            onPress={() => setSortOrder('oldest')}
          >
            <Text style={styles.filterButtonText}>Cũ nhất</Text>
          </TouchableOpacity>
        </View>


        {/* Filter Section with Horizontal Scroll */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContainer}
          >
            <TouchableOpacity style={styles.filterButton} onPress={() => handleFilterChange('')}>
              <Text style={styles.filterButtonText}>Tất cả</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton} onPress={() => handleFilterChange('Sẵn sàng giao hàng')}>
              <Text style={styles.filterButtonText}>Sẵn sàng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton} onPress={() => handleFilterChange('Đang vận chuyển')}>
              <Text style={styles.filterButtonText}>Vận chuyển</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton} onPress={() => handleFilterChange('Đã giao hàng')}>
              <Text style={styles.filterButtonText}>Đã giao</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton} onPress={() => handleFilterChange('Hủy đơn')}>
              <Text style={styles.filterButtonText}>Hủy đơn</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>


      </View>

      <View>
        {filteredOrders.map((order, index) => (
          <View style={styles.orderContainer} key={index}>
            <View style={styles.orderInfo}>
              <FontAwesome name="gift" size={50} color="#008E97" style={styles.packageIcon} />
              <View style={styles.orderDetails}>
                <Text style={styles.nameText}>
                  {order.address.lastName + ' ' + order.address.firstName}
                </Text>
                <Text style={styles.addressText}>{order.address.street}, {order.address.city}, {order.address.state}</Text>
                <Text style={styles.phoneText}>{order.address.phone}</Text>
                <Text style={styles.emailText}>{order.address.email}</Text>
                <Text style={styles.itemCount}>Items: {order.items.length}</Text>
                {/* 👇 Hiển thị ngày đặt hàng */}
                <Text style={styles.dateText}>
                  Ngày đặt: {new Date(order.date).toLocaleDateString("vi-VN")} {new Date(order.date).toLocaleTimeString("vi-VN")}
                </Text>

              </View>
            </View>
            <Text style={styles.amountText}>
              Tổng tiền: {order.amount.toLocaleString("vi-VN")} {order.currency}
            </Text>

            {/* Status Update Buttons */}
            {/* Status Update Buttons */}
            {order.status === 'Hủy đơn' ? (
              <Text style={styles.cancelledText}>Hủy đơn</Text>
            ) : (
              <View style={styles.statusWrapper}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    order.status === 'Sẵn sàng giao hàng' && styles.selectedButton,
                  ]}
                  onPress={() => updateOrderStatus('Sẵn sàng giao hàng', order._id)}
                >
                  <Text style={styles.statusButtonText}>Sẵn sàng</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    order.status === 'Đang vận chuyển' && styles.selectedButton,
                  ]}
                  onPress={() => updateOrderStatus('Đang vận chuyển', order._id)}
                >
                  <Text style={styles.statusButtonText}>Vận chuyển</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    order.status === 'Đã giao hàng' && styles.selectedButton,
                  ]}
                  onPress={() => updateOrderStatus('Đã giao hàng', order._id)}
                >
                  <Text style={styles.statusButtonText}>Đã giao</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  filterContainer: {
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  allButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Centers the "Tất cả" button
    marginBottom: 10,
  },
  filterButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Equal spacing for the other buttons
  },
  filterButton: {
    backgroundColor: '#008E97',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 6,
    minWidth: 100,
    alignItems: 'center',
    marginRight: 8, // Adds space between buttons horizontally
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedButton: {
    backgroundColor: '#005F6A',
  },
  orderContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  packageIcon: {
    marginBottom: 10,
    alignSelf: 'center',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderDetails: {
    flex: 1,
    marginLeft: 12,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addressText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  phoneText: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  emailText: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  itemCount: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  productContainer: {
    marginTop: 4,
  },
  productText: {
    fontSize: 14,
    color: '#555',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  statusWrapper: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statusButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedButton: {
    backgroundColor: '#008E97',
  },
  cancelledText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
    marginTop: 12,
  },
  dateText: {
  fontSize: 14,
  color: '#555',
  fontStyle: 'italic',
  marginTop: 4,
},


});

export default Orders;
