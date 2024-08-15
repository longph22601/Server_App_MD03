const express = require('express');
const { getRevenueLast7Days, getRevenueByMonth, getTopSellingProducts } = require('../controller/statictical');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/revenue-last-7-days', protect, getRevenueLast7Days);
router.get('/revenue-by-month', protect, getRevenueByMonth);
router.get('/top-selling-products', protect, getTopSellingProducts);

module.exports = router;
