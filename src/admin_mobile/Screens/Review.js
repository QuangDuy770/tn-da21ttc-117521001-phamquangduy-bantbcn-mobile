import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from "../config";


const Review = () => {
    const [reviews, setReviews] = useState([]);
    const [productSummary, setProductSummary] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [replyTextByReview, setReplyTextByReview] = useState({});


    // Lấy review
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/api/review/get`);

                if (response.data.success) {
                    setReviews(response.data.reviews);
                } else {

                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    // Gom review theo sản phẩm
    useEffect(() => {
        if (reviews.length > 0) {
            const productMap = {};
            reviews.forEach((rev) => {
                if (rev.items && Array.isArray(rev.items)) {
                    rev.items.forEach((item) => {
                        const name = item.name || 'Sản phẩm không tên';
                        if (!productMap[name]) {
                            productMap[name] = {
                                totalReviews: 0,
                                totalStars: 0,
                                image: item.image?.[0] || null,
                                reviews: [],
                            };
                        }
                        productMap[name].totalReviews += 1;
                        productMap[name].totalStars += rev.rating;
                        productMap[name].reviews.push({
                            reviewId: rev.reviewId,
                            orderId: rev.orderId,
                            firstName: rev.firstName,
                            lastName: rev.lastName,
                            rating: rev.rating,
                            comment: rev.comment,
                            createdAt: rev.createdAt,
                            isHidden: rev.isHidden,
                            replies: rev.replies || []
                        });
                    });
                }
            });
            const summary = Object.keys(productMap).map((productName) => {
                const data = productMap[productName];
                return {
                    name: productName,
                    reviewCount: data.totalReviews,
                    averageRating: (data.totalStars / data.totalReviews).toFixed(1),
                    image: data.image,
                    reviews: data.reviews,
                };
            });
            summary.sort((a, b) => b.reviewCount - a.reviewCount);
            setProductSummary(summary);
        }
    }, [reviews]);

    const handleToggleReview = async (orderId, reviewId, isHidden) => {
        const url = isHidden
            ? `${BACKEND_URL}/api/review/unhide`
            : `${BACKEND_URL}/api/review/hide`;



        try {
            const response = await axios.patch(url, {
                orderId,
                reviewId,
            });

            if (response.data.success) {
                Alert.alert(isHidden ? 'Bỏ ẩn thành công' : 'Ẩn thành công');
                setReviews((prevReviews) =>
                    prevReviews.map((rev) =>
                        rev.reviewId === reviewId && rev.orderId === orderId
                            ? { ...rev, isHidden: !rev.isHidden }
                            : rev
                    )
                );
            } else {
                Alert.alert(response.data.message);
            }
        } catch (error) {
            console.error("[TOGGLE ERROR]", error);
            Alert.alert(isHidden ? '❌ Lỗi khi bỏ ẩn bình luận' : '❌ Lỗi khi ẩn bình luận');
        }
    };

    // orderId, reviewId, replyId, isHidden của admin-reply
    const handleToggleReply = async (orderId, reviewId, replyId, isHidden) => {
        const action = isHidden ? 'unhide' : 'hide';
        const url = `${BACKEND_URL}/api/review/${orderId}/reviews/${reviewId}/replies/${replyId}/${action}`;
        try {
            const res = await axios.post(url);
            if (res.data.success) {
                Alert.alert(isHidden ? 'Đã hiện Reply' : 'Đã ẩn Reply');
                // cập nhật lại state reviews
                setReviews(prev =>
                    prev.map(r =>
                        r.reviewId === reviewId && r.orderId === orderId
                            ? {
                                ...r,
                                replies: r.replies.map(rep =>
                                    rep._id === replyId
                                        ? { ...rep, isHidden: !isHidden }
                                        : rep
                                )
                            }
                            : r
                    )
                );
            } else {
                Alert.alert(res.data.message);
            }
        } catch (err) {
            console.error('toggleReply error', err);
            Alert.alert('Lỗi hệ thống', 'Không thể thay đổi trạng thái comment');
        }
    };

    // Cập nhật nội dung ô nhập cho reviewId
const handleReplyChange = (reviewId, text) => {
  setReplyTextByReview(prev => ({ ...prev, [reviewId]: text }));
};

// Gửi reply mới
const handleSubmitReply = async (orderId, reviewId) => {
  const replyText = (replyTextByReview[reviewId] || '').trim();
  if (!replyText) return Alert.alert('Vui lòng nhập nội dung reply');
  try {
    const res = await axios.post(
      `${BACKEND_URL}/api/review/${orderId}/reviews/${reviewId}/reply`,
      { replyText }
    );
    if (res.data.success) {
      Alert.alert('✅ Đã thêm reply');
      // reload lại toàn bộ reviews
      const all = await axios.get(`${BACKEND_URL}/api/review/get`);
      setReviews(all.data.reviews);
      setReplyTextByReview(prev => ({ ...prev, [reviewId]: '' }));
    } else {
      Alert.alert(res.data.message);
    }
  } catch (err) {
    console.error('reply error', err);
    Alert.alert('Lỗi hệ thống', 'Không thể gửi reply');
  }
};



    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        return (
            <Text style={styles.starRow}>
                {[...Array(5)].map((_, i) => (
                    <Text key={i} style={{ color: i < fullStars ? '#facc15' : '#d1d5db' }}>★</Text>
                ))}
            </Text>
        );
    };

    if (loading) {
        return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} size="large" color="#008E97" />;
    }

    if (productSummary.length === 0) {
        return <Text style={styles.noDataText}>Chưa có đánh giá nào</Text>;
    }

    const filteredProducts = productSummary.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Đánh giá sản phẩm</Text>
            <TextInput
                placeholder="🔍 Tìm tên sản phẩm..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
            />
            {filteredProducts.map((product, index) => (
                <View key={index} style={styles.productContainer}>
                    <View style={styles.productHeader}>
                        {product.image ? (
                            <Image source={{ uri: product.image }} style={styles.productImage} />
                        ) : (
                            <View style={styles.noImage}>
                                <Text style={{ color: '#888' }}>Không có ảnh</Text>
                            </View>
                        )}
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{product.name}</Text>
                            {renderStars(parseFloat(product.averageRating))}
                            <Text style={styles.average}>
                                {product.averageRating}/5 ({product.reviewCount} đánh giá)
                            </Text>
                        </View>
                    </View>

                    {product.reviews.map((rev, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.reviewCard,
                                rev.isHidden && { backgroundColor: '#f5f5f5', opacity: 0.5 },
                            ]}
                        >
                            <Text style={styles.reviewer}>
                                {rev.firstName} {rev.lastName}
                                {rev.isHidden && <Text style={styles.hiddenLabel}> (Đã ẩn)</Text>}
                            </Text>
                            {renderStars(rev.rating)}
                            <Text style={styles.comment}>{rev.comment}</Text>
                            <Text style={styles.date}>{new Date(rev.createdAt).toLocaleDateString()}</Text>
                            <TouchableOpacity
                                style={styles.hideButton}
                                onPress={() => handleToggleReview(rev.orderId, rev.reviewId, rev.isHidden)}
                            >
                                <Text style={styles.hideButtonText}>{rev.isHidden ? 'Bỏ ẩn' : 'Ẩn'}</Text>
                            </TouchableOpacity>
                            {/* Admin replies */}
                            {(rev.replies || []).map((rep, j) => (
                                <View key={j} style={styles.adminReply}>
                                    <Text style={[styles.adminReplyText, rep.isHidden && { opacity: 0.5 }]}>
                                        Admin: {rep.replyText}
                                    </Text>
                                    <Text style={styles.adminReplyDate}>
                                        {new Date(rep.createdAt).toLocaleString()}
                                    </Text>

                                    {/* Nút Ẩn/Hiện comment của Admin */}
                                    <TouchableOpacity
                                        style={[
                                            styles.toggleReplyButton,
                                            { backgroundColor: rep.isHidden ? '#2ecc71' : '#e74c3c' }
                                        ]}
                                        onPress={() =>
                                            handleToggleReply(
                                                rev.orderId,
                                                rev.reviewId,
                                                rep._id,
                                                rep.isHidden
                                            )
                                        }
                                    >
                                        <Text style={styles.toggleReplyButtonText}>
                                            {rep.isHidden ? 'Hiện Reply' : 'Ẩn Reply'}
                                        </Text>
                                    </TouchableOpacity>
                                    
                                </View>
                            ))}
{/* Form reply của Admin */}
<View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
  <TextInput
    style={{
      flex: 1,
      padding: 8,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      backgroundColor: '#fff'
    }}
    placeholder="Viết reply..."
    value={replyTextByReview[rev.reviewId] || ''}
    onChangeText={text => handleReplyChange(rev.reviewId, text)}
  />
  <TouchableOpacity
    style={{
      marginLeft: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: '#3498db',
      borderRadius: 4
    }}
    onPress={() => handleSubmitReply(rev.orderId, rev.reviewId)}
  >
    <Text style={{ color: '#fff', fontWeight: '600' }}>Trả lời</Text>
  </TouchableOpacity>
</View>

                        </View>
                    ))}
                </View>
            ))}
        </ScrollView>
    );
};

export default Review;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fafafa',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222',
        marginTop: 40,       // 👈 Thêm dòng này
        marginBottom: 12,
    },

    searchInput: {
        fontSize: 16,
        padding: 10,
        borderRadius: 8,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    noDataText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 30,
    },
    productContainer: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#fff',
        marginBottom: 16,
        elevation: 3,
    },
    productHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    noImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        marginRight: 12,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111',
        marginBottom: 4,
    },
    average: {
        fontSize: 14,
        color: '#555',
        marginTop: 2,
    },
    reviewCard: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    reviewer: {
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: 4,
    },
    hiddenLabel: {
        color: 'red',
        fontWeight: 'bold',
    },
    comment: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#777',
        marginBottom: 8,
    },
    hideButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#e74c3c',
        borderRadius: 4,
    },
    hideButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    starRow: {
        flexDirection: 'row',
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
    toggleReplyButton: {
        marginTop: 4,
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4
    },
    toggleReplyButtonText: {
        color: '#fff',
        fontSize: 12
    },

});
