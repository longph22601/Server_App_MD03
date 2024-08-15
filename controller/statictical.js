const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');

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
          orderStatus: 'Delivered', // Chỉ tính các đơn hàng đã giao
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalRevenue: { $sum: '$totalAmount' },
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
exports.getRevenueByMonth = asyncHandler(async (req, res) => {
    const currentYear = new Date().getFullYear();
  
    try {
      const orders = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(`${currentYear}-01-01`), $lt: new Date(`${currentYear + 1}-01-01`) },
            orderStatus: 'Delivered', // Chỉ tính các đơn hàng đã giao
          },
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            totalRevenue: { $sum: '$totalAmount' },
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

  // API thống kê sản phẩm bán chạy
exports.getTopSellingProducts = asyncHandler(async (req, res) => {
    try {
      const products = await Order.aggregate([
        { $unwind: '$products' },
        {
          $group: {
            _id: '$products.product',
            totalSold: { $sum: '$products.count' },
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        { $unwind: '$productDetails' },
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
  
  