import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';


const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleSelectItem = (productId) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllItems = () => {
    const allIds = cartItems.map(item => item._id);
    setSelectedItems(allIds);
  };

  const deselectAllItems = () => {
    setSelectedItems([]);
  };

  const calculateTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item._id))
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Chú ý', 'Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.');
      return;
    }

    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item._id));

    console.log("🛒 [CartScreen] Selected Items gửi đi:", selectedCartItems.map(item => item._id));

    navigation.navigate('Order', { selectedItems: selectedCartItems });


    // 🔥 Kiểm tra nếu tất cả sản phẩm đều được chọn:
    if (selectedCartItems.length === cartItems.length) {
      console.log("Sau thanh toán: Giỏ hàng sẽ trống.");
    } else {
      console.log("Sau thanh toán: Giỏ hàng vẫn còn sản phẩm.");
    }

    navigation.navigate('Order', { selectedItems: selectedCartItems });
  };




  const fetchCart = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert(
          'Bạn chưa đăng nhập',
          'Vui lòng đăng nhập để xem giỏ hàng.',
          [
            { text: 'Huỷ' },
            { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
          ]
        );
        return;
      }

      // 🔥 Bạn thiếu dòng này, thêm vào:
      const resCart = await axios.post(`${BACKEND_URL}/api/cart/get`, { userId });

      if (!resCart.data.success) {
        console.log("❌ Lỗi lấy cart:", resCart.data.message);
        return;
      }

      const cartData = resCart.data.cartData || {};

      const resProducts = await axios.get(`${BACKEND_URL}/api/product/list`);
      const allProducts = resProducts.data.products;

      const cartItemsArray = Object.keys(cartData).map((productId) => {
        const product = allProducts.find((p) => p._id === productId);
        return product
          ? { ...product, quantity: cartData[productId] }
          : null;
      }).filter(Boolean);

      setCartItems(cartItemsArray);
    } catch (err) {
      console.log('Lỗi khi load giỏ hàng:', err);
    }
  };


  useEffect(() => {
    if (isFocused) {
      fetchCart();
    }
  }, [isFocused]);

const updateCart = async (productId, quantity) => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;

    // Lấy thông tin sản phẩm từ giỏ hàng
    const product = cartItems.find(item => item._id === productId);
    const availableQuantity = product?.soLuong || 0; // Số lượng kho

    // Kiểm tra nếu số lượng muốn cập nhật vượt quá số lượng kho
    if (quantity > availableQuantity) {
      Alert.alert('Thông báo', 'Số lượng sản phẩm vượt quá số lượng kho.');
      return; // Ngừng việc cập nhật nếu số lượng quá kho
    }

    if (quantity <= 0) {
      Alert.alert('Thông báo', 'Số lượng sản phẩm phải lớn hơn 0.');
      return; // Ngừng cập nhật nếu số lượng <= 0
    }

    // Gửi yêu cầu cập nhật giỏ hàng
    await axios.post(`${BACKEND_URL}/api/cart/update`, {
      userId,
      itemId: productId,
      quantity,
    });

    fetchCart(); // Tải lại giỏ hàng sau khi cập nhật
  } catch (err) {
    console.log('Lỗi khi cập nhật giỏ hàng:', err);
  }
};


  const deleteItem = async (productId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      await axios.post(`${BACKEND_URL}/api/cart/remove`, {
        userId,
        itemId: productId,
      });

      fetchCart();
    } catch (err) {
      console.log('Lỗi khi xoá sản phẩm:', err);
    }
  };



  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛒 Giỏ hàng của bạn</Text>
      {cartItems.length > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Pressable onPress={selectAllItems}>
            <Text style={{ color: '#2ecc71', fontWeight: 'bold' }}>✔️ Chọn tất cả</Text>
          </Pressable>
          <Pressable onPress={deselectAllItems}>
            <Text style={{ color: '#e74c3c', fontWeight: 'bold' }}>❌ Bỏ chọn tất cả</Text>
          </Pressable>
        </View>
      )}

      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có sản phẩm nào trong giỏ hàng.</Text>
      ) : (
        cartItems.map((item) => (
          <View key={item._id} style={styles.itemContainer}>
            <View style={{ flexDirection: 'row' }}>
              <Pressable onPress={() => toggleSelectItem(item._id)} style={{ marginRight: 8, marginTop: 8 }}>
                <Ionicons
                  name={selectedItems.includes(item._id) ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={selectedItems.includes(item._id) ? '#2ecc71' : '#ccc'}
                />
              </Pressable>

              <Image source={{ uri: item.image[0] }} style={styles.image} />
            </View>

            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.brand}>{item.thuongHieu || 'N/A'}</Text>
              <Text style={styles.infoText}>{item.thongTin || 'Không có mô tả.'}</Text>
              <Text style={styles.price}>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(item.price)}
              </Text>
            </View>

            {/* CONTROLS CHỈNH SỬA */}
           <View style={styles.controls}>
  <Pressable
  style={styles.qtyBtn}
  onPress={() => {
    if (item.quantity < item.soLuong) {
      updateCart(item._id, item.quantity + 1);
    } else {
      Alert.alert('Thông báo', 'Số lượng sản phẩm đã đạt giới hạn kho.');
    }
  }}
  disabled={item.quantity >= item.soLuong} // Vô hiệu hóa nếu số lượng giỏ hàng đã đạt giới hạn kho
>
  <Text style={styles.qtyText}>+</Text>
</Pressable>

<View style={styles.quantityContainer}>
  <Text style={styles.quantity}>{item.quantity}</Text>
</View>

<Pressable
  style={styles.qtyBtn}
  onPress={() => {
    if (item.quantity > 1) {
      updateCart(item._id, item.quantity - 1);
    }
  }}
  disabled={item.quantity <= 1} // Vô hiệu hóa nếu số lượng giỏ hàng là 1 (không thể giảm xuống dưới)
>
  <Text style={styles.qtyText}>-</Text>
</Pressable>


  <Pressable
    style={{ marginLeft: 12 }}
    onPress={() => deleteItem(item._id)}
  >
    <Ionicons name="trash-bin" size={24} color="#e74c3c" />
  </Pressable>

  {/* Hiển thị số lượng kho dưới nút + và - */}
  <Text style={styles.stockInfo}>
    Kho: {item.soLuong}
  </Text>
</View>


          </View>

        ))
      )}

      {cartItems.length > 0 && (
        <View style={styles.checkoutContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Tổng sản phẩm:</Text>
            <Text style={styles.value}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(calculateTotal())}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Phí giao hàng:</Text>
            <Text style={styles.value}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(5000)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { fontWeight: 'bold' }]}>Tổng thanh toán:</Text>
            <Text style={[styles.value, { fontWeight: 'bold' }]}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(calculateTotal() + 5000)}
            </Text>
          </View>

          <Pressable style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>💳 Thanh toán</Text>
          </Pressable>
        </View>


      )}
    </ScrollView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',

  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 36,
    textAlign: 'center',
    color: '#2c3e50',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingBottom: 10,
    alignItems: 'flex-start',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 10,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
    controls: {
    flexDirection: 'column', // Đặt các phần tử theo chiều dọc
    alignItems: 'center',    // Căn giữa các phần tử
    justifyContent: 'center', // Căn giữa các phần tử theo chiều dọc
    marginLeft: 'auto',
    marginRight: 'auto', // Đảm bảo rằng các phần tử căn giữa
  },

  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginVertical: 5, // Khoảng cách giữa dấu + và số lượng
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityContainer: {
    marginVertical: 6, // Khoảng cách giữa số lượng và các nút +, -
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',  // Đảm bảo số lượng nổi bật hơn
  },
  stockInfo: {
    fontSize: 14,
    color: '#888', // Màu nhạt cho số lượng kho
    marginTop: 6,  // Khoảng cách với nút + và -
  },
  checkoutContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'flex-end', // ✅ canh phải
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
    textAlign: 'right', // ✅ text căn phải
    width: '100%',
  },
  checkoutButton: {
    backgroundColor: '#fff', // nền trắng
    borderWidth: 2,
    borderColor: '#27ae60', // viền xanh
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  checkoutButtonText: {
    color: '#27ae60', // chữ xanh
    fontSize: 16,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    color: '#2c3e50',
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
  },


});
