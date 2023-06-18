const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "000000",
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      trim: true,
    },
    cuantity: {
      type: Number,
      required: [true, "Please add a cuantity"],
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      trim: true,
    },
    image: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
