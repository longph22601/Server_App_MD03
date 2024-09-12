const express = require('express');
const { getRevenueLast7Days, getOrdersByMonth, getTopSellingProducts ,getUserOrderHistory} = require('../controller/statictical');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/revenue-last-7-days', protect, getRevenueLast7Days);
router.get('/revenue-by-month', protect, getOrdersByMonth);
router.get('/top-selling-products', protect, getTopSellingProducts);

router.get('/order-history',protect, getUserOrderHistory);
module.exports = router;
