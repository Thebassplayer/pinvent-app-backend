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

// Login Status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json(false);
  }

  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  res.json(false);
});

// Update User
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { username, email, photo, phone, bio } = user;
    const {
      username: updatedUsername,
      photo: updatedPhoto,
      phone: updatedPhone,
      bio: updatedBio,
    } = req.body;

    user.username = updatedUsername || username;
    user.email = email;
    user.photo = updatedPhoto || photo;
    user.phone = updatedPhone || phone;
    user.bio = updatedBio || bio;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;

  // Check if user exists
  if (!user) {
    res.status(404);
    throw new Error("User Not Found, please sigup");
  }

  // Validate passwords
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Check if old password matches in DB
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);
  if (!passwordIsCorrect) {
    res.status(400);
    throw new Error("Old password is incorrect");
  }

  // Check if new password have is at least 8 characters, containds one special character, number, uppercase, lowercase
  if (
    !password.match(
      /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{8,}$/
    )
  ) {
    res.status(400);
    throw new Error(
      "Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number and one special character"
    );
  }

  // Save new password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).send("Password updated successfully");
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
};
