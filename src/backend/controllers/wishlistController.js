    import userModel from "../models/userModel.js";

    // Thêm sản phẩm vào Wishlist
    const addToWishlist = async (req, res) => {
        try {
            const { userId, itemId } = req.body;
            const userData = await userModel.findById(userId);
            let wishData = userData.wishData;
    
            // Kiểm tra xem sản phẩm đã có trong wishlist chưa
            if (wishData[itemId]) {
                return res.json({ success: false, message: "Sản phẩm đã có trong danh sách yêu thích." });
            }
    
            // Nếu chưa có, thêm sản phẩm vào wishlist
            wishData[itemId] = 1;
    
            await userModel.findByIdAndUpdate(userId, { wishData });
    
            res.json({ success: true, message: "Sản phẩm đã được thêm vào danh sách yêu thích!" });
    
        } catch (error) {
            console.log(error);
            res.json({ success: false, message: error.message });
        }
    };
    

    const removeFromWishlist = async (req, res) => {
        try {
            const { userId, itemId } = req.body;
    
            // Tìm người dùng trong database
            const userData = await userModel.findById(userId);
            
            // Lấy dữ liệu wishlist của người dùng
            let wishData = userData.wishData;
    
            // Kiểm tra xem sản phẩm có trong wishlist không
            if (!wishData[itemId]) {
                return res.json({ success: false, message: "Sản phẩm không có trong danh sách yêu thích." });
            }
    
            // Xóa sản phẩm khỏi wishlist
            delete wishData[itemId];
    
            // Cập nhật lại wishlist trong database
            await userModel.findByIdAndUpdate(userId, { wishData });
    
            res.json({ success: true, message: "Sản phẩm đã được xóa khỏi danh sách yêu thích." });
    
        } catch (error) {
            console.log(error);
            res.json({ success: false, message: error.message });
        }
    };
    
    

    // Lấy tất cả sản phẩm trong Wishlist
    // Lấy tất cả sản phẩm trong Wishlist của người dùng
const getUserWishlist = async (req, res) => {
    try {
        const { userId } = req.body;

        // Kiểm tra xem người dùng có tồn tại không
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        const wishData = userData.wishData; // Dữ liệu wishlist của người dùng
        res.json({ success: true, wishData });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

    
    
    

    export { addToWishlist, removeFromWishlist, getUserWishlist };
