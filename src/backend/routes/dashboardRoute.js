import express from 'express';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import orderModel from '../models/orderModel.js';

const dashboardRouter = express.Router();

// API để lấy thống kê tổng quan
dashboardRouter.get('/dashboard', async (req, res) => {
  try {
    // Lấy tổng số người dùng đã đăng ký
    const totalUsers = await userModel.countDocuments();

    // Lấy tổng số sản phẩm phân loại theo category
    const productsByCategory = await productModel.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Lấy tổng số tiền đã bán được (tính theo tổng amount trong đơn hàng)
    const totalSales = await orderModel.aggregate([
      { $match: { payment: true } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    const totalSalesAmount = totalSales.length > 0 ? totalSales[0].totalAmount : 0;

    // Lấy tổng số đơn hàng
    const totalOrders = await orderModel.countDocuments();

    // Lấy danh sách sản phẩm và số lượng của chúng
    // Đảm bảo trùng khớp với tên trường đã lưu trong DB
    const products = await productModel.find({}, { name: 1, soLuong: 1 });

    const productsWithQuantity = products.map((product) => ({
      _id: product._id,
      name: product.name,
      soLuong: product.soLuong || 0, 
    }));

    res.json({
      success: true,
      totalUsers,
      productsByCategory,
      totalSales: totalSalesAmount,
      totalOrders,
      products: productsWithQuantity,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default dashboardRouter;
