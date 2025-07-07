import mongoose from 'mongoose';
import orderModel from '../models/orderModel.js'; // Import đúng tên

const addReview = async (req, res) => {
    const { orderId } = req.params;
    const { rating, comment } = req.body;

    // Kiểm tra tính hợp lệ của `orderId`
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'orderId không hợp lệ' });
    }

    // Kiểm tra tính hợp lệ của `rating`
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating phải từ 1 đến 5 sao' });
    }

    try {
        // Tìm đơn hàng theo `orderId`
        const order = await orderModel.findById(orderId); // Sử dụng đúng tên model
        if (!order) {
            return res.status(404).json({ message: 'Order không tồn tại' });
        }

        // Tạo đánh giá mới
        const newReview = {
            rating,
            comment,
            createdAt: new Date(),
        };

        // Thêm đánh giá vào mảng `reviews`
        order.reviews.push(newReview);

        // Lưu thay đổi vào cơ sở dữ liệu
        await order.save();

        res.status(201).json({
            message: 'Thêm đánh giá thành công',
            review: newReview,
        });
    } catch (error) {
        console.error('Error in addReview:', error); // Ghi log lỗi để debug
        res.status(500).json({
            message: 'Lỗi server',
            error: error.message,
        });
    }
};


const getAllReviews = async (req, res) => {
  try {
    const allReviews = await orderModel.aggregate([
      { $unwind: "$reviews" },
      {
        $project: {
          _id:       0,
          orderId:   "$_id",
          reviewId:  "$reviews._id",
          items:     1,
          firstName: "$address.firstName",
          lastName:  "$address.lastName",
          rating:    "$reviews.rating",
          comment:   "$reviews.comment",
          createdAt: "$reviews.createdAt",
          isHidden:  "$reviews.isHidden",
          replies:   "$reviews.replies"    // 👈 Thêm field replies
        }
      }
    ]);

    res.status(200).json({ success: true, reviews: allReviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const hideReview = async (req, res) => {
  try {
    const { orderId, reviewId } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    const review = order.reviews.id(reviewId);
    if (!review) {
      return res.json({ success: false, message: 'Review không tồn tại' });
    }

    review.isHidden = true;

    await order.save();

    res.json({ success: true, message: 'Đã ẩn review thành công' });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Lỗi server' });
  }
};

const unhideReview = async (req, res) => {
    try {
        const { orderId, reviewId } = req.body;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        // Tìm review cần bỏ ẩn
        const review = order.reviews.id(reviewId);
        if (!review) {
            return res.json({ success: false, message: "Không tìm thấy review" });
        }

        review.isHidden = false;

        await order.save();
        res.json({ success: true, message: "Bỏ ẩn review thành công" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Lỗi server khi bỏ ẩn review" });
    }
};

const replyReview = async (req, res) => {
  const { orderId, reviewId } = req.params;
  const { replyText } = req.body;

  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).json({ success: false, message: 'orderId hoặc reviewId không hợp lệ' });
  }
  if (!replyText || replyText.trim() === '') {
    return res.status(400).json({ success: false, message: 'replyText không được để trống' });
  }

  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const review = order.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy review' });
    }

    // Thêm reply mới
    const newReply = { replyText };
    review.replies.push(newReply);

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Trả lời review thành công',
      reply: newReply
    });
  } catch (error) {
    console.error('Error in replyReview:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// controllers/reviewController.js

/**
 * Ẩn một reply (admin comment)
 * POST /orders/:orderId/reviews/:reviewId/replies/:replyId/hide
 */
const hideReply = async (req, res) => {
  const { orderId, reviewId, replyId } = req.params;

  // Validate IDs
  if (
    !mongoose.Types.ObjectId.isValid(orderId) ||
    !mongoose.Types.ObjectId.isValid(reviewId) ||
    !mongoose.Types.ObjectId.isValid(replyId)
  ) {
    return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
  }

  try {
    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });

    const review = order.reviews.id(reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review không tồn tại' });

    const reply = review.replies.id(replyId);
    if (!reply) return res.status(404).json({ success: false, message: 'Reply không tồn tại' });

    reply.isHidden = true;
    await order.save();

    res.json({ success: true, message: 'Đã ẩn reply thành công' });
  } catch (error) {
    console.error('Error in hideReply:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Bỏ ẩn một reply (admin comment)
 * POST /orders/:orderId/reviews/:reviewId/replies/:replyId/unhide
 */
const unhideReply = async (req, res) => {
  const { orderId, reviewId, replyId } = req.params;

  // Validate IDs
  if (
    !mongoose.Types.ObjectId.isValid(orderId) ||
    !mongoose.Types.ObjectId.isValid(reviewId) ||
    !mongoose.Types.ObjectId.isValid(replyId)
  ) {
    return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
  }

  try {
    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });

    const review = order.reviews.id(reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review không tồn tại' });

    const reply = review.replies.id(replyId);
    if (!reply) return res.status(404).json({ success: false, message: 'Reply không tồn tại' });

    reply.isHidden = false;
    await order.save();

    res.json({ success: true, message: 'Đã bỏ ẩn reply thành công' });
  } catch (error) {
    console.error('Error in unhideReply:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

export { addReview, getAllReviews, hideReview, unhideReview, replyReview, hideReply, unhideReply };

