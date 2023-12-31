const mongoose = require("mongoose");

// Encrypt password using bcrypt
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      min: 3,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      min: [8, "Password must be at least 8 characters"],
      // max: [20, "Password must be less than 20 characters"],
      //password must have special character, number, uppercase, lowercase
      // match: [
      //   /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{8,}$/,
      //   "Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number and one special character",
      // ],
    },
    photo: {
      type: Object,
      default: {
        name: "default_user.png",
        url: "https://e7.pngegg.com/pngimages/753/432/png-clipart-user-profile-2018-in-sight-user-conference-expo-business-default-business-angle-service-thumbnail.png",
      },
    },
    phone: {
      type: String,
      required: false,
      default: "",
    },
    bio: {
      type: String,
      required: false,
      max: [250, "Bio must be less than 250 characters"],
      default: "",
    },
  },
  {
    timestamps: true, //automatically creates fields for when the document was created and updated
  }
);

// Encrypt password using bcrypt

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // Hash the password before saving the user model
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const user = mongoose.model("user", userSchema);

module.exports = user;
