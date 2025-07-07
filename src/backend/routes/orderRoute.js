import express from 'express'
import {placeOrder, placeOrderStripe, allOrders, userOrders, updateStatus,getRevenueData,cancelOrder} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

//Admin Features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)

//Payment Features
orderRouter.post('/place', placeOrder)
orderRouter.post('/stripe', placeOrderStripe)

//User Feature
orderRouter.post('/userorders', userOrders)
orderRouter.post('/huyOrder', cancelOrder)

//verify payment
/*orderRouter.post('/verifyStripe', verifyStripe)*/

orderRouter.get('/getRevenue', getRevenueData)


export default orderRouter