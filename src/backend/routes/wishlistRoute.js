import express from 'express';
import { addToWishlist, getUserWishlist, removeFromWishlist } from "../controllers/wishlistController.js"; // Thay đổi tên controller
import authUser from '../middleware/auth.js';

const wishlistRouter = express.Router(); // Đổi tên router thành wishlistRouter

// Các route cho Wishlist
wishlistRouter.post('/get', authUser, getUserWishlist);
wishlistRouter.post('/remove', authUser, removeFromWishlist);  // Lấy wishlist của người dùng
wishlistRouter.post('/add', authUser, addToWishlist);  // Thêm sản phẩm vào wishlist


export default wishlistRouter;
