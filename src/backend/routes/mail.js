import express from 'express'
import nodemailer from 'nodemailer'

const router = express.Router()

router.post('/send-email', async (req, res) => {
  try {
    const { email, orderDetails } = req.body

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      }
    })

   const mailOptions = {
  from: process.env.EMAIL_USERNAME,
  to: email,
  subject: 'Xác nhận đơn hàng tại Kho Tài Khoản',
  html: `
    <h2>Kho Tài Khoản - Xác nhận đơn hàng</h2>
    <p>Xin chào <strong>${orderDetails.address.firstName} ${orderDetails.address.lastName}</strong>,</p>
    <p>Cảm ơn bạn đã đặt hàng. Dưới đây là thông tin đơn hàng của bạn:</p>

    <h3>Thông tin địa chỉ giao hàng:</h3>
    <p>
      ${orderDetails.address.street}, ${orderDetails.address.city}, ${orderDetails.address.state}<br/>
      Điện thoại: ${orderDetails.address.phone}<br/>
      Email: ${orderDetails.address.email}
    </p>

    <h3>Chi tiết sản phẩm:</h3>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th align="left">Tên sản phẩm</th>
          <th align="center">Số lượng</th>
          <th align="right">Giá</th>
          <th align="right">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${orderDetails.items.map(item => `
          <tr>
            <td>${item.name}</td>
            <td align="center">${item.quantity}</td>
            <td align="right">${item.price.toLocaleString()}đ</td>
            <td align="right">${(item.price * item.quantity).toLocaleString()}đ</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3 style="text-align: right;">Tổng thanh toán: <span style="color: red;">${orderDetails.amount.toLocaleString()}đ</span></h3>

    <p>Chúng tôi sẽ liên hệ bạn sớm nhất để xác nhận và giao hàng.</p>
    <p>Trân trọng,<br/>Kho Tài Khoản Team</p>
  `
};


    await transporter.sendMail(mailOptions)

    res.json({ success: true, message: 'Email đã được gửi' })
  } catch (error) {
    console.error('Lỗi gửi mail:', error)
    res.status(500).json({ success: false, message: 'Gửi email thất bại' })
  }
})

export default router
