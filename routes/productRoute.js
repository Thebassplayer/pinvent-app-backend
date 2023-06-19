// Express
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

// Controllers
const {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");

// File Upload
const { upload } = require("../utils/fileUpload");

router.post("/", protect, upload.single("image"), createProduct);
router.get("/", protect, getProducts);
router.get("/:id", protect, getProductById);
router.delete("/:id", protect, deleteProduct);
router.patch("/:id", protect, updateProduct);

module.exports = router;
