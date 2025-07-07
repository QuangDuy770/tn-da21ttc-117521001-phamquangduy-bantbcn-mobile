import userModel from "../models/userModel.js"



const addToCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" });
    }

    let cartData = user.cartData || {};

    if (cartData[itemId.toString()]) {
      return res.json({ success: false, message: "Sản phẩm đã có trong giỏ hàng" });
    }

    cartData[itemId.toString()] = 1;
    await userModel.findByIdAndUpdate(userId, { cartData });


    res.json({ success: true, message: "Đã thêm vào giỏ hàng" });
  } catch (error) {
    console.error("Lỗi addToCart:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};


const updateCart = async (req, res) => {
  try {

    const { userId, itemId, quantity } = req.body

    const userData = await userModel.findById(userId)
    let cartData = await userData.cartData;

    cartData[itemId.toString()] = quantity;


    await userModel.findByIdAndUpdate(userId, { cartData })
    res.json({ success: true, message: "Cart Updated" })

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
  }
}


const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId);
    const originalCartData = userData.cartData || {};

    // ✅ Lọc bỏ những key có giá trị là null, undefined, NaN
    const filteredCartData = Object.fromEntries(
      Object.entries(originalCartData).filter(
        ([_, value]) => typeof value === 'number' && !isNaN(value)
      )
    );

    res.json({ success: true, cartData: filteredCartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


const removeFromCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'Người dùng không tồn tại' });
    }

    const itemIdStr = itemId.toString();
    if (!(itemIdStr in cartData)) {
      return res.json({ success: false, message: 'Sản phẩm không có trong giỏ hàng' });
    }
    delete cartData[itemIdStr];


    // ✅ Ghi đè lại cartData hoàn chỉnh
    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: '✅ Đã xoá sản phẩm khỏi giỏ hàng' });
  } catch (error) {
    console.error('Lỗi removeFromCart:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};


const removeMultipleFromCart = async (req, res) => {
  try {
    const { userId, itemIds } = req.body;

    if (!itemIds || itemIds.length === 0) {
      return res.json({ success: false, message: 'Không có sản phẩm nào để xoá' });
    }

    const user = await userModel.findById(userId);

    if (!user || !user.cartData) {
      return res.json({ success: false, message: 'User không tồn tại hoặc chưa có cart' });
    }

    const newCartData = { ...user.cartData };

    // 🔍 Log debug
    console.log("🔍 Keys trong cartData:", Object.keys(newCartData));
    console.log("🔍 itemIds cần xoá:", itemIds.map(id => id.toString()));

    itemIds.forEach(id => {
      delete newCartData[id.toString()];
    });

    user.cartData = newCartData;
    await user.save();

    res.json({ success: true, message: 'Đã xoá các sản phẩm đã thanh toán khỏi giỏ hàng' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Lỗi server khi xoá nhiều sản phẩm khỏi giỏ hàng' });
  }
};







export { addToCart, updateCart, getUserCart, removeFromCart, removeMultipleFromCart }