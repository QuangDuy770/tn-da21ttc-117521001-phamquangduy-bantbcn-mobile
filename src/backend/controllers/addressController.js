import userModel from '../models/userModel.js';

const setAddress = async (req, res) => {
    try {
      const { userId, address } = req.body;
      const user = await userModel.findById(userId);
      if (!user) return res.json({ success: false, message: 'Người dùng không tồn tại' });
  
      if (!Array.isArray(user.address)) {
        user.address = []; // ✅ fix lỗi nếu address là object
      }
  
      user.address.push(address);
      await user.save();
  
      res.json({ success: true, message: 'Thêm địa chỉ thành công', address: user.address });
    } catch (error) {
      console.error('Lỗi khi lưu địa chỉ:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };
  

const getAddress = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: 'Không tìm thấy user' });

    res.json({ success: true, address: user.address });
  } catch (err) {
    console.error('Lỗi khi get địa chỉ:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const removeAddress = async (req, res) => {
    try {
      const { userId, addressId } = req.body;
      const user = await userModel.findById(userId);
      if (!user) return res.json({ success: false, message: 'User không tồn tại' });
  
      user.address = user.address.filter(addr => addr._id.toString() !== addressId);
      await user.save();
  
      res.json({ success: true, message: 'Xoá địa chỉ thành công', address: user.address });
    } catch (err) {
      console.error('Lỗi khi xoá address:', err);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };
  
  
  export { setAddress, getAddress, removeAddress };
  