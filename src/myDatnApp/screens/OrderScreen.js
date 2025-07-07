import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Modal from 'react-native-modal';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from '../config';
import * as Linking from 'react-native';
import { Alert } from 'react-native';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { useRoute } from '@react-navigation/native';



const OrderScreen = () => {
  const navigation = useNavigation();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [shippingFee, setShippingFee] = useState(5000);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const route = useRoute();


  const fetchAddresses = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await axios.post(`${BACKEND_URL}/api/address/get`, { userId });
      if (res.data.success) {
        setUserAddresses(res.data.address || []);
      }
    } catch (err) {
      console.error('Lỗi khi fetch address:', err);
    }
  };

  const sendOrderEmail = async (email, orderDetails) => {
    try {
      await axios.post(`${BACKEND_URL}/api/order/send-email`, {
        email,
        orderDetails,
      });
    } catch (err) {
      console.error('Lỗi gửi email:', err);
    }
  };


  const fetchCartItems = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const resCart = await axios.post(`${BACKEND_URL}/api/cart/get`, { userId });
      const resProducts = await axios.get(`${BACKEND_URL}/api/product/list`);
      const allProducts = resProducts.data.products;
      const cartData = resCart.data.cartData || {};

      const items = Object.keys(cartData).map(productId => {
        const product = allProducts.find(p => p._id === productId);
        return product ? { ...product, quantity: cartData[productId] } : null;
      }).filter(Boolean);

      setCartItems(items);
    } catch (err) {
      console.error('Lỗi khi load giỏ hàng:', err);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const removeAddress = async (addressId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await axios.post(`${BACKEND_URL}/api/address/remove`, { userId, addressId });
      if (res.data.success) {
        fetchAddresses();
      }
    } catch (err) {
      console.error('❌ Lỗi khi xoá địa chỉ:', err);
    }
  };

  const handleSelectAddress = async (address) => {
    setSelectedAddress(address);
    await AsyncStorage.setItem('selectedAddress', JSON.stringify(address));
    setModalVisible(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("⚠️ Lưu ý", "Vui lòng chọn địa chỉ giao hàng trước khi đặt hàng.");
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      const amount = calculateTotal() + shippingFee;

      // Lấy các item được chọn từ CartScreen truyền sang qua route
      const selectedItems = route.params?.selectedItems || [];
      const orderData = {
        userId,
        items: selectedItems,
        amount,
        address: selectedAddress,
      };

      if (paymentMethod === 'COD') {
        const res = await axios.post(`${BACKEND_URL}/api/order/place`, {
          ...orderData,
          paymentMethod: 'COD',
          payment: false,
        });

        if (res.data.success) {
          await sendOrderEmail(selectedAddress.email, orderData);

          // ❗ Xoá các sản phẩm đã đặt khỏi giỏ hàng
          await axios.post(`${BACKEND_URL}/api/cart/removemulti`, {
  userId,
  itemIds: selectedItems.map(item => typeof item === 'string' ? item : item._id.toString()), // ✅ đúng
});



          Alert.alert("✅ Thành công", "Đặt hàng thành công (COD)!");
          navigation.navigate("place");
        } else {
          Alert.alert("❌ Thất bại", "Không thể đặt hàng. Vui lòng thử lại.");
        }

      } else if (paymentMethod === 'Stripe') {
        const { data } = await axios.post(`${BACKEND_URL}/api/order/stripe`, {
          amount
        });

        const init = await initPaymentSheet({
          paymentIntentClientSecret: data.clientSecret,
          merchantDisplayName: 'Kho Tài Khoản'
        });

        if (init.error) return Alert.alert("❌ Lỗi", init.error.message);

        const result = await presentPaymentSheet();

        if (result.error) return Alert.alert("❌ Thanh toán thất bại", result.error.message);

        const res = await axios.post(`${BACKEND_URL}/api/order/place`, {
          ...orderData,
          paymentMethod: 'Stripe',
          payment: true
        });

        if (res.data.success) {
          await sendOrderEmail(selectedAddress.email, orderData);

          // ❗ Xoá các sản phẩm đã đặt khỏi giỏ hàng
         await axios.post(`${BACKEND_URL}/api/cart/removemulti`, {
          
  userId,
  itemIds: selectedItems.map(item => typeof item === 'string' ? item : item._id.toString()), // ✅ đúng
});



          Alert.alert("✅ Thành công", "Thanh toán và đặt hàng thành công!");
          navigation.navigate("place");
        } else {
          Alert.alert("❌ Đặt hàng thất bại", res.data.message);
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert("⚠️ Lỗi", "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.");
    }
  };


  useEffect(() => {
    const selected = route.params?.selectedItems || [];
    console.log("✅ [OrderScreen] Nhận selectedItems:", selected.map(item => item._id));
    setCartItems(selected);

  }, []);


  useEffect(() => {
    const loadSelectedItems = () => {
      const selected = route.params?.selectedItems || [];
      setCartItems(selected);
    };

    const loadSelectedAddress = async () => {
      const saved = await AsyncStorage.getItem('selectedAddress');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedAddress(parsed);
      }
    };

    loadSelectedItems();
    loadSelectedAddress();
  }, []);


  useEffect(() => {
    if (modalVisible) fetchAddresses();
  }, [modalVisible]);

return (
  <ScrollView 
    style={{ flex: 1, padding: 20 }}
    contentContainerStyle={{ paddingBottom: 140 }}
  >
      <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Địa chỉ giao hàng:</Text>
      {selectedAddress ? (
        <View style={styles.addressBox}>
          <Text>👤 {selectedAddress.firstName} {selectedAddress.lastName}</Text>
          <Text>📧 {selectedAddress.email}</Text>  {/* Dòng này mới thêm */}
          <Text>📍 {selectedAddress.street}, {selectedAddress.city}</Text>
          <Text>🌎 {selectedAddress.state}, {selectedAddress.country}</Text>
          <Text>📞 {selectedAddress.phone}</Text>
        </View>

      ) : (
        <Text style={{ marginTop: 10, color: 'gray' }}>Chưa chọn địa chỉ nào</Text>
      )}

      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.changeAddressBtn}>
        <Text style={{ color: '#0066b2' }}>🔁 Chọn hoặc thêm địa chỉ</Text>
      </TouchableOpacity>

      <View style={styles.summaryBox}>
        <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
        <View style={{ marginTop: -5 }}>
          {/* Dòng sản phẩm */}
          {cartItems.map((item) => (
            <View key={item._id} style={styles.rowBetween}>
              {/* Cột Tên sản phẩm */}
              <Text style={[styles.rowLabel, { flex: 2, textAlign: 'left' }]}>
                {item.name}
              </Text>
              {/* Cột Số lượng */}
              <Text style={[styles.rowLabel, { flex: 1, textAlign: 'center' }]}>
                x{item.quantity}
              </Text>
              {/* Cột Giá */}
              <Text style={[styles.rowValue, { textAlign: 'right', flex: 2 }]}>
                {(item.price * item.quantity).toLocaleString()}đ
              </Text>
            </View>
          ))}

          {/* Dòng Phí giao hàng */}
          <View style={styles.rowBetween}>
            <Text style={[styles.rowLabel, { flex: 2 }]}>Phí giao hàng:</Text>
            <Text style={[styles.rowValue, { flex: 2, textAlign: 'right' }]}>
              {shippingFee.toLocaleString()}đ
            </Text>
          </View>

          {/* Dòng Tổng thanh toán */}
          <View style={styles.rowBetween}>
            <Text style={[styles.rowLabel, { flex: 2, fontWeight: 'bold' }]}>Tổng thanh toán:</Text>
            <Text style={[styles.totalPrice, { textAlign: 'right', flex: 2 }]}>
              {(calculateTotal() + shippingFee).toLocaleString()}đ
            </Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={styles.sectionTitle}>Phương thức thanh toán:</Text>

        <Pressable onPress={() => setPaymentMethod('COD')} style={[styles.paymentBox, { backgroundColor: 'white', borderColor: 'black' }]}>
          <View style={styles.rowBetween}>
            <Text style={{ color: paymentMethod === 'COD' ? '#27ae60' : '#333' }}>(COD) Thanh toán khi nhận hàng</Text>
            {paymentMethod === 'COD' && <Text style={{ color: '#27ae60' }}>✔️</Text>}
          </View>
        </Pressable>

        <Pressable onPress={() => setPaymentMethod('Stripe')} style={[styles.paymentBox, { backgroundColor: 'white', borderColor: 'black' }]}>
          <View style={styles.rowBetween}>
            <Image source={require('../assets/Stripe.png')} style={{ width: 60, height: 20 }} />
            <Text style={{ color: paymentMethod === 'Stripe' ? '#27ae60' : '#333' }}>
              Thanh toán qua Stripe
            </Text>
            {paymentMethod === 'Stripe' && <Text style={{ color: '#27ae60' }}>✔️</Text>}
          </View>
        </Pressable>
      </View>

      <TouchableOpacity
        style={[styles.orderButton, { backgroundColor: 'white', borderWidth: 2, borderColor: '#27ae60' }]}
        onPress={handlePlaceOrder}
      >
        <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 16 }}>📦 Đặt hàng</Text>
      </TouchableOpacity>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        swipeDirection={['up', 'down']}
        onBackButtonPress={() => setModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropColor="rgba(0, 0, 0, 0.5)"
      >
        <View style={styles.modalContent}>
          <Text style={{ fontSize: 16, fontWeight: '500' }}>Chọn địa chỉ giao hàng</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
            {userAddresses.map((address, index) => {
              const isSelected = selectedAddress && selectedAddress._id === address._id;
              return (
                <Pressable
                  key={index}
                  onPress={() => handleSelectAddress(address)}
                  style={{
                    width: 140,
                    height: 160,
                    borderWidth: 2,
                    borderColor: isSelected ? '#27ae60' : '#D0D0D0',
                    backgroundColor: isSelected ? '#eaffea' : '#f9f9f9',
                    padding: 10,
                    marginRight: 10,
                    borderRadius: 10,
                    position: 'relative',
                    justifyContent: 'center',
                  }}
                >
                  <Pressable
                    onPress={() => removeAddress(address._id)}
                    style={{ position: 'absolute', top: 6, right: 6 }}
                  >
                    <AntDesign name="closecircle" size={18} color="red" />
                  </Pressable>
                  <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>{address.firstName} {address.lastName}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 13, color: '#333' }}>📧 {address.email}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 13, color: '#333' }}>📍 {address.street}, {address.city}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 13, color: '#333' }}>🌎 {address.state}, {address.country}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 13, color: '#333' }}>📞 {address.phone}</Text>

                  {isSelected && (
                    <Text style={{ color: '#27ae60', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>✅ Đang chọn</Text>
                  )}
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("Address");
              }}
              style={{
                width: 140,
                height: 160,
                borderColor: '#D0D0D0',
                marginRight: 10,
                borderWidth: 2,
                padding: 10,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                backgroundColor: '#ffffff',
              }}
            >
              <Text style={{ fontSize: 14, textAlign: 'center', color: '#0066b2', fontWeight: '500' }}>➕ Thêm địa chỉ mới</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    height: 400,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#13274F',
  },
  addressBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  changeAddressBtn: {
    marginTop: 15,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'black',
  },
  // Cập nhật summaryBox để không tràn khung
  summaryBox: {
    backgroundColor: '#fff',
    padding: 20,  // Tăng padding cho khung summary
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 1,
    marginTop: 15,
    flex: 1,  // Đảm bảo phần này có thể tự động mở rộng chiều cao khi cần thiết
    marginBottom: 20, // Tạo khoảng cách dưới cho phần này
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  rowLabel: {
    fontSize: 14,
    color: '#333',
  },
  rowValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  paymentBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  orderButton: {
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Style cho tổng thanh toán
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginTop: 10,
  },
});


