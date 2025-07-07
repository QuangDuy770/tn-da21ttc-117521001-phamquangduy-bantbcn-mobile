    import mongoose from "mongoose";
    
    const productSchema = new mongoose.Schema({
        name: { type: String, required: true },
        description: { type: String, required: true },
        thongTin: { type: String, required: true },
        thuongHieu: { type: String, required: true },
        giaGoc: { type: Number, required: true },
        price: { type: Number, required: true },
        giaNhap: { type: Number, required: true },
        image: { type: Array, required: true },
        category: { type: String, required: true },
        soLuong: { type: Number, required: true },
        bestseller: { type: Boolean },
        date: { type: Number, required: true },

    });

    const productModel = mongoose.models.product || mongoose.model("product", productSchema);

    export default productModel;
