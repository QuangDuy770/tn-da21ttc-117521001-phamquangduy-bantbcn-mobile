import express from 'express'
import { loginUser, registerUser, adminLogin, getAllUsers, getUserInfo } from '../controllers/userController.js'

const userRouter = express.Router();

//userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)
userRouter.get('/get',getAllUsers)
userRouter.post('/info',getUserInfo)

export default userRouter;
