const express = require('express');
const router = express.Router();
const { createMomoPayment, cashPayment } = require('../controller/paymantControler');
const { protect } = require('../middlewares/authMiddleware');

// Route for creating Momo payment
// router.post('/create-momo-payment', createMomoPayment);
router.post('/cash', protect, cashPayment);
router.put('/order/:orderId/status', updateOrderStatus);


module.exports = router;
