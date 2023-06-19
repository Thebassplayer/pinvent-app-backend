const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
// error handling
const errorHandler = require("./middleware/errorMiddleware");
// cookie parser
const cookieParser = require("cookie-parser");
const path = require("path");

//Routes
const userRoutes = require("./routes/userRoute");
const productRoutes = require("./routes/productRoute");

const app = express();

//Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

//Routes Middleware
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

// Routes
app.get("/", (req, res) => {
  res.send("Home Page");
});

// Error Handler Middleware
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5002;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log(err);
  });
