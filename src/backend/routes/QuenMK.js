// routes/passwordReset.js
import express from 'express'
import nodemailer from 'nodemailer'
import userModel from '../models/userModel.js'
import bcrypt from 'bcryptjs'

const QMKrouter = express.Router()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Gửi OTP vào email đã đăng ký
QMKrouter.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ success: false, message: 'Email không được để trống' })

    const user = await userModel.findOne({ email })
    if (!user) return res.status(400).json({ success: false, message: 'Email chưa đăng ký' })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    user.otp = otp
    user.otpExpires = Date.now() + 5 * 60 * 1000 // 5 phút
    await user.save()

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Mã OTP xác thực Quên Mật Khẩu',
      html: `
        <h2>Kho Tài Khoản - Mã OTP xác thực</h2>
        <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
        <p>Mã này có hiệu lực trong 5 phút.</p>
      `,
    }

    await transporter.sendMail(mailOptions)

    res.json({ success: true, message: 'OTP đã được gửi vào email' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Lỗi gửi OTP' })
  }
})

// Đổi mật khẩu mới với email + OTP
QMKrouter.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin' })
    }

    const user = await userModel.findOne({ email })
    if (!user) return res.status(400).json({ success: false, message: 'Email không tồn tại' })

    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'OTP không đúng' })

    if (user.otpExpires < Date.now()) return res.status(400).json({ success: false, message: 'OTP đã hết hạn' })

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    user.password = hashedPassword
    user.otp = null
    user.otpExpires = null
    await user.save()

    res.json({ success: true, message: 'Đổi mật khẩu thành công' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Lỗi server' })
  }
})

export default QMKrouter
