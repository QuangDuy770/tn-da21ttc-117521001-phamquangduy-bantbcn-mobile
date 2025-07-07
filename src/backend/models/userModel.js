// ✅ models/userModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: false },      // sửa required: false
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },  // sửa required: false
  otp: { type: String },         
  otpExpires: { type: Date },    
  cartData: { type: Object, default: {} },
  wishData: { type: Object, default: {} },
  address: {
    type: [
      new mongoose.Schema(
        {
          firstName: String,
          lastName: String,
          email: String,
          street: String,
          city: String,
          state: String,
          phone: String
        },
        { _id: true }
      )
    ],
    default: []
  },
}, { minimize: false });


const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;