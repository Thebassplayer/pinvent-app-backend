// Async Handler
const asyncHandler = require("express-async-handler");
// User Model
const User = require("../models/userModel");
// Json web token
const jwt = require("jsonwebtoken");
// Bcrypt
const bcrypt = require("bcryptjs");

// Generate token function
const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// -- Register User --
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Validation
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Check if password is at least 6 characters
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  // Check if email is valid
  if (!email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
    res.status(400);
    throw new Error("Please enter a valid email");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
  });

  // Generate Token
  const token = generateToken(user._id);

  // Send HTTP Only Cookie
  res.cookie("token", token, {
    httpOnly: true, // client-side JavaScript cannot access the cookie
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    secure: process.env.NODE_ENV === "development" ? false : true, // cookie will only be sent over HTTPS
    sameSite: "none", // cookie will only be sent in cross-site requests
  });

  if (user) {
    const { _id, username, email, photo, phone, bio } = user;
    res.status(201).json({
      _id,
      username,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// -- Login user --
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate request
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User does not exist, please signup");
  }

  // Check if password matches
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  // Generate Token
  const token = generateToken(user._id);

  // Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: process.env.NODE_ENV === "development" ? false : true,
  });

  if (user && passwordIsCorrect) {
    const { _id, username, email, photo, phone, bio } = user;
    res.status(200).json({
      _id,
      username,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

// -- Logout user --
const logout = asyncHandler(async (req, res) => {
  // Send HTTP Only Cookie
  res.cookie("token", "", {
    httpOnly: true, // client-side JavaScript cannot access the cookie
    expires: new Date(0),
    secure: process.env.NODE_ENV === "development" ? false : true, // cookie will only be sent over HTTPS
    sameSite: "none", // cookie will only be sent in cross-site requests
  });

  res.status(200).json({ message: "User logged out" });
});

// Get User Data
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
    });
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
};
