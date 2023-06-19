const asyncHandler = require("express-async-handler");

// Product Model
const Product = require("../models/productModel");

// File Size Formatter
const { fileSizeFormatter } = require("../utils/fileUpload");

// Filestack
const filestack = require("filestack-js");
const apiKey = process.env.FILESTACK_API_KEY;
const client = filestack.init(apiKey);

const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, price, description } = req.body;

  // Validate data
  if (!name || !category || !quantity || !price || !description) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  // Handle image
  let fileData = {};

  if (req.file) {
    // Upload image to filestack
    try {
      const file = req.file;

      client.upload(file.path).then(res => {
        console.log(`File uploaded successfully: ${res.url}`);
      });
    } catch (error) {
      console.log(error);
      res.status(500);
      throw new Error("Image upload failed");
    }
    fileData = {
      name: req.file.originalname,
      url: req.file.path,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Create product
  const product = await Product.create({
    user: req.user._id,
    name,
    sku,
    category,
    quantity,
    price,
    description,
    image: fileData,
  });
  res.status(201).json(product);
});

module.exports = {
  createProduct,
};
