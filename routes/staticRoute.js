// routes/statisticalRoutes.js
const express = require("express");
const {
  getRevenueLast7Days,
  getOrdersByMonth,
  getTopSellingProducts,
  getUserOrderHistory,
  getRevenueByDateRange,
  getCurrentRevenue,
  getTop5SellingProductsByDateRange, // Import the new function
} = require("../controller/statictical");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Define routes with corresponding controllers and middleware
router.get("/revenue-last-7-days", protect, getRevenueLast7Days);
router.get("/revenue-by-month", protect, getOrdersByMonth);
router.get("/top-selling-products", protect, getTopSellingProducts);
router.get("/order-history", protect, getUserOrderHistory);
router.get("/revenue-by-date", protect, getRevenueByDateRange);
router.get("/current-revenue", protect, getCurrentRevenue);
router.get(
  "/top-5-selling-products-by-date",
  protect,
  getTop5SellingProductsByDateRange
); // Add the route

module.exports = router;
