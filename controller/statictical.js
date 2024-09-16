const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");

// API thống kê doanh thu 7 ngày gần đây
exports.getRevenueLast7Days = asyncHandler(async (req, res) => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  try {
    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo, $lt: today },
          orderStatus: "Delivered", // Chỉ tính các đơn hàng đã giao
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API thống kê doanh thu theo tháng
exports.getOrdersByMonth = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const month = parseInt(req.query.month); // Lấy tháng từ query parameter

  try {
    // Kiểm tra nếu month hợp lệ
    if (!month || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({
        message:
          "Invalid month parameter. Please provide a valid month (1-12).",
      });
    }

    const startDate = new Date(`${currentYear}-${month}-01`);
    const endDate = new Date(`${currentYear}-${month + 1}-01`);

    // Lấy danh sách tất cả đơn hàng trong tháng cụ thể
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lt: endDate }, // Điều kiện tìm kiếm theo tháng
      orderStatus: "Delivered", // Chỉ lấy các đơn hàng đã giao
    }).populate("products.product", "title price"); // Sử dụng populate để lấy thông tin sản phẩm

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for the selected month" });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API thống kê sản phẩm bán chạy
exports.getTopSellingProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalSold: { $sum: "$products.count" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          productDetails: {
            title: 1,
            price: 1,
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }, // Giới hạn số sản phẩm hiển thị, ví dụ là top 10
    ]);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API để hiển thị lịch sử mua hàng của người dùng
exports.getUserOrderHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Lấy userId từ token sau khi đã xác thực

  try {
    // Tìm tất cả các đơn hàng của người dùng
    const orders = await Order.find({ orderby: userId }).populate(
      "products.product",
      "title price"
    );

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No order history found" });
    }

    res.json(orders); // Trả về danh sách đơn hàng
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

exports.getRevenueByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Validate input dates
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Both startDate and endDate are required." });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Include the entire end date

  try {
    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          orderStatus: "Delivered", // Filter for delivered orders only
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No revenue found for the specified date range" });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
exports.getCurrentRevenue = asyncHandler(async (req, res) => {
  const today = new Date();

  // Calculate the start and end of the current day
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0); // Set to start of the day
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999); // Set to end of the day

  // Calculate the start of the current month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Calculate the start of the current year
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  try {
    // Get total revenue for the current day
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          orderStatus: "Delivered", // Filter for delivered orders only
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get total revenue for the current month
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfDay },
          orderStatus: "Delivered", // Filter for delivered orders only
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get total revenue for the current year
    const yearlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfDay },
          orderStatus: "Delivered", // Filter for delivered orders only
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      dailyRevenue: dailyRevenue[0] || { totalRevenue: 0, count: 0 },
      monthlyRevenue: monthlyRevenue[0] || { totalRevenue: 0, count: 0 },
      yearlyRevenue: yearlyRevenue[0] || { totalRevenue: 0, count: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// API to get top 5 best-selling products within a selected date range
exports.getTop5SellingProductsByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Validate input dates
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Both startDate and endDate are required." });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Include the entire end date

  try {
    const top5Products = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          orderStatus: "Delivered", // Filter for delivered orders only
        },
      },
      { $unwind: "$products" }, // Unwind products array to work with individual products
      {
        $group: {
          _id: "$products.product",
          totalSold: { $sum: "$products.count" }, // Sum the total count of each product sold
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          productDetails: {
            title: 1,
            price: 1,
            brand: 1,
            category: 1,
            images: 1, // Include images if needed
          },
        },
      },
      { $sort: { totalSold: -1 } }, // Sort by total sold count in descending order
      { $limit: 5 }, // Limit to top 5 products
    ]);

    res.status(200).json(top5Products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
