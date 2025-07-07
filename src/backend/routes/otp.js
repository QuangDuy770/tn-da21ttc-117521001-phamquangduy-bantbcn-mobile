import express from 'express'
import nodemailer from 'nodemailer'
import userModel from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const userrouter = express.Router()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  }
})

userrouter.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ success: false, message: 'Email không được để trống' })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    let user = await userModel.findOne({ email })
    if (!user) {
      user = new userModel({ email })
    }

    user.otp = otp
    user.otpExpires = Date.now() + 5 * 60 * 1000
    await user.save()

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Mã OTP xác thực từ Kho Tài Khoản',
      html: `
        <h2>Kho Tài Khoản - Mã OTP xác thực</h2>
        <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #007FFF;">${otp}</strong></p>
        <p>Mã này có hiệu lực trong 5 phút.</p>
        <p>Trân trọng,<br/>Kho Tài Khoản Team</p>
      `
    }

    await transporter.sendMail(mailOptions)

    return res.json({ success: true, message: 'Mã OTP đã được gửi qua email' })
  } catch (error) {
    console.error('Lỗi gửi mail:', error)
    return res.status(500).json({ success: false, message: 'Gửi email thất bại' })
  }
})

userrouter.post('/register', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin và OTP' })
    }

    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(400).json({ success: false, message: 'Email chưa được gửi OTP hoặc không hợp lệ' })
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Mã OTP không đúng' })
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn' })
    }

    if (user.password) {
      return res.status(400).json({ success: false, message: 'Email đã được đăng ký' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    user.name = name
    user.password = hashedPassword
    user.otp = null
    user.otpExpires = null
    await user.save()

    const token = crypto.randomBytes(16).toString("hex")

    return res.json({ success: true, token })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Lỗi đăng ký' })
  }
})

export default userrouter
