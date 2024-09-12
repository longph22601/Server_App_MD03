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
exports.getOrdersByMonth = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const month = parseInt(req.query.month); // Lấy tháng từ query parameter

  try {
    // Kiểm tra nếu month hợp lệ
    if (!month || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: "Invalid month parameter. Please provide a valid month (1-12)." });
    }

    const startDate = new Date(`${currentYear}-${month}-01`);
    const endDate = new Date(`${currentYear}-${month + 1}-01`);

    // Lấy danh sách tất cả đơn hàng trong tháng cụ thể
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lt: endDate }, // Điều kiện tìm kiếm theo tháng
      orderStatus: 'Delivered', // Chỉ lấy các đơn hàng đã giao
    }).populate('products.product', 'title price') // Sử dụng populate để lấy thông tin sản phẩm

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for the selected month' });
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

  // API để hiển thị lịch sử mua hàng của người dùng
exports.getUserOrderHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;  // Lấy userId từ token sau khi đã xác thực

  try {
    // Tìm tất cả các đơn hàng của người dùng
    const orders = await Order.find({ orderby: userId }).populate('products.product', 'title price');

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No order history found' });
    }

    res.json(orders);  // Trả về danh sách đơn hàng
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
  
  