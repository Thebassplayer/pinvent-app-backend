const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");

// -- Create product --
const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, price, description } = req.body;
  const { fileData } = req;

  // Validate data
  if (!name || !category || !quantity || !price || !description) {
    res.status(400);
    throw new Error("Please fill all the fields");
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
const updateProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, price, description } = req.body;
  const { id } = req.params;
  const { fileData } = req;

  console.log("Update product Fired @ productController.js");

  const product = await Product.findById(id);
  if (!product || product.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error("Product not found");
  }

  const updatedFields = {
    name,
    sku,
    category,
    quantity,
    price,
    description,
    image: req.file ? fileData : undefined,
  };

  const updatedProduct = await Product.findByIdAndUpdate(
    {
      _id: id,
    },
    updatedFields,
    {
      new: true,
      runValidators: true,
    }
  );

  console.log("Updated Product @ productController: ", updatedProduct);
  res.status(200).json(updatedProduct);
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
};
