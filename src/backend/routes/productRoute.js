import express from 'express';
import { listProduct, addProduct, removeProduct, getProductById, getBestsellerProducts,updateProduct } from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';


const productRouter = express.Router();

productRouter.post('/add', adminAuth,upload.fields([{name:'images',maxCount:5}]), addProduct);
productRouter.post('/remove', adminAuth, removeProduct);
productRouter.get('/single/:id',getProductById);  
productRouter.get('/list', listProduct);
productRouter.get('/bestseller', getBestsellerProducts);
productRouter.put('/update/:id', updateProduct);

export default productRouter
