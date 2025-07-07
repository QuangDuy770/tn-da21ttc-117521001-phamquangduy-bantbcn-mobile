import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import wishlistRouter from './routes/wishlistRoute.js'
import orderRouter from './routes/orderRoute.js'
import reviewRouter from './routes/reviewRoute.js'
import dashboardRouter from './routes/dashboardRoute.js'
import addressRouter from './routes/addressRoute.js'
import router from './routes/mail.js'
import userrouter from './routes/otp.js'
import QMKrouter from './routes/QuenMK.js'


//App config
const app = express()
const port = process.env.PORT || 8000
connectDB()
connectCloudinary()

//Middlewares
app.use(express.json())
app.use(cors())

//api endpoints
app.use('/api/user', userRouter)
app.use('/api/user', userrouter )
app.use('/api/user', QMKrouter )
app.use('/api/product', productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/order', orderRouter)
app.use('/api/review', reviewRouter)
app.use('/api/address', addressRouter)
app.use('/api', dashboardRouter)
app.use('/api/order', router)//mail


app.get('/',(req,res)=>{
    res.send("API Working")
})

app.listen(port, ()=> console.log('Server started on PORT: ',+ port))