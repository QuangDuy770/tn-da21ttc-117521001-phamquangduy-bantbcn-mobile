import {v2 as cloudinary} from "cloudinary"
import productModel from "../models/productModel.js";
import mongoose from 'mongoose';


// function for add product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, giaNhap, giaGoc, category, thongTin, thuongHieu, bestseller, soLuong } = req.body;

    // Kiểm tra xem có hình ảnh hay không và đảm bảo nó là mảng
    const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    
    // Upload hình ảnh lên Cloudinary
    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' }).catch(error => {
          console.log("Cloudinary upload error:", error);
          throw new Error("Error uploading image to Cloudinary");
        });
        return result.secure_url;  // Trả về URL của ảnh đã upload
      })
    );

    // Log dữ liệu để kiểm tra
    console.log(name, description, price, giaNhap, giaGoc, category, thongTin, thuongHieu, bestseller, soLuong);
    console.log(imagesUrl);  // Kiểm tra URL của ảnh

    const productData = {
      name,
      description,
      price: Number(price),
      giaNhap: Number(giaNhap),
      giaGoc: Number(giaGoc),
      category,
      thongTin,
      thuongHieu,
      bestseller: bestseller === "true" ? true : false,
      soLuong: Number(soLuong),
      image: imagesUrl,  // Lưu mảng URL ảnh
      date: Date.now(),
    };

    // Lưu vào MongoDB
    const product = new productModel(productData);
    await product.save();  // Lưu sản phẩm vào database

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// function for list product
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;

  // Kiểm tra ID có hợp lệ không
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
  }

  try {
    const {
      name,
      description,
      price,
      giaNhap,
      giaGoc,
      category,
      thongTin,
      thuongHieu,
      bestseller,
      soLuong,
      image, // ✅ Nhận image là mảng URL từ req.body
    } = req.body;

    // Ghi log để kiểm tra
    console.log('🧾 Received image URLs:', image);

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(giaNhap !== undefined && { giaNhap: Number(giaNhap) }),
      ...(giaGoc !== undefined && { giaGoc: Number(giaGoc) }),
      ...(category && { category }),
      ...(thongTin && { thongTin }),
      ...(thuongHieu && { thuongHieu }),
      ...(bestseller !== undefined && { bestseller: bestseller === "true" || bestseller === true }),
      ...(soLuong !== undefined && { soLuong: Number(soLuong) }),
      ...(image && Array.isArray(image) && { image }), // ✅ Lưu hình ảnh nếu có
      date: Date.now(),
    };

    // Cập nhật sản phẩm
    const updatedProduct = await productModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ success: false, message: 'Đã có lỗi xảy ra khi cập nhật sản phẩm' });
  }
};

// function for remove product
const removeProduct = async (req, res) => {
  try {
    
    await productModel.findByIdAndDelete(req.body.id)
    res.json({success: true, message:"Product Removed"})

  } catch (error) {

    console.log(error);
    res.json({success: false, message:error.message})
    
  }
}

// Controller xử lý lấy thông tin sản phẩm đơn
const getProductById = async (req, res) => {
  const { id } = req.params;

  // Kiểm tra ID có hợp lệ không
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
  }

  try {
    const product = await productModel.findById(id);

    // Nếu không tìm thấy sản phẩm
    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    // Trả về thông tin sản phẩm
    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
};


const getBestsellerProducts = async (req, res) => {
  try {
    // Truy vấn các sản phẩm có bestseller = true
    const products = await productModel.find({ bestseller: true });
    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching bestseller products:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { listProduct, addProduct,updateProduct, removeProduct, getProductById, getBestsellerProducts }