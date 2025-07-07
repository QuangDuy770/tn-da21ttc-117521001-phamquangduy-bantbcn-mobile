// models/orderModel.js
import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  replyText: { type: String, required: true },
  isHidden:  { type: Boolean, default: false }, // 👈 thêm dòng này
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const reviewSchema = new mongoose.Schema({
  rating:    { type: Number, required: true, min: 1, max: 5 },
  comment:   { type: String },
  isHidden:  { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  replies:   { type: [replySchema], default: [] }   // 👈 Thêm vào đây
});

const orderSchema = new mongoose.Schema({
  userId:        { type: String, required: true },
  items:         { type: Array,  required: true },
  amount:        { type: Number, required: true },
  soLuong:       { type: Number, required: true },
  address:       { type: Object, required: true },
  status:        { type: String, required: true, default: 'Sẵn sàng giao hàng' },
  paymentMethod: { type: String, required: true },
  payment:       { type: Boolean, required: true, default: false },
  date:          { type: Number, required: true },
  revenue:       { type: Number, default: 0 },
  reviews:       { type: [reviewSchema], default: [] }
});

const orderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default orderModel;
