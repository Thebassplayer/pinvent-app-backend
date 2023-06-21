const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");

// Contact US
const contactUs = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("Please Login");
  }
  // Validation
  if (!subject || !message) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  // Send Email

  const send_to = process.env.EMAIL;
  const sent_from = process.env.EMAIL;
  const reply_to = user.email;
  try {
    console.log("Email Data: ", {
      send_to,
      sent_from,
      subject,
      message,
      reply_to,
    });
    await sendEmail(send_to, sent_from, subject, message, reply_to);
    res.status(200).json({ success: true, message: "Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email could not be sent, please try again later");
  }
});

module.exports = { contactUs };
