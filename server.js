// Purpose: Server file for backend

// -- Dependencies --

// Environment Variables (dotenv)
const dotenv = require("dotenv").config();
// Express
const express = require("express");
// Mongoose (MongoDB)
const mongoose = require("mongoose");
// Body Parser (JSON)
const bodyParser = require("body-parser");
// Cors
const cors = require("cors");
// Configurations
const config = require("./config");
// Error handling middleware
const errorHandler = require("./middleware/errorMiddleware");
// Cookie parser
const cookieParser = require("cookie-parser");
// Path module
const path = require("path");
// Routes
const userRoutes = require("./routes/userRoute");
const productRoutes = require("./routes/productRoute");
const contactRoutes = require("./routes/contactRoute");
const developmentTools = require("./dev/mongoDB/mongoDBFunctionalities");

// -- App --

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://pinvent-app.vercel.app"],
    credentials: true,
    sameSite: "none",
    secure: true,
    // secure: process.env.NODE_ENV === "development" ? false : true,
  })
);

// Serve static files from the "/uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Routes Middleware
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
if (process.env.NODE_ENV === "development") {
  app.use("/api/development", developmentTools);
}
app.use("/api/contactus", contactRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Home Page");
});

// Error Handler Middleware
app.use(errorHandler);

// Connect to MongoDB and start the server
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
