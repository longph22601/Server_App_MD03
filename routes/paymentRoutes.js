const express = require('express');
const router = express.Router();
const { createMomoPayment, cashPayment } = require('../controller/paymantControler');
const { protect } = require('../middleware/authMiddleware');
// Route for creating Momo payment
router.post('/create-momo-payment', createMomoPayment);
router.post('/cash', protect , cashPayment)

module.exports = router;
