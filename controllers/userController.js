// Async Handler
const asyncHandler = require("express-async-handler");
// User Model
const User = require("../models/userModel");
// Json web token
const jwt = require("jsonwebtoken");
// Bcrypt
const bcrypt = require("bcryptjs");
// Token Model
const Token = require("../models/tokenModel");
// Crypto
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

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
    sameSite: "none", // cookie will only be sent in cross-site requests
    secure: true,
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
    secure: true,
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
    sameSite: "none", // cookie will only be sent in cross-site requests
    secure: true,
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

// Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User Not Found, please sigup");
  }

  // Delete any existing reset tokens in DB for this user
  await Token.deleteMany({ userId: user._id });

  // Generate Token
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

  // Hash Token and save to DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Save reset token to DB
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 30, // 30 minutes
  }).save();

  // Construct reset password URL
  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  // Reset password email template

  const message = `
  <h2>Hello ${user.username}</h2>
  <p>Please, use the url below to reset your password</p>
  <p>This reset link is valid for only 30 minutes</p>
  <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
  <p>Regards</p>
  <p>Pinvent Team</p>`;

  const subject = "Password Reset Request";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USERNAME;

  try {
    await sendEmail(subject, message, send_to, sent_from);
    res.status(200).json({
      succes: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    res.status(400);
    throw new Error("Email could not be sent");
  }
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  // Hash token, the compare it to the hashed token in DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Check if token exists in DB
  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(400);
    throw new Error("Invalid or expired password reset token");
  }

  // Find user by token
  const user = await User.findById(userToken.userId);

  // Check if the new password is the same as the old password
  if (await bcrypt.compare(password, user.password)) {
    res.status(400);
    throw new Error("New password must be different from the old password");
  }

  user.password = password;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful, please login",
  });
});

module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
