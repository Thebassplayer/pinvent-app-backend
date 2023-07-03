const multer = require("multer");
const filestack = require("filestack-js");
const apiKey = process.env.FILESTACK_API_KEY;
const client = filestack.init(apiKey);

// Define file storage
const storage = multer.diskStorage({
  // Define file name
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

// Define file filter
const fileFilter = (req, file, cb) => {
  // Accept file
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    // Reject file
    cb(null, false);
  }
};

// Function to check the file size (in bytes)
const fileSizeLimit = 2 * 1000 * 1000; // 2MB

// Define upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: fileSizeLimit,
  },
}).single("image");

// File Size Formatter
const fileSizeFormatter = (bytes, decimal) => {
  if (bytes === 0) {
    return "0 Bytes";
  }
  const dm = decimal || 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "YB", "ZB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1000));
  return (
    parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + " " + sizes[index]
  );
};

// Upload image middleware
const uploadImage = (req, res, next) => {
  upload(req, res, async err => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: `File size limit exceeded. Maximum file size allowed is ${fileSizeFormatter(
            fileSizeLimit
          )}`,
        });
      } else {
        return res.status(500).json({ error: "Image upload failed" });
      }
    } else if (err) {
      return res.status(500).json({ error: "Image upload failed" });
    }

    if (req.file) {
      let fileData;
      try {
        const file = req.file;
        const uploadedFile = await client.upload(file.path);
        fileData = {
          name: req.file.originalname,
          url: uploadedFile.url,
          fileType: req.file.mimetype,
          fileSize: fileSizeFormatter(req.file.size, 2),
        };
      } catch (error) {
        return res.status(500).json({ error: "Image upload failed" });
      }

      req.fileData = fileData;
    }

    next();
  });
};

module.exports = { uploadImage };
