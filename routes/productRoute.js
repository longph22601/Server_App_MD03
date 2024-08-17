const express = require("express");
const {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  getWishlist,
  searchProduct,
  getPopularProductsByTag,
  getNewArrivalsByTag,
  rating,
} = require("../controller/productCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();
router.get("/search", searchProduct); // Thêm dòng này cho tìm kiếm sản phẩm theo từ khóa


router.post("/", authMiddleware, isAdmin, createProduct);

router.get("/:id", getaProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.get("/wishlist", authMiddleware, getWishlist); // Route lấy danh sách yêu thích
router.put("/rating", authMiddleware, rating);

router.get("/tag/:tag/popular", getPopularProductsByTag);
router.get("/tag/:tag/new-arrivals", getNewArrivalsByTag);

router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

router.get("/", getAllProduct);

module.exports = router;
