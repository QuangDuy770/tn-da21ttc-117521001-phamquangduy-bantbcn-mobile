import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import Swiper from 'react-native-swiper';
import { Rating } from 'react-native-ratings';
import moment from 'moment';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductInfo = ({ route }) => {
  const { productId } = route.params;
  const navigation = useNavigation();
  const [product, setProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);  // State để điều khiển xem thêm mô tả

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/product/single/${productId}`);
      setProduct(res.data.product);
      if (res.data.product?.category) {
        fetchRelatedProducts(res.data.product.category);
      }
    } catch (error) {
      console.error('❌ Lỗi lấy sản phẩm:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/product/list`);
      if (res.data.products) {
        const filtered = res.data.products.filter(p => p.category === category && p._id !== productId);
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error('❌ Lỗi lấy sản phẩm liên quan:', error.message);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/review/get`);
      if (res.data.success) {

        const reviews = res.data.reviews.filter(r =>
          r.items.some(item => item._id === productId)
        );
        setProductReviews(reviews);
      }
    } catch (error) {
      console.error('❌ Lỗi lấy đánh giá:', error.message);
    }
  };


  const calculateAverageRating = () => {
    if (productReviews.length === 0) return 0;
    const total = productReviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / productReviews.length).toFixed(1);
  };



  const handleAddToCart = async () => {
    if (isAdding) return;

    if (product.soLuong === 0) {
      Alert.alert('Thông báo', 'Sản phẩm này đã hết hàng.');
      return;
    }

    try {
      setIsAdding(true);
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

      const res = await axios.post(`${BACKEND_URL}/api/cart/add`, {
        userId,
        itemId: productId,
      });

      if (res.data.success) {
        Alert.alert('✅ Đã thêm vào giỏ hàng!');
      } else {
        Alert.alert(
          'Không thể thêm vào giỏ',
          res.data.message || 'Vui lòng thử lại sau.',
          [
            { text: 'OK' },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Lỗi khi thêm vào giỏ:', error.message);
      Alert.alert('Lỗi hệ thống', error.message || 'Không rõ lỗi');
    } finally {
      setIsAdding(false);
    }
  };


  // Hiển thị mô tả chi tiết nếu dài hơn 200 ký tự
  const truncatedDescription = product?.description?.length > 200
    ? product.description.substring(0, 200) + '...'
    : product?.description;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy sản phẩm.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
          <AntDesign name="arrowleft" size={28} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Cart' })}>
          <AntDesign name="shoppingcart" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <Swiper style={styles.swiper} showsPagination loop autoplay dotColor="#ccc" activeDotColor="#27ae60">
          {product.image.map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.productImage} />
          ))}
        </Swiper>

        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          {product.thuongHieu && (
            <View style={styles.rowContainer}>
              <Text style={styles.brandName}>Thương hiệu: {product.thuongHieu}</Text>
              <Text style={styles.quantityText}>Kho: {product.soLuong}</Text>
            </View>
          )}
          <View style={styles.ratingRow}>
            <Rating type="star" ratingCount={5} imageSize={22} readonly startingValue={parseFloat(calculateAverageRating())} />
            <Text style={styles.ratingValue}>
              {calculateAverageRating()} / 5 ({productReviews.length} đánh giá)
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>{product.price.toLocaleString()}đ</Text>
            <Text style={styles.productOriginalPrice}>{product.giaGoc.toLocaleString()}đ</Text>
          </View>

          <Text style={styles.discountText}>
            Giảm {((product.giaGoc - product.price) / product.giaGoc * 100).toFixed(0)}%
          </Text>

          <TouchableOpacity
            style={styles.buyButton}
            onPress={handleAddToCart}
            disabled={isAdding || product.soLuong === 0} // Vô hiệu hóa nút nếu sản phẩm hết hàng
          >
            <Text style={styles.buyButtonText}>
              {product.soLuong === 0 ? 'Hết hàng' : isAdding ? 'Đang thêm...' : '🛒 Thêm vào giỏ hàng'}
            </Text>
          </TouchableOpacity>

        </View>


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Thông tin sản phẩm</Text>
          <Text style={styles.descriptionText}>
            {showFullDescription ? product.description : truncatedDescription}
          </Text>

          {/* Thêm nút "Xem thêm" */}
          {product.description && product.description.length > 200 && (
            <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={styles.showMoreText}>
                {showFullDescription ? 'Ẩn bớt' : 'Xem thêm'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {relatedProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛍️ Các sản phẩm tương tự</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {relatedProducts.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.relatedItem}
                  onPress={() => navigation.push('Info', { productId: item._id })}
                >
                  <Image source={{ uri: item.image[0] }} style={styles.relatedImage} />
                  <Text numberOfLines={2} style={styles.relatedName}>{item.name}</Text>
                  <Text style={styles.relatedPrice}>{item.price.toLocaleString()}đ</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Đánh giá từ khách hàng</Text>
          {productReviews.length === 0 ? (
            <Text style={styles.noReviewText}>Hiện chưa có đánh giá nào cho sản phẩm này.</Text>
          ) : (
            productReviews
              .filter((review) => !review.isHidden) // 👈 Chỉ hiển thị review CHƯA bị ẩn
              .map((review, idx) => (
                <View key={idx} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>
                      {review.firstName} {review.lastName}
                    </Text>
                    <Text style={styles.reviewDate}>
                      {moment(review.createdAt).format('DD/MM/YYYY')}
                    </Text>
                  </View>
                  <Rating
                    type="star"
                    ratingCount={5}
                    imageSize={18}
                    readonly
                    startingValue={review.rating}
                    style={{ alignSelf: 'flex-start', marginVertical: 6 }}
                  />
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                  {(review.replies || [])
                    .filter(rep => !rep.isHidden)      // ← chỉ lấy những reply chưa bị ẩn
                    .map((rep, i) => (
                      <View key={i} style={styles.adminReply}>
                        <Text style={styles.adminReplyText}>
                          Admin: {rep.replyText}
                        </Text>
                        <Text style={styles.adminReplyDate}>
                          {moment(rep.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      </View>
                    ))}

                </View>
              ))
          )}


        </View>

      </ScrollView>
    </View>
  );
};

export default ProductInfo;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  swiper: { height: 360 },
  productImage: { width: '100%', height: 360, resizeMode: 'contain' },
  infoContainer: { padding: 16 },
  productName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  brandName: { fontSize: 16, color: '#888', marginTop: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  ratingValue: { marginLeft: 8, fontSize: 16, color: '#555' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  productPrice: { fontSize: 22, fontWeight: 'bold', color: '#e74c3c', marginRight: 10 },
  productOriginalPrice: { fontSize: 18, color: '#aaa', textDecorationLine: 'line-through' },
  discountText: { fontSize: 16, color: '#27ae60', fontWeight: 'bold' },
  buyButton: { backgroundColor: '#fff', paddingVertical: 14, borderRadius: 8, borderWidth: 2, borderColor: '#27ae60', alignItems: 'center', marginVertical: 20 },
  buyButtonText: { color: '#27ae60', fontSize: 16, fontWeight: 'bold' },
  section: { paddingHorizontal: 16, paddingVertical: 20, borderTopWidth: 8, borderTopColor: '#f0f0f0' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#13274F' },
  descriptionText: { fontSize: 16, color: '#555', lineHeight: 22 },
  noReviewText: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 20 },
  reviewCard: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 16, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewerName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  reviewDate: { fontSize: 13, color: '#aaa' },
  reviewComment: { marginTop: 8, fontSize: 15, color: '#555', lineHeight: 20 },
  relatedItem: { width: 140, marginRight: 12 },
  relatedImage: { width: 140, height: 140, borderRadius: 8 },
  relatedName: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 6 },
  relatedPrice: { fontSize: 14, color: '#e74c3c', marginTop: 4 },
  showMoreText: {
    fontSize: 16,
    color: '#27ae60',
    marginTop: 10,
    fontWeight: 'bold',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6
  },
  brandName: {
    fontSize: 16,
    color: '#888'
  },
  quantityText: {
    fontSize: 16,
    color: '#888'
  },
  adminReply: {
    marginTop: 8,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#ddd'
  },
  adminReplyText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555'
  },
  adminReplyDate: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2
  },

});
