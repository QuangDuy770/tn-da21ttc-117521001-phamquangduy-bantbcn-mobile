import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TextInput, Pressable } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { Menu, Button, Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const LTScreen = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [numColumns, setNumColumns] = useState(2);
  const [sortOrder, setSortOrder] = useState('asc');
  const [visibleSortMenu, setVisibleSortMenu] = useState(false);
  const [visibleBrandMenu, setVisibleBrandMenu] = useState(false);
  const [menuLabel, setMenuLabel] = useState('Giá tăng dần');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/product/list`);
        const laptopProducts = response.data.products.filter(product => product.category === 'Laptop');
        setProducts(laptopProducts);
        setFilteredProducts(laptopProducts);

        const uniqueBrands = [...new Set(laptopProducts.map(item => item.thuongHieu))];
        setBrands(uniqueBrands);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (itemId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert(
          'Thông báo',
          'Bạn cần đăng nhập để thêm vào giỏ hàng.',
          [
            { text: 'Huỷ' },
            { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
          ]
        );
        return;
      }
      const res = await axios.post(`${BACKEND_URL}/api/cart/add`, { userId, itemId });
      if (res.data.success) {
        Alert.alert('Thành công', 'Đã thêm vào giỏ hàng!');
      } else {
        Alert.alert('Lỗi', res.data.message || 'Không thể thêm vào giỏ.');
      }
    } catch (error) {
      console.error('❌ Lỗi thêm vào giỏ:', error.message);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi thêm vào giỏ.');
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = products.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
    setFilteredProducts(filtered);
  };

  const handleSort = (order) => {
    const sorted = [...filteredProducts].sort((a, b) => order === 'asc' ? a.price - b.price : b.price - a.price);
    setFilteredProducts(sorted);
    setSortOrder(order);
    setMenuLabel(order === 'asc' ? 'Giá tăng dần' : 'Giá giảm dần');
    setVisibleSortMenu(false);
  };

  const handleBrandFilter = (brand) => {
    setSelectedBrand(brand);
    if (brand === '') {
      setFilteredProducts(products);
    } else {
      const filteredByBrand = products.filter(item => item.thuongHieu === brand);
      setFilteredProducts(filteredByBrand);
    }
    setVisibleBrandMenu(false);
  };

  const handleProductPress = (productId) => {
    navigation.navigate('Info', { productId });
  };

const renderItem = ({ item }) => {
  const discountPercentage = ((item.giaGoc - item.price) / item.giaGoc) * 100; // Tính phần trăm giảm
  return (
    <Pressable style={styles.productContainer} onPress={() => handleProductPress(item._id)}>
      <Image source={{ uri: item.image[0] }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productDescription}>{item.thongTin}</Text>

      {/* Giá hiện tại */}
      <View style={styles.priceRow}>
        <Text style={styles.productPrice}>
          {formatCurrency(item.price)} {/* Định dạng giá bán */}
        </Text>
      </View>

      {/* Giá gốc và phần trăm giảm */}
      <View style={styles.priceContainer}>
        <Text style={styles.originalPrice}>
          {formatCurrency(item.giaGoc)} {/* Định dạng giá gốc */}
        </Text>

        {discountPercentage > 0 && (
          <Text style={styles.discountPercentage}>
            -{Math.round(discountPercentage)}%
          </Text>
        )}
      </View>

      {/* Hiển thị nút thêm vào giỏ hàng hoặc "Hết hàng" */}
      <Pressable
        style={styles.addToCartButton}
        onPress={() => handleAddToCart(item._id)} // ✅ Bấm nguyên khung luôn
        disabled={item.soLuong === 0} // Vô hiệu hóa nếu sản phẩm hết hàng
      >
        <Image
          source={require('../assets/cart.png')}
          style={styles.cartIcon}
        />
        <Text style={styles.addToCartText}>
          {item.soLuong === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </Text>
      </Pressable>

    </Pressable>
  );
};


  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.header}>Danh mục Laptop</Text>
        <View style={styles.searchSortContainer}>
          <TextInput style={styles.searchInput} placeholder="Tìm kiếm sản phẩm" value={searchQuery} onChangeText={handleSearch} />
        </View>
        <View style={styles.searchSortContainer}>
          <Menu visible={visibleSortMenu} onDismiss={() => setVisibleSortMenu(false)} anchor={<Button mode="outlined" onPress={() => setVisibleSortMenu(true)} style={styles.sortButton}>{menuLabel}</Button>}>
            <Menu.Item onPress={() => handleSort('asc')} title="Giá tăng dần" />
            <Menu.Item onPress={() => handleSort('desc')} title="Giá giảm dần" />
          </Menu>
          <View style={styles.filterWrapper}>
            <Menu visible={visibleBrandMenu} onDismiss={() => setVisibleBrandMenu(false)} anchor={<Button mode="outlined" onPress={() => setVisibleBrandMenu(true)} style={styles.filterButton}>Tất cả thương hiệu</Button>}>
              <Menu.Item onPress={() => handleBrandFilter('')} title="Tất cả thương hiệu" />
              {brands.map((brand, index) => (
                <Menu.Item key={index} title={brand} onPress={() => handleBrandFilter(brand)} />
              ))}
            </Menu>
          </View>
        </View>
        <FlatList data={filteredProducts} renderItem={renderItem} keyExtractor={item => item._id} numColumns={numColumns} columnWrapperStyle={styles.row} extraData={numColumns} />
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 10, marginTop: 50 },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  searchSortContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  searchInput: { flex: 1, padding: 10, borderWidth: 1, borderColor: 'black', borderRadius: 10 },
  sortButton: { borderRadius: 10 },
  filterWrapper: { marginLeft: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterButton: { borderRadius: 10, marginLeft: 10 },
  row: { justifyContent: 'space-between' },
  productContainer: { width: '48%', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginVertical: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 5, alignItems: 'center', borderWidth: 1, borderColor: '#27ae60' },
  productImage: { width: '100%', height: 100, resizeMode: 'contain', marginBottom: 5 },
  productName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  productDescription: { fontSize: 12, color: '#888', marginBottom: 8, textAlign: 'left', width: '100%' },
  productPrice: { fontSize: 14, color: '#e74c3c', fontWeight: 'bold', marginBottom: 5, textAlign: 'left' },
  priceContainer: { flexDirection: 'row', justifyContent: 'flex-start', width: '100%', marginBottom: 5 },
  originalPrice: { fontSize: 14, color: '#888', textDecorationLine: 'line-through' },
  discountPercentage: { fontSize: 14, fontWeight: 'bold', color: '#27ae60' },
  addToCartButton: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 5, padding: 10, marginTop: 10, borderWidth: 1, borderColor: '#27ae60', justifyContent: 'center', alignItems: 'center' },
  addToCartText: { color: '#27ae60', fontWeight: 'bold', marginLeft: 5 },
  cartIcon: { width: 20, height: 20, resizeMode: 'contain' },
  priceRow: { flexDirection: 'row', justifyContent: 'flex-start', width: '100%', marginBottom: 5 },
});

export default LTScreen;
