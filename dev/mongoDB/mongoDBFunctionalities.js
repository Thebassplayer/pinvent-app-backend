// In this document there is development tools

//? __Express__
const express = require("express");
const router = express.Router();
//? __Axios__
const axios = require("axios");
//? __Async Handler__
const asyncHandler = require("express-async-handler");
//? __User Model__
const User = require("../../models/userModel");

//? __Controllers__
// Delete all users from the DB
const deleteAllUsers = asyncHandler(async (req, res) => {
  await User.deleteMany();
  res.status(200).json({ message: "All users deleted" });
  console.log("All users deleted");
});
// Create users
const registerUser = async user => {
  try {
    const response = await axios.post(
      "http://localhost:5002/api/users/register",
      user
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response.data);
  }
};

const createUsers = asyncHandler(async (req, res) => {
  const users = req.body.users;

  const createdUsers = [];

  for (const user of users) {
    try {
      console.log(`Registering user: ${user.username}`);
      await registerUser(user);
      createdUsers.push(user);
      console.log(`User created successfully: ${user.username}`);
    } catch (error) {
      console.error(`Failed to create user: ${user.username}`);
      console.error(error);
    }
  }

  res.status(200).json({ message: "Users created successfully", createdUsers });
});

// Delay function to introduce a delay between iterations
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//? __Routes__
// Delete all users from the DB
router.delete("/deleteAllUsers", deleteAllUsers);
// Create 10 users
router.post("/createUsers/", createUsers);

module.exports = router;
