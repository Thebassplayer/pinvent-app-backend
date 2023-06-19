// Express
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

// Controllers
const { createProduct } = require("../controllers/productController");

// File Upload
const { upload } = require("../utils/fileUpload");

router.post("/", protect, upload.single("image"), createProduct);

module.exports = router;
