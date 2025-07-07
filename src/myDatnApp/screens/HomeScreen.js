import React, { useState, useEffect } from 'react';
import { Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View, Image, Alert } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Swiper from 'react-native-swiper';
import axios from 'axios';
import Modal from 'react-native-modal';
import { BACKEND_URL } from '../config';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [products, setProducts] = useState([]);
  const [bestsellerProducts, setBestsellerProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/product/list`);
        setProducts(response.data.products);

        const saleSorted = [...response.data.products]
          .filter(item => item.giaGoc > item.price)
          .sort((a, b) => ((b.giaGoc - b.price) / b.giaGoc) - ((a.giaGoc - a.price) / a.giaGoc))
          .slice(0, 6);

        setSaleProducts(saleSorted);

      } catch (error) {
        console.error('Lỗi fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBestsellerProducts = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/product/bestseller`);
        setBestsellerProducts(response.data.products);
      } catch (error) {
        console.error('Lỗi fetch bestseller:', error);
      }
    };

    if (isFocused) {
      fetchProducts();
      fetchBestsellerProducts();
    }
  }, [isFocused]);

  const handleSelectAddress = async (address) => {
    setSelectedAddress(address);
    await AsyncStorage.setItem('selectedAddress', JSON.stringify(address));
  };

  const handleAddToCart = async (itemId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        return Alert.alert(
          'Bạn cần đăng nhập',
          'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.',
          [
            { text: 'Huỷ' },
            { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
          ]
        );
      }

      const res = await axios.post(`${BACKEND_URL}/api/cart/add`, { userId, itemId });

      if (res.data.success) {
        Alert.alert('✅ Đã thêm vào giỏ hàng');
      } else {
        Alert.alert(
          'Bạn cần đăng nhập',
          'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.',
          [
            { text: 'Huỷ' },
            { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      Alert.alert('Lỗi', error?.response?.data?.message || error.message);
    }
  };




  const fetchAddresses = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await axios.post(`${BACKEND_URL}/api/address/get`, { userId });
      setUserAddresses(res.data.address || []);
    } catch (error) {
      console.error('Fetch address error:', error);
    }
  };

  useEffect(() => { if (modalVisible) fetchAddresses(); }, [modalVisible]);

  const displayedProducts = products.slice(0, 6);

  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );



  const list = [
    {
      id: "0",
      image: require('../assets/smartphone.png'),
      name: "Điện thoại",
    },
    {
      id: "1",
      image: require('../assets/tablet.png'),
      name: "Máy tính bảng",
    },
    {
      id: "3",
      image: require('../assets/laptop.png'),
      name: "Laptop",
    },
    {
      id: "4",
      image: require('../assets/earmuff.png'),
      name: "Phụ kiện",
    },
    {
      id: "5",
      image: require('../assets/heart-rate.png'),
      name: "Smart Watch",
    },
    {
      id: "6",
      image: require('../assets/monitor.png'),
      name: "TV",
    },
  ];

  const images = [
    "https://img.etimg.com/thumb/msid-93051525,width-1070,height-580,imgsize-2243475,overlay-economictimes/photo.jpg",
    "https://images-eu.ssl-images-amazon.com/images/G/31/img22/Wireless/devjyoti/PD23/Launches/Updated_ingress1242x550_3.gif",
    "https://images-eu.ssl-images-amazon.com/images/G/31/img23/Books/BB/JULY/1242x550_Header-BB-Jul23.jpg",
  ];

  return (
    <>
      <SafeAreaView
        style={{
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          flex: 1,
          backgroundColor: "white",
        }}
      >

        <ScrollView>

          {/* Thanh tìm kiếm */}
          <View style={{ backgroundColor: "#00CED1", padding: 5, flexDirection: "row", alignItems: 'center' }}>

            <Pressable>
              <Image style={styles.logo} source={require('../assets/logo.png')} />
            </Pressable>

            <Pressable
              style={{
                flexDirection: "row",
                alignItems: 'center',
                marginHorizontal: 7,
                gap: 10,
                backgroundColor: "white",
                borderRadius: 3,
                height: 38,
                flex: 1,
              }}
            >
              <AntDesign style={{ paddingLeft: 10 }} name="search1" size={22} color="black" />
              <TextInput
                placeholder="Tìm kiếm sản phẩm"
                style={{ flex: 1 }}
                value={searchQuery}  // Hiển thị giá trị tìm kiếm
                onChangeText={setSearchQuery}  // Cập nhật giá trị tìm kiếm khi người dùng nhập
              />
            </Pressable>
          </View>

          {/* Hiển thị sản phẩm tìm kiếm khi có từ khóa */}
          {searchQuery !== '' && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((item, index) => {
                  const discountPercentage = ((item.giaGoc - item.price) / item.giaGoc) * 100;
                  return (
                    <Pressable
                      key={index}
                      style={styles.productContainer}
                      onPress={() => navigation.navigate('Info', { productId: item._id })} // Điều hướng đến màn hình Info với id sản phẩm
                    >
                      <Image
                        source={{ uri: item.image[0] }}
                        style={styles.productImage}
                      />
                      <Text style={styles.productName}>{item.name}</Text> {/* Tên sản phẩm */}
                      <Text style={styles.productPrice}>
                        {formatCurrency(item.price)} {/* Giá bán */}
                      </Text>

                      {/* Hiển thị giá gốc và phần trăm giảm cùng một hàng */}
                      <View style={styles.priceContainer}>
                        <Text style={styles.originalPrice}>
                          {formatCurrency(item.giaGoc)} {/* Giá gốc */}
                        </Text>
                        {/* Phần trăm giảm */}
                        {discountPercentage > 0 && (
                          <Text style={styles.discountPercentage}>
                            -{Math.round(discountPercentage)}%
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <Text style={{ textAlign: 'center', marginTop: 10 }}>Không có sản phẩm nào khớp với từ khóa tìm kiếm.</Text>
              )}
            </View>
          )}
          {/* Địa chỉ giao hàng */}
          <Pressable
            onPress={async () => {
              const userId = await AsyncStorage.getItem('userId');
              if (!userId) {
                Alert.alert(
                  'Bạn chưa đăng nhập',
                  'Vui lòng đăng nhập để chọn địa chỉ giao hàng.',
                  [
                    { text: 'Huỷ' },
                    { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
                  ]
                );
                return;
              }
              setModalVisible(true);
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5, padding: 10, backgroundColor: "#AFEEEE" }}
          >
            <Ionicons name="location-outline" size={24} color="black" />
            <Pressable>
              <Text style={{ fontSize: 13, fontWeight: "500" }}>Giao hàng tới ....</Text>
            </Pressable>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
          </Pressable>


          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {list.map((item, index) => (
              <Pressable
                key={index}
                style={{
                  margin: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  // Điều hướng đến màn hình tương ứng dựa trên tên category
                  switch (item.name) {
                    case 'Điện thoại':
                      navigation.navigate('DT');
                      break;
                    case 'Máy tính bảng':
                      navigation.navigate('TB');
                      break;
                    case 'Laptop':
                      navigation.navigate('LT');
                      break;
                    case 'Phụ kiện':
                      navigation.navigate('PK');
                      break;
                    case 'Smart Watch':
                      navigation.navigate('SW');
                      break;
                    case 'TV':
                      navigation.navigate('TV');
                      break;
                    default:
                      break;
                  }
                }}
              >
                <Image
                  style={{ width: 40, height: 40, resizeMode: "contain" }}
                  source={item.image}
                />
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: "500",
                    marginTop: 5,
                  }}
                >
                  {item?.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>


          {/* Swiper */}
          <Swiper
            autoplay={true}
            loop={true}
            dotColor="#13274F"
            activeDotColor="#90A4AE"
            style={{ height: 200, marginBottom: 10 }}
          >
            {images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{ width: '100%', height: 200, resizeMode: 'cover' }}
              />
            ))}
          </Swiper>

          {/* Text hiển thị tiêu đề */}
          <Text
            style={{
              padding: 10,
              fontSize: 20,
              fontWeight: "bold",
              marginTop: 0,
              color: '#13274F',
              letterSpacing: 1,
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            Sản phẩm bán chạy
          </Text>

          {/* Hiển thị sản phẩm bestseller */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
            {bestsellerProducts.map((item, index) => {
              const discountPercentage = ((item.giaGoc - item.price) / item.giaGoc) * 100;
              return (
                <Pressable
                  key={index}
                  style={styles.productContainer}
                  onPress={() => navigation.navigate('Info', { productId: item._id })}
                >
                  <Image
                    source={{ uri: item.image[0] }}
                    style={styles.productImage}
                  />
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productDescription}>{item.thongTin}</Text>
                  <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>

                  <View style={styles.priceContainer}>
                    <Text style={styles.originalPrice}>{formatCurrency(item.giaGoc)}</Text>
                    {discountPercentage > 0 && (
                      <Text style={styles.discountPercentage}>-{Math.round(discountPercentage)}%</Text>
                    )}
                  </View>

                  {/* Nút thêm vào giỏ hoặc hết hàng */}
                  <Pressable
                    style={styles.addToCartContainer}
                    onPress={() => item.soLuong > 0 ? handleAddToCart(item._id) : null} // Chỉ thêm vào giỏ khi còn hàng
                  >
                    <Image source={require('../assets/cart.png')} style={styles.cartIcon} />
                    <View style={styles.addToCartButton}>
                      <Text style={styles.addToCartText}>
                        {item.soLuong > 0 ? 'Thêm vào giỏ' : 'Hết hàng'} {/* Chuyển chữ tùy vào số lượng */}
                      </Text>
                    </View>
                  </Pressable>

                </Pressable>
              );
            })}
          </View>

          {/* Hiển thị 6 sản phẩm đầu tiên */}
          <Text
            style={{
              padding: 10,
              fontSize: 20,
              fontWeight: "bold",
              marginTop: 0,
              color: '#13274F',
              letterSpacing: 1,
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            Sản phẩm mới nhất
          </Text>

          {/* Hiển thị 6 sản phẩm đầu tiên từ danh sách tất cả sản phẩm */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
            {displayedProducts.map((item, index) => {
              const discountPercentage = ((item.giaGoc - item.price) / item.giaGoc) * 100; // Tính phần trăm giảm
              return (
                <Pressable
                  key={index}
                  style={styles.productContainer}
                  onPress={() => navigation.navigate('Info', { productId: item._id })} // Điều hướng đến InfoScreen
                >
                  {/* Hình ảnh sản phẩm */}
                  <Image
                    source={{ uri: item.image[0] }} // Lấy ảnh sản phẩm
                    style={styles.productImage}
                  />

                  {/* Tên sản phẩm */}
                  <Text style={styles.productName}>{item.name}</Text>

                  {/* Mô tả sản phẩm */}
                  <Text style={styles.productDescription}>{item.thongTin}</Text>

                  {/* Giá hiện tại */}
                  <Text style={styles.productPrice}>
                    {formatCurrency(item.price)} {/* Định dạng giá bán */}
                  </Text>

                  {/* Hiển thị giá gốc và phần trăm giảm cùng một hàng */}
                  <View style={styles.priceContainer}>
                    <Text style={styles.originalPrice}>
                      {formatCurrency(item.giaGoc)} {/* Định dạng giá gốc */}
                    </Text>

                    {/* Phần trăm giảm */}
                    {discountPercentage > 0 && (
                      <Text style={styles.discountPercentage}>
                        -{Math.round(discountPercentage)}%
                      </Text>
                    )}
                  </View>

                  {/* Nút thêm vào giỏ hoặc hết hàng */}
                  <Pressable
                    style={styles.addToCartContainer}
                    onPress={() => item.soLuong > 0 ? handleAddToCart(item._id) : null} // Chỉ thêm vào giỏ khi còn hàng
                  >
                    <Image source={require('../assets/cart.png')} style={styles.cartIcon} />
                    <View style={styles.addToCartButton}>
                      <Text style={styles.addToCartText}>
                        {item.soLuong > 0 ? 'Thêm vào giỏ' : 'Hết hàng'} {/* Chuyển chữ tùy vào số lượng */}
                      </Text>
                    </View>
                  </Pressable>

                </Pressable>
              );
            })}
          </View>


          {/* Sản phẩm giảm giá sốc */}
          <Text style={styles.sectionTitle}>Sản phẩm giảm giá sốc</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
            {saleProducts.map((item, index) => {
              const discountPercentage = ((item.giaGoc - item.price) / item.giaGoc) * 100;
              return (
                <Pressable
                  key={index}
                  style={styles.productContainer}
                  onPress={() => navigation.navigate('Info', { productId: item._id })}
                >
                  {/* Bọc ảnh + Badge */}
                  <View style={{ position: 'relative', width: '100%' }}>
                    <Image
                      source={{ uri: item.image[0] }}
                      style={styles.productImage}
                    />
                    <View style={styles.flashSaleBadge}>
                      <Text style={styles.flashSaleText}>Flash Sale 🔥</Text>
                    </View>
                  </View>

                  {/* Tên sản phẩm */}
                  <Text style={styles.productName}>{item.name}</Text>

                  {/* Mô tả sản phẩm */}
                  <Text style={styles.productDescription}>{item.thongTin}</Text>

                  {/* Giá hiện tại */}
                  <Text style={styles.productPrice}>
                    {formatCurrency(item.price)}
                  </Text>

                  {/* Giá gốc + Phần trăm giảm */}
                  <View style={styles.priceContainer}>
                    <Text style={styles.originalPrice}>
                      {formatCurrency(item.giaGoc)}
                    </Text>
                    {discountPercentage > 0 && (
                      <Text style={styles.discountPercentage}>
                        -{Math.round(discountPercentage)}%
                      </Text>
                    )}
                  </View>

                  {/* Nút thêm vào giỏ */}
                  <View style={styles.addToCartContainer}>
                    <Image
                      source={require('../assets/cart.png')}
                      style={styles.cartIcon}
                    />
                    <Pressable
                      style={styles.addToCartButton}
                      onPress={() => item.soLuong > 0 ? handleAddToCart(item._id) : null} // Chỉ thêm vào giỏ khi còn hàng
                    >
                      <Text style={styles.addToCartText}>
                        {item.soLuong > 0 ? 'Thêm vào giỏ' : 'Hết hàng'} {/* Chuyển chữ tùy vào số lượng */}
                      </Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </View>


        </ScrollView>
      </SafeAreaView>

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
          <Text style={{ marginTop: 5, fontSize: 16, color: 'gray' }}>
            Hãy chọn nơi bạn muốn nhận hàng để biết thời gian giao và sản phẩm sẵn có.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
            {userAddresses.length > 0 ? (
              userAddresses.map((address, index) => {
                const isSelected = selectedAddress?._id === address._id;

                return (
                  <Pressable
                    key={index}
                    onPress={() => handleSelectAddress(address)}
                    style={{
                      width: 140,
                      height: 160, // ✅ Chiều cao cố định
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
                    {/* Nút xoá địa chỉ */}
                    <Pressable
                      onPress={() => removeAddress(address._id)}
                      style={{ position: 'absolute', top: 6, right: 6 }}
                    >
                      <AntDesign name="closecircle" size={18} color="red" />
                    </Pressable>

                    <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>
                      {address.firstName} {address.lastName}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 13, color: '#333' }}>
                      📧 {address.email}   {/* Hiển thị email ở đây */}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 13, color: '#333' }}>
                      📍 {address.street}, {address.city}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 13, color: '#333' }}>
                      🌎 {address.state}, {address.country}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 13, color: '#333' }}>
                      📞 {address.phone}
                    </Text>


                    {isSelected && (
                      <Text style={{ color: '#27ae60', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>
                        ✅ Đang chọn
                      </Text>
                    )}
                  </Pressable>
                );
              })
            ) : (
              null
            )}

            {/* Nút thêm địa chỉ mới */}
            <Pressable
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("Address");
              }}
              style={{
                width: 140,
                height: 160, // ✅ SAME height với khung địa chỉ
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
              <Text style={{ fontSize: 14, textAlign: 'center', color: '#0066b2', fontWeight: '500' }}>
                ➕ Thêm địa chỉ mới
              </Text>
            </Pressable>
          </ScrollView>



          <View style={{ marginTop: 15, gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Entypo name="location-pin" size={22} color="#0066b2" />
              <Text style={{ color: '#0066b2' }}>Nhập mã bưu chính (pincode)</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name="locate-sharp" size={22} color="#0066b2" />
              <Text style={{ color: '#0066b2' }}>Dùng vị trí hiện tại của tôi</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <AntDesign name="earth" size={22} color="#0066b2" />
              <Text style={{ color: '#0066b2' }}>Giao hàng ra nước ngoài</Text>
            </View>
          </View>
        </View>
      </Modal>

    </>

  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  logo: {
    width: 43,
    height: 43,
  },
  productContainer: {
    margin: 10,
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5, // Để sản phẩm nổi bật trên nền trắng
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderWidth: 1,  // Thêm viền cho khung sản phẩm
    borderColor: '#27ae60',  // Màu viền xanh lá cây
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
    marginBottom: 8,
    borderRadius: 8,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textAlign: 'left', // ✅ Thêm dòng này để canh trái
    width: '100%',     // ✅ Đảm bảo mô tả không bị bóp hẹp
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
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c', // Màu đỏ cho giá bán
    alignSelf: 'left'
  },
  addToCartContainer: {
    flexDirection: 'row',  // Hiển thị biểu tượng và chữ theo chiều ngang
    backgroundColor: 'white',  // Nền trắng
    borderRadius: 6,  // Bo góc
    padding: 10,  // Khoảng cách bên trong ô
    justifyContent: 'center',
    alignItems: 'center',  // Căn giữa các phần tử
    marginTop: 10,
    width: '110%',  // Chiều rộng đầy đủ của ô
    borderWidth: 1,  // Viền xung quanh ô
    borderColor: '#27ae60',  // Màu viền xanh
  },
  addToCartButton: {
    flexDirection: 'row',  // Để chữ nằm cạnh biểu tượng giỏ hàng
    alignItems: 'center',  // Căn giữa biểu tượng và chữ
  },
  addToCartText: {
    color: '#27ae60',  // Màu chữ xanh
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,  // Khoảng cách giữa biểu tượng giỏ hàng và chữ
  },
  cartIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',  // Giữ tỷ lệ ảnh cho biểu tượng
  },
  modalContent: {
    backgroundColor: 'white', // Đặt nền màu trắng
    padding: 20,
    borderRadius: 10,
    width: '100%',
    height: 400,
  },
  flashSaleBadge: {
    position: 'absolute',
    top: -12,        // ✅ đẩy lên cao hơn (giá trị âm để ra khỏi khung ảnh 1 chút)
    right: -12,      // ✅ đẩy qua phải nhiều hơn (giá trị âm để ra ngoài mép)
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    zIndex: 10,
    minWidth: 65,    // Cho badge dễ đọc hơn
    alignItems: 'center',
  },
  flashSaleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
  },

  sectionTitle: {
    padding: 10,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 0,
    color: '#13274F',
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },


});

