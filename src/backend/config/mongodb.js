import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log("DB Connected");
    });

    // Sửa lại URI kết nối
    await mongoose.connect(process.env.MONGODB_URI, {
        dbName: 'e-commerce' // Xác định database ở đây thay vì đưa vào URL
    });
};

export default connectDB;
