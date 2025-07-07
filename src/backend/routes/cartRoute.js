import express from 'express'
import { addToCart, updateCart, getUserCart, removeMultipleFromCart } from "../controllers/cartController.js"
import authUser from '../middleware/auth.js'

const cartRouter = express.Router()

cartRouter.post('/get', getUserCart)
cartRouter.post('/add', addToCart)
cartRouter.post('/update', updateCart)
cartRouter.post('/remove', updateCart)
cartRouter.post('/removemulti', removeMultipleFromCart)

export default cartRouter