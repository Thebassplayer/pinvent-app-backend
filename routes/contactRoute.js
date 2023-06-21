// Express
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

// Controllers
const { contactUs } = require("../controllers/contactController");

// Contact routes
router.post("/", protect, contactUs);

module.exports = router;
