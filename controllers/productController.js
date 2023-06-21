const asyncHandler = require("express-async-handler");

// Product Model
const Product = require("../models/productModel");

// File Size Formatter
const { fileSizeFormatter } = require("../utils/fileUpload");

// Filestack
const filestack = require("filestack-js");
const apiKey = process.env.FILESTACK_API_KEY;
const secretKey = process.env.FILESTACK_SECRET_KEY;
const client = filestack.init(apiKey);

// -- Create product --
const createProduct = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { name, sku, category, quantity, price, description } = req.body;

  // Validate data
  if (!name || !category || !quantity || !price || !description) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  // -- Handle image upload --

  // Upload image to filestack
  let fileData = {};

  if (req.file) {
    let uploadedFile;
    try {
      const file = req.file;
      uploadedFile = await client.upload(file.path);
      fileData = {
        name: req.file.originalname,
        url: uploadedFile.url,
        fileType: req.file.mimetype,
        fileSize: fileSizeFormatter(req.file.size, 2),
      };
    } catch (error) {
      console.log(error);
      res.status(500);
      throw new Error("Image upload failed");
    }
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

// -- Get all products --
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    user: req.user._id,
  }).sort("-createdAt");
  res.status(200).json(products);
});

// -- Get product by ID --
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || product.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.status(200).json(product);
});

// -- Delete product --
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || product.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error("Product not found");
  }
  await product.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: "Product removed" });
});

// -- Update product --
const updateProduct = asyncHandler(async (req, res) => {});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
};
