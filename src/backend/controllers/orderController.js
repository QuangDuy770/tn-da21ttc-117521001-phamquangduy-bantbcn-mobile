
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe'

//Global variable
const currency = 'vnd'
const deliveryCharge = 5000

//gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// COD Method
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address, paymentMethod, payment } = req.body;

    let totalRevenue = 0;
    let totalQuantity = 0;

    for (const item of items) {
      const product = await productModel.findById(item._id);
      if (!product) return res.status(404).json({ message: `Không tìm thấy sản phẩm ${item._id}` });
      if (product.soLuong < item.quantity) return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ hàng.` });

      const revenue = (product.price - product.giaNhap) * item.quantity;
      totalRevenue += revenue;
      totalQuantity += item.quantity;

      await productModel.findByIdAndUpdate(item._id, {
        $inc: { soLuong: -item.quantity },
      });
    }

    const order = new orderModel({
      userId,
      items,
      amount,
      soLuong: totalQuantity,
      address,
      paymentMethod,
      payment, // ⚠️ true nếu Stripe thành công
      date: Date.now(),
      revenue: totalRevenue,
    });
    await order.save();

    // ❗ FIX: Không xoá toàn bộ cart, chỉ xoá các sản phẩm đã mua
    const user = await userModel.findById(userId); // 🛠️ Thêm dòng này để fix lỗi
    const newCart = { ...user.cartData };

    items.forEach(item => {
      delete newCart[item._id.toString()];
    });

    user.cartData = newCart;
    await user.save();



    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Stripe Method
/*const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers;

        let totalRevenue = 0;
        let totalQuantity = 0;

        for (const item of items) {
            const product = await productModel.findById(item._id);
            if (!product) {
                return res.status(404).json({ message: `Không tìm thấy sản phẩm với ID ${item._id}` });
            }

            // Kiểm tra số lượng sản phẩm
            if (product.soLuong < item.quantity) {
                return res.status(400).json({
                    message: `Sản phẩm ${product.name} chỉ còn ${product.soLuong} trong kho.`,
                });
            }

            // Tính doanh thu từ từng sản phẩm
            const revenue = (product.price - product.giaNhap) * item.quantity;
            totalRevenue += revenue;

            // Tính tổng số lượng sản phẩm
            totalQuantity += item.quantity;

            // Trừ số lượng sản phẩm trong kho
            await productModel.findByIdAndUpdate(item._id, {
                $inc: { soLuong: -item.quantity },
            });
        }

        const orderData = {
            userId,
            items,
            amount,
            address,
            soLuong: totalQuantity,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now(),
            revenue: totalRevenue,
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 1,
            },
            quantity: item.quantity,
        }));

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Phí giao hàng",
                },
                unit_amount: deliveryCharge * 1,
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: "payment",
        });

        res.json({
            success: true,
            session_url: session.url,
            revenue: totalRevenue,
            soLuong: totalQuantity,
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};*/

const placeOrderStripe = async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'vnd',
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// All orders data from Admin Panel 
const allOrders = async (req, res) => {

  try {

    const orders = await orderModel.find({})
    res.json({ success: true, orders })

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
  }

}

// User order data for frontend
const userOrders = async (req, res) => {

  try {

    const { userId } = req.body

    const orders = await orderModel.find({ userId })
    res.json({ success: true, orders })

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
  }


}

// Update order status from Admin Panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // 1️⃣ Tìm order
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    // 2️⃣ Cập nhật trạng thái
    order.status = status;

    // 3️⃣ Kiểm tra điều kiện trạng thái + phương thức thanh toán
    if (status === 'Đã giao hàng' && order.paymentMethod === 'COD') {
      order.payment = true;
    }

    // 4️⃣ Lưu order
    await order.save();

    res.json({ success: true, message: 'Đã cập nhật trạng thái đơn hàng' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


/*const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};*/

const getRevenueData = async (req, res) => {
  try {
    // Lấy toàn bộ đơn hàng từ cơ sở dữ liệu
    const orders = await orderModel.find({}).select("date revenue"); // Chỉ lấy các trường cần thiết

    // Kiểm tra nếu không có đơn hàng
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không có dữ liệu đơn hàng.",
      });
    }

    // Tạo đối tượng lưu trữ doanh thu theo ngày
    const revenueByDate = orders.reduce((acc, order) => {
      const date = new Date(order.date).toLocaleDateString("en-CA"); // Định dạng YYYY-MM-DD
      acc[date] = (acc[date] || 0) + order.revenue;
      return acc;
    }, {});

    // Trả toàn bộ dữ liệu doanh thu
    res.json({ success: true, revenueData: revenueByDate });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu doanh thu.",
    });
  }
};

// User cancel order
const cancelOrder = async (req, res) => {
  try {
    const { orderId, userId } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    // Kiểm tra nếu order đó thuộc về user đó
    if (order.userId !== userId) {
      return res.json({ success: false, message: 'Bạn không có quyền hủy đơn hàng này' });
    }

    // Kiểm tra trạng thái có được phép hủy không
    if (order.status === 'Đã giao hàng' || order.status === 'Hủy đơn') {
      return res.json({ success: false, message: 'Đơn hàng không thể hủy' });
    }

    order.status = 'Hủy đơn';
    await order.save();

    res.json({ success: true, message: 'Đã hủy đơn thành công' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


export { placeOrder, placeOrderStripe, allOrders, userOrders, updateStatus, getRevenueData, cancelOrder }
