import express from 'express';
import { addReview, getAllReviews, hideReview, unhideReview, replyReview, hideReply,unhideReply} from "../controllers/reviewController.js"; // Import các controller cho review
import authUser from '../middleware/auth.js'; // Middleware xác thực người dùng
import orderModel from "../models/orderModel.js"; 


const reviewRouter = express.Router(); // Tạo router cho review

// Route để thêm bình luận cho sản phẩm
reviewRouter.post('/:orderId/add', addReview); // Thêm bình luận vào sản phẩm

// Route mới không cần productId
reviewRouter.get('/get', getAllReviews);

reviewRouter.patch('/hide', hideReview);
reviewRouter.patch('/unhide', unhideReview);
 
reviewRouter.post('/:orderId/reviews/:reviewId/reply', replyReview);
reviewRouter.post('/:orderId/reviews/:reviewId/replies/:replyId/hide', hideReply);
reviewRouter.post('/:orderId/reviews/:reviewId/replies/:replyId/unhide', unhideReply);



export default reviewRouter;