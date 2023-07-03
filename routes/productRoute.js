// Express
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { uploadImage } = require("../middleware/uploadImageMiddleware");

// Controllers
const {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");
const { upload, handleFileSizeError } = require("../utils/fileUpload");

// Product routes
router.post("/", protect, uploadImage, createProduct);
router.patch("/:id", protect, uploadImage, updateProduct);
router.get("/", protect, getProducts);
router.get("/:id", protect, getProductById);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
