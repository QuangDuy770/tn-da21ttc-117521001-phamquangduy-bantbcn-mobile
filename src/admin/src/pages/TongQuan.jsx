import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const TongQuan = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 2,
    totalOrders: 6,
    totalSales: 5930000,
    productsByCategory: [],
  });
  const [revenueData, setRevenueData] = useState([]);
  const [filteredRevenueData, setFilteredRevenueData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]); // New state for products
  const [orderCounts, setOrderCounts] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);


  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("Không có token đăng nhập");
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/order/list`, {}, {
        headers: { token }
      });
      if (response.data.success) {
        const orders = response.data.orders;

        // ✅ Đếm số trạng thái
        const counts = {};
        // ✅ Đếm số lần được đặt
        const productCounts = {};
        const productInfo = {};
        orders.forEach(order => {
          counts[order.status] = (counts[order.status] || 0) + 1;

          order.items?.forEach(item => {
            productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
            if (!productInfo[item.name]) {
              productInfo[item.name] = {
                image: item.image?.[0],
                category: item.category || 'N/A',
              };
            }
          });
        });
        setOrderCounts(counts);

        // ✅ Tìm top 5 sản phẩm
        const topList = Object.entries(productCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, quantity]) => ({
            name,
            quantity,
            image: productInfo[name]?.image,
            category: productInfo[name]?.category,
          }));

        setTopProducts(topList);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/dashboard`);
      if (response.data.success) {
        setDashboardData(response.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Lỗi khi lấy dữ liệu tổng quan.');
    }
  };

  const fetchRevenueData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/order/getRevenue`);
      if (response.data.success) {
        const formattedData = Object.entries(response.data.revenueData).map(([date, revenue]) => ({
          date,
          revenue,
        }));
        setRevenueData(formattedData);
        setFilteredRevenueData(formattedData); // Hiển thị tất cả doanh thu ban đầu
      } else {
        setRevenueData([]);
        setFilteredRevenueData([]);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Lỗi khi lấy dữ liệu doanh thu.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopRatedProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/review/get`);
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
      toast.error('Lỗi khi lấy đánh giá sản phẩm.');
    }
  };

  useEffect(() => {
    fetchTopRatedProducts();
  }, []);



  const fetchProductList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products); // Set products data
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching product list:', error);
      toast.error('Lỗi khi lấy danh sách sản phẩm.');
    }
  };


  const filterRevenueData = () => {
    let filtered = revenueData;

    if (selectedMonth) {
      filtered = filtered.filter((data) => data.date.startsWith(selectedMonth));
    }

    if (startDate && endDate) {
      filtered = filtered.filter((data) => {
        const date = new Date(data.date);
        return date >= new Date(startDate) && date <= new Date(endDate);
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
  }, [selectedMonth, startDate, endDate, revenueData]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-700 mb-6">Tổng Quan</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div
          className="p-6 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow cursor-pointer"
          onClick={() => navigate('/users')}
        >
          <h3 className="text-lg font-semibold">Tổng số người dùng</h3>
          <p className="text-4xl font-extrabold">{dashboardData.totalUsers}</p>
        </div>
        <div
          className="p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow cursor-pointer"
          onClick={() => navigate('/orders')}
        >
          <h3 className="text-lg font-semibold">Tổng số đơn hàng</h3>
          <p className="text-4xl font-extrabold">{dashboardData.totalOrders}</p>
        </div>
        <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">Tổng số tiền đã bán</h3>
          <p className="text-4xl font-extrabold">
            {dashboardData.totalSales.toLocaleString('vi-VN')} VND
          </p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-gray-700">Chọn tháng để lọc doanh thu:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-gray-700">Từ ngày:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full"
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-700">Đến ngày:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">Doanh thu theo ngày</h3>
          {isLoading ? (
            <p>Đang tải...</p>
          ) : filteredRevenueData.length === 0 ? (
            <p>Không có dữ liệu doanh thu.</p>
          ) : (
            <Bar
              data={{
                labels: filteredRevenueData.map((data) => data.date),
                datasets: [
                  {
                    label: 'Doanh thu (VND)',
                    data: filteredRevenueData.map((data) => data.revenue),
                    backgroundColor: '#4CAF50',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) =>
                        `${tooltipItem.raw.toLocaleString('vi-VN')} VND`,
                    },
                  },
                },
              }}
            />
          )}
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">Phân loại sản phẩm</h3>
          {dashboardData.productsByCategory.length === 0 ? (
            <p>Không có dữ liệu sản phẩm.</p>
          ) : (
            <Doughnut
              data={{
                labels: dashboardData.productsByCategory.map((category) => category._id),
                datasets: [
                  {
                    data: dashboardData.productsByCategory.map((category) => category.count),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                  },
                ],
              }}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Trạng thái đơn hàng */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">Trạng thái đơn hàng</h3>
          {Object.keys(orderCounts).length === 0 ? (
            <p>Không có dữ liệu trạng thái đơn hàng.</p>
          ) : (
            <Doughnut
              data={{
                labels: Object.keys(orderCounts),
                datasets: [
                  {
                    data: Object.values(orderCounts),
                    backgroundColor: [
                      "#27ae60",
                      "#f1c40f",
                      "#3498db",
                      "#e74c3c",
                      "#9b59b6",
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) =>
                        `${tooltipItem.label}: ${tooltipItem.raw} đơn`,
                    },
                  },
                },
              }}
            />
          )}
        </div>

        {/* Sản phẩm sắp hết hàng */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">Sản phẩm sắp hết hàng</h3>
          {products.length === 0 ? (
            <p>Không có sản phẩm nào.</p>
          ) : (
            <table className="min-w-full table-auto mt-4">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Hình ảnh</th>
                  <th className="px-4 py-2 text-left">Tên sản phẩm</th>
                  <th className="px-4 py-2 text-left">Danh mục</th>
                  <th className="px-4 py-2 text-left">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .sort((a, b) => a.soLuong - b.soLuong) // Sắp xếp số lượng tăng dần
                  .slice(0, 5) // Chỉ hiển thị 5 sản phẩm
                  .map((product) => (
                    <tr key={product._id}>
                      <td className="px-4 py-2">
                        {product.image && product.image.length > 0 ? (
                          <img
                            src={product.image[0]}
                            alt="Product"
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <span>Không có hình ảnh</span>
                        )}
                      </td>
                      <td className="px-4 py-2">{product.name}</td>
                      <td className="px-4 py-2">{product.category}</td>
                      <td className="px-4 py-2">{product.soLuong}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Top 5 Sản phẩm được đặt nhiều nhất */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">Top 5 Sản phẩm được đặt nhiều nhất</h3>
          {topProducts.length === 0 ? (
            <p>Không có dữ liệu</p>
          ) : (
            <table className="min-w-full table-auto mt-4">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Hình ảnh</th>
                  <th className="px-4 py-2 text-left">Tên sản phẩm</th>
                  <th className="px-4 py-2 text-left">Danh mục</th>
                  <th className="px-4 py-2 text-left">Số lần đặt</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span>Không có ảnh</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">{product.category}</td>
                    <td className="px-4 py-2">{product.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">Sản phẩm có đánh giá cao nhất</h3>
          {topRatedProducts.length === 0 ? (
            <p>Không có dữ liệu</p>
          ) : (
            <table className="min-w-full table-auto mt-4">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Hình ảnh</th>
                  <th className="px-4 py-2 text-left">Tên sản phẩm</th>
                  <th className="px-4 py-2 text-left">Danh mục</th>
                  <th className="px-4 py-2 text-left">Điểm trung bình</th>
                  <th className="px-4 py-2 text-left">Số lượt đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {topRatedProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span>Không có ảnh</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">{product.category}</td>
                    <td className="px-4 py-2">{product.averageRating} ★</td>
                    <td className="px-4 py-2">{product.reviewCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>



    </div>
  );
};

export default TongQuan;
