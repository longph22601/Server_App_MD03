const axios = require('axios');
const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const crypto = require('crypto');

// const createMomoPayment = asyncHandler(async (req, res) => {
//   const { amount, orderId, orderInfo } = req.body;

//   const partnerCode = process.env.MOMO_PARTNER_CODE;
//   const accessKey = process.env.MOMO_ACCESS_KEY;
//   const secretKey = process.env.MOMO_SECRET_KEY;
//   const redirectUrl = "your-redirect-url"; // Địa chỉ URL sẽ redirect sau khi thanh toán thành công
//   const ipnUrl = "your-ipn-url"; // Địa chỉ URL sẽ nhận thông báo kết quả thanh toán
//   const requestId = orderId;
//   const requestType = 'captureWallet';
//   const extraData = ''; // Trường thông tin bổ sung nếu có

//   const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
//   const signature = crypto.createHmac('sha256', secretKey)
//     .update(rawSignature)
//     .digest('hex');

//   const requestBody = {
//     partnerCode,
//     accessKey,
//     requestId,
//     amount,
//     orderId,
//     orderInfo,
//     redirectUrl,
//     ipnUrl,
//     extraData,
//     requestType,
//     signature,
//     lang: 'en'
//   };

//   try {
//     const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);
//     res.status(200).json(response.data);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

exports.cashPayment = asyncHandler(async (req, res) => {
  const { products, totalAmount } = req.body;
  const userId = req.user._id;

  try {
    console.log('Received products:', products);
    console.log('Total amount:', totalAmount);
    console.log('User ID:', userId);

    const newOrder = new Order({
      products,
      totalAmount,
      paymentMethod: 'Cash',
      orderStatus: 'Not Processed',
      orderby: userId,
    });

    console.log('New Order:', newOrder);

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error saving order:', error.message);
    res.status(500).json({ message: error.message });
  }
});


