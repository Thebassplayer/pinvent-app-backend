// Import required modules and packages
const asyncHandler = require("express-async-handler"); // Middleware for handling asynchronous functions
const User = require("../models/userModel"); // Import User model from "../models/userModel"
const jwt = require("jsonwebtoken"); // JSON Web Token library for token verification and decoding

// Middleware function to protect routes
const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token; // Retrieve token from request cookies

    if (!token) {
      res.status(401); // Set response status code to 401 (Unauthorized)
      throw new Error("Not authorized, please login"); // Throw an error indicating authorization failure
    }

    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the JWT_SECRET stored in environment variables

    // Get user id from token and retrieve user data from the database
    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      res.status(401); // Set response status code to 401 (Unauthorized)
      throw new Error("User not found"); // Throw an error if the user associated with the token is not found
    }

    req.user = user; // Attach the user object to the request object for further use in subsequent middleware or routes
    next(); // Call the next middleware function
  } catch (error) {
    res.status(401); // Set response status code to 401 (Unauthorized)
    console.log(error); // Log the error to the console for debugging purposes
    throw new Error("Not authorized, please login"); // Throw a generic error indicating authorization failure
  }
});

module.exports = protect; // Export the protect middleware function for use in other files
