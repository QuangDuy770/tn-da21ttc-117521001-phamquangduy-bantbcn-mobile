import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TextInput, Pressable } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../config'; // Sử dụng BACKEND_URL từ config
import { Menu, Button, Provider } from 'react-native-paper'; // Sử dụng Menu từ react-native-paper
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import AsyncStorage from '@react-native-async-storage/async-storage'; // Để lấy userId
import { Alert } from 'react-native'; // Để alert lỗi hoặc thành công


const DTScreeen = () => {
  const navigation = useNavigation(); // Khởi tạo navigation
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [numColumns, setNumColumns] = useState(2); // Track the number of columns dynamically
  const [sortOrder, setSortOrder] = useState('asc'); // Default sorting order
  const [visibleSortMenu, setVisibleSortMenu] = useState(false); // Trạng thái mở menu sắp xếp
  const [visibleBrandMenu, setVisibleBrandMenu] = useState(false); // Trạng thái mở menu thương hiệu
  const [menuLabel, setMenuLabel] = useState('Giá tăng dần'); // Tên label menu sắp xếp
  const [selectedBrand, setSelectedBrand] = useState('');  // Trạng thái lưu nhãn hiệu đã chọn
  const [brands, setBrands] = useState([]); // Danh sách nhãn hiệu

  // Lấy sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/product/list`);
        const phoneProducts = response.data.products.filter(product => product.category === 'Điện thoại');
        setProducts(phoneProducts);
        setFilteredProducts(phoneProducts); // Gán filteredProducts với tất cả sản phẩm điện thoại

        // Lấy danh sách tất cả các nhãn hiệu
        const uniqueBrands = [...new Set(phoneProducts.map(item => item.thuongHieu))];
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
  


  // Tìm kiếm sản phẩm theo tên
  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = products.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Sắp xếp sản phẩm theo giá
  const handleSort = (order) => {
    const sorted = [...filteredProducts].sort((a, b) => {
      if (order === 'asc') {
        return a.price - b.price; // Giá tăng dần
      } else {
        return b.price - a.price; // Giá giảm dần
      }
    });
    setFilteredProducts(sorted);
    setSortOrder(order);
    setMenuLabel(order === 'asc' ? 'Giá tăng dần' : 'Giá giảm dần'); // Cập nhật label menu
    setVisibleSortMenu(false); // Đóng menu sau khi chọn
  };

  // Lọc sản phẩm theo nhãn hiệu
  const handleBrandFilter = (brand) => {
    setSelectedBrand(brand);
    if (brand === '') {
      setFilteredProducts(products); // Nếu không chọn nhãn hiệu thì hiển thị tất cả sản phẩm
    } else {
      const filteredByBrand = products.filter(item => item.thuongHieu === brand);
      setFilteredProducts(filteredByBrand); // Lọc theo nhãn hiệu
    }
    setVisibleBrandMenu(false); // Đóng menu sau khi chọn thương hiệu
  };

  // Điều hướng đến trang thông tin sản phẩm khi bấm vào sản phẩm
  const handleProductPress = (productId) => {
    navigation.navigate('Info', { productId }); // Điều hướng đến màn hình ProductInfo với productId
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.header}>Danh mục Điện thoại</Text>

        {/* Thanh tìm kiếm ở trên cùng */}
        <View style={styles.searchSortContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Thanh lọc thương hiệu và sắp xếp ở dưới cùng, nằm ngang hàng */}
        <View style={styles.searchSortContainer}>
          {/* ComboBox để sắp xếp theo giá */}
          <Menu
            visible={visibleSortMenu}
            onDismiss={() => setVisibleSortMenu(false)}
            anchor={<Button mode="outlined" onPress={() => setVisibleSortMenu(true)} style={styles.sortButton}>{menuLabel}</Button>}>
            <Menu.Item onPress={() => handleSort('asc')} title="Giá tăng dần" />
            <Menu.Item onPress={() => handleSort('desc')} title="Giá giảm dần" />
          </Menu>

          {/* Dropdown để lọc theo thương hiệu */}
          <View style={styles.filterWrapper}>
            <Menu
              visible={visibleBrandMenu}
              onDismiss={() => setVisibleBrandMenu(false)}
              anchor={<Button mode="outlined" onPress={() => setVisibleBrandMenu(true)} style={styles.filterButton}>Tất cả thương hiệu</Button>}
            >
              <Menu.Item onPress={() => handleBrandFilter('')} title="Tất cả thương hiệu" />
              {brands.map((brand, index) => (
                <Menu.Item key={index} title={brand} onPress={() => handleBrandFilter(brand)} />
              ))}
            </Menu>
          </View>
        </View>

        {/* Hiển thị danh sách sản phẩm */}
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={item => item._id} // Đảm bảo key là _id duy nhất
          numColumns={numColumns}  // Hiển thị số cột
          columnWrapperStyle={styles.row}  // Căn chỉnh mỗi hàng
          extraData={numColumns}  // Khi numColumns thay đổi sẽ re-render lại FlatList
        />
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    marginTop: 50
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  searchSortContainer: {
    flexDirection: 'row',  // Để thanh tìm kiếm và combo box sắp xếp cùng 1 hàng
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,  // Bo góc
    // Khoảng cách giữa ô tìm kiếm và combo box
  },
  sortButton: {
    borderRadius: 10,  // Bo góc
  },
  filterWrapper: {
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    borderRadius: 10,  // Bo góc
    marginLeft: 10,
  },
  row: {
    justifyContent: 'space-between',  // Căn giữa các sản phẩm
  },
  productContainer: {
    width: '48%',  // Chiếm 48% chiều rộng mỗi sản phẩm
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
    borderWidth: 1,  // Viền cho ô sản phẩm
    borderColor: '#27ae60',  // Màu viền xanh lá cây
  },
  productImage: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textAlign: 'left', // ✅ Thêm dòng này để canh trái
    width: '100%',     // ✅ Đảm bảo mô tả không bị bóp hẹp
  },
  
  productPrice: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
  },
  originalPrice: {
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'line-through', // Tạo gạch ngang cho giá gốc
  },
  discountPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60', // Màu xanh lá cây cho phần trăm giảm
  },
  addToCartButton: {
    flexDirection: 'row',  // Để chữ nằm cạnh biểu tượng giỏ hàng
    backgroundColor: '#fff',  // Nền trắng
    borderRadius: 5,  // Bo góc
    padding: 10,
    marginTop: 10,
    borderWidth: 1,  // Viền ô
    borderColor: '#27ae60',  // Màu viền xanh
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#27ae60',  // Màu chữ xanh
    fontWeight: 'bold',
    marginLeft: 5,  // Khoảng cách giữa biểu tượng giỏ hàng và chữ
  },
  cartIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',  // Giữ tỷ lệ ảnh cho biểu tượng
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',  // Đặt giá tiền bên trái
    width: '100%',
    marginBottom: 5,
  },
});

export default DTScreeen;
