// Desc: User controller
const asyncHandler = require("express-async-handler");
// User Model
const User = require("../models/userModel");
// Json web token
const jwt = require("jsonwebtoken");

// Generate token
const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

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
    secure: true, // cookie will only be sent over HTTPS
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

module.exports = {
  registerUser,
};
