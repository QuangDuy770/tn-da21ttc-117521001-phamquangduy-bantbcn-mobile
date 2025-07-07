import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform
} from 'react-native';
import axios from 'axios';
import { BarChart, PieChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BACKEND_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';


const screenWidth = Dimensions.get('window').width;

const TongQuan = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalSales: 0,
    productsByCategory: [],
  });
  const [revenueData, setRevenueData] = useState([]);
  const [filteredRevenueData, setFilteredRevenueData] = useState([]);
  const [productList, setProductList] = useState([]);
  const [orderCounts, setOrderCounts] = useState({});
  const [topOrderedProducts, setTopOrderedProducts] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);

  // Hàm fetchTopRatedProducts
  const fetchTopRatedProducts = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/review/get`);
      if (response.data.success) {
        const reviewsData = response.data.reviews;

        const reviewMap = {};
        reviewsData.forEach((rev) => {
          if (rev.items && Array.isArray(rev.items)) {
            rev.items.forEach((item) => {
              const name = item.name || 'Sản phẩm không tên';
              if (!reviewMap[name]) {
                reviewMap[name] = {
                  totalReviews: 0,
                  totalStars: 0,
                  image: item.image?.[0] || null,
                  category: item.category || 'N/A',
                };
              }
              reviewMap[name].totalReviews += 1;
              reviewMap[name].totalStars += rev.rating;
            });
          }
        });
        const ratedProducts = Object.keys(reviewMap).map((name) => {
          const data = reviewMap[name];
          return {
            name,
            category: data.category,
            averageRating: (data.totalStars / data.totalReviews).toFixed(1),
            reviewCount: data.totalReviews,
            image: data.image,
          };
        });
        ratedProducts.sort((a, b) => b.averageRating - a.averageRating);
        setTopRatedProducts(ratedProducts.slice(0, 5));
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi khi lấy đánh giá sản phẩm.');
    }
  };



  const fetchOrders = async () => {
    console.log("✅ fetchOrders được gọi");

    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      console.warn("❌ Không có token đăng nhập");
      return;
    }

    try {
      console.log("🌐 Bắt đầu call API /order/list");
      const response = await axios.post(`${BACKEND_URL}/api/order/list`, {},
        {
          headers: {
            token,
          },
        }
      );


      if (response.data.success && Array.isArray(response.data.orders)) {
        const counts = {};
        response.data.orders.forEach(order => {
          counts[order.status] = (counts[order.status] || 0) + 1;
        });
        setOrderCounts(counts);
        // 👇 Lập map đếm số lần được đặt
        const itemCounts = {};
        response.data.orders.forEach(order => {
          order.items?.forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
          });
        });

        // Lấy top 5
        // 👇 Khi duyệt xong itemCounts
        const topProducts = Object.entries(itemCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        // Khi có `productList`, tìm chi tiết sản phẩm
        // Khi duyệt xong itemCounts
        const topProductsWithImages = topProducts.map(([name, quantity]) => {
          const foundProduct = productList.find(p => p.name === name);
          return {
            name,
            quantity,
            image: foundProduct?.image?.[0] || null,
            category: foundProduct?.category || 'Không có danh mục',
          };
        });

        setTopOrderedProducts(topProductsWithImages);



      } else {
        alert(response.data.message || "Lỗi khi lấy dữ liệu trạng thái đơn hàng.");
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };




  const formatDate = (date) => {
    if (!date) return '';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);


  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const fetchProductList = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/product/list`);
      if (response.data.success) {
        setProductList(response.data.products); // hoặc response.data tùy theo API trả về


      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching product list:", error);
      alert("Lỗi khi lấy danh sách sản phẩm.");
    }
  };


  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/dashboard`);
      if (response.data.success) {
        setDashboardData(response.data);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      alert("Lỗi khi lấy dữ liệu tổng quan.");
    }
  };

  // Fetch revenue data
  const fetchRevenueData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/order/getRevenue`);
      if (response.data.success) {
        const formattedData = Object.entries(response.data.revenueData).map(([date, revenue]) => ({
          date,
          revenue,
        }));
        setRevenueData(formattedData);
        setFilteredRevenueData(formattedData);
      } else {
        setRevenueData([]);
        setFilteredRevenueData([]);
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      alert("Lỗi khi lấy dữ liệu doanh thu.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter revenue data based on date filters
  const filterRevenueData = () => {
    let filtered = revenueData;



    if (startDate && endDate) {
      const start = new Date(startDate.setHours(0, 0, 0, 0));
      const end = new Date(endDate.setHours(23, 59, 59, 999));

      filtered = filtered.filter(data => {
        const d = new Date(data.date);
        return d >= start && d <= end;
      });
    }


    setFilteredRevenueData(filtered);
  };
  useEffect(() => {
    fetchDashboardData();
    fetchRevenueData();
    fetchProductList();
    fetchOrders();
    fetchTopRatedProducts();
  }, []);



  useEffect(() => {
    filterRevenueData();
  }, [startDate, endDate, revenueData]);



  const onChangeStartDate = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onChangeEndDate = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };


  const barChartData = {
    labels: filteredRevenueData.map(d => {
      const [year, month, day] = d.date.split('-');
      return `${parseInt(day)}/${parseInt(month)}`;
    }),


    datasets: [
      {
        data: filteredRevenueData.map(d => d.revenue),
      },
    ],
  };

  const pieChartData = dashboardData.productsByCategory.map((category, index) => ({
    name: category._id,
    population: category.count,
    color: ['#FF6384', '#36A2EB', '#FFCE56'][index % 3],
    legendFontColor: '#555',
    legendFontSize: 14,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Tổng Quan</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => {
            fetchDashboardData();
            fetchRevenueData();
            fetchProductList();
            fetchOrders();
          }}
        >
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Summary cards scroll ngang */}
      <ScrollView
        style={{ marginBottom: 30 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <TouchableOpacity
          style={[styles.card, styles.greenCard]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Users')}
        >
          <Text style={styles.cardTitle}>Tổng số người dùng</Text>
          <Text style={styles.cardNumber}>{dashboardData.totalUsers}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.orangeCard]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Orders')}
        >
          <Text style={styles.cardTitle}>Tổng số đơn hàng</Text>
          <Text style={styles.cardNumber}>{dashboardData.totalOrders}</Text>
        </TouchableOpacity>

        <View style={[styles.card, styles.purpleCard]}>
          <Text style={styles.cardTitle}>Tổng số tiền đã bán</Text>
          <Text style={styles.cardNumber}>
            {dashboardData.totalSales.toLocaleString('vi-VN')} VND
          </Text>
        </View>
      </ScrollView>


      {/* Bộ chọn tháng và ngày */}

      <View style={styles.filterContainer}>



        <Text style={styles.label}>Từ ngày</Text>
        <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.input}>
          <Text>{startDate ? formatDate(startDate) : 'Chọn ngày bắt đầu'}</Text>
        </TouchableOpacity>

        {showStartDatePicker && (
          <DateTimePicker
            value={startDate ? new Date(startDate) : new Date()}
            mode="date"
            display="default"
            onChange={onChangeStartDate}
            maximumDate={new Date()}
          />
        )}

        <Text style={styles.label}>Đến ngày</Text>
        <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.input}>
          <Text>{endDate ? formatDate(endDate) : 'Chọn ngày kết thúc'}</Text>
        </TouchableOpacity>


        {showEndDatePicker && (
          <DateTimePicker
            value={endDate ? new Date(endDate) : new Date()}
            mode="date"
            display="default"
            onChange={onChangeEndDate}
            maximumDate={new Date()}
          />
        )}
        <TouchableOpacity
          onPress={() => {
            setStartDate(null);
            setEndDate(null);
          }}
          style={styles.clearButton}
        >
          <Text style={styles.clearButtonText}>Xóa lọc</Text>
        </TouchableOpacity>

      </View>

      {/* Vuốt ngang biểu đồ doanh thu */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Doanh thu theo ngày</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#1e90ff" />
        ) : filteredRevenueData.length === 0 ? (
          <Text style={styles.noDataText}>Không có dữ liệu doanh thu.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <BarChart
              data={barChartData}
              width={Math.max(screenWidth, filteredRevenueData.length * 60)}
              height={220}
              yAxisLabel=""

              fromZero
              showValuesOnTopOfBars
              withInnerLines={true}
              withHorizontalLabels={true}
              withVerticalLabels={true}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#f1f5f9',
                backgroundGradientTo: '#e2e8f0',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(30, 64, 175, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForBackgroundLines: {
                  stroke: '#e5e7eb',
                },
                propsForLabels: {
                  fontSize: 12,
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              // ✅ Thêm dòng này để chừa không gian cho trục Y
              verticalLabelRotation={0}
              yLabelsOffset={-4}
              xLabelsOffset={4}
              segments={4}
              // 🔥 Dòng này cực quan trọng để không bị cắt trục Y
              leftAxisLabelWidth={40}
            />

          </ScrollView>
        )}
      </View>

      {/* PieChart phân loại sản phẩm */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Phân loại sản phẩm</Text>
        {dashboardData.productsByCategory.length === 0 ? (
          <Text style={styles.noDataText}>Không có dữ liệu sản phẩm.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <PieChart
              data={pieChartData}
              width={Math.max(screenWidth - 32, dashboardData.productsByCategory.length * 50)} // mỗi phần tử rộng 180px
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              hasLegend={true}
            />
          </ScrollView>
        )}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Sản phẩm sắp hết hàng</Text>
        {productList.length === 0 ? (
          <Text style={styles.noDataText}>Không có sản phẩm nào.</Text>
        ) : (
          [...productList]
            .sort((a, b) => a.soLuong - b.soLuong)   // 🔽 sắp xếp tăng dần theo số lượng
            .slice(0, 5)                             // ✅ chỉ lấy 5 sản phẩm đầu
            .map((product, index) => (
              <View key={index} style={styles.productCard}>
                {product.image?.length > 0 ? (
                  <Image
                    source={{ uri: product.image[0] }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.productImage, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#aaa' }}>Không có ảnh</Text>
                  </View>
                )}

                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productCategory}>Danh mục: {product.category}</Text>
                  <Text style={styles.productCategory}>Số lượng: {product.soLuong}</Text>
                </View>
              </View>
            ))
        )}
      </View>
      {/* Trạng thái đơn hàng */}

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Trạng thái đơn hàng</Text>
        {Object.keys(orderCounts).length === 0 ? (
          <Text style={styles.noDataText}>Không có dữ liệu trạng thái đơn hàng.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ paddingLeft: 15 }}
            style={{ marginLeft: -15 }}
          >
            <PieChart
              data={Object.keys(orderCounts).map((status, index) => ({
                name: status,
                population: orderCounts[status],
                color: ["#27ae60", "#f1c40f", "#3498db", "#e74c3c", "#9b59b6"][index % 5],
                legendFontColor: "#555",
                legendFontSize: 14,
              }))}
              width={Math.max(screenWidth - 32, Object.keys(orderCounts).length * 100)}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              hasLegend
              style={{ marginLeft: -15 }} // 👈 DỊCH SANG TRÁI 10px
            />

          </ScrollView>
        )}
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Sản phẩm được đặt nhiều nhất</Text>
        {topOrderedProducts.length === 0 ? (
          <Text style={styles.noDataText}>Không có dữ liệu</Text>
        ) : (
          topOrderedProducts.map((product, index) => (
            <View key={index} style={styles.productCard}>
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
              ) : (
                <View style={[styles.productImage, { justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ color: '#aaa' }}>Không có ảnh</Text>
                </View>
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>
                  {index + 1}. {product.name}
                </Text>
                <Text style={styles.productCategory}>Danh mục: {product.category}</Text>
                <Text style={styles.productCategory}>Số lần đặt: {product.quantity}</Text>
              </View>
            </View>
          ))
        )}
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Sản phẩm có đánh giá cao nhất</Text>
        {topRatedProducts.length === 0 ? (
          <Text style={styles.noDataText}>Không có dữ liệu</Text>
        ) : (
          topRatedProducts.map((product, index) => (
            <View key={index} style={styles.productCard}>
              {product.image ? (
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.productImage, { justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ color: '#aaa' }}>Không có ảnh</Text>
                </View>
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>
                  {index + 1}. {product.name}
                </Text>
                <Text style={styles.productCategory}>Danh mục: {product.category}</Text>
                <Text style={styles.productCategory}>
                  Điểm trung bình: {product.averageRating} ★
                </Text>
                <Text style={styles.productCategory}>
                  Số lượt đánh giá: {product.reviewCount}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>



    </ScrollView>
  );
};

export default TongQuan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#222',
    marginTop: 30,
    marginBottom: 20,
    alignSelf: 'center',
  },
  card: {
    width: 240,
    marginRight: 16,
    paddingVertical: 20,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    alignItems: 'center',
  },
  greenCard: {
    backgroundColor: '#4caf50',
  },
  orangeCard: {
    backgroundColor: '#ff9800',
  },
  purpleCard: {
    backgroundColor: '#9c27b0',
  },
  cardTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardNumber: {
    color: 'white',
    fontSize: 34,
    fontWeight: 'bold',
  },
  filterContainer: {
    marginBottom: 30,
  },
  label: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#444',
    fontSize: 15,
  },
  input: {
    height: 42,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    marginBottom: 18,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 14,
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    paddingVertical: 20,
  },
  clearButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#e11d48',
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 20,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  productItem: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  productPrice: {
    fontSize: 15,
    color: '#475569',
    marginTop: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
    fontStyle: 'italic',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },

  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    marginRight: 12,
  },

  productInfo: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  refreshButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
  },
  refreshButtonText: {
    fontSize: 18,
  },


});
