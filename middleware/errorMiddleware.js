const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  // Handle MongoDB connection error
  if (err.name === "MongoError") {
    console.log("@ errorMiddleware: ", err);
    res.status(500).json({ error: "Failed to connect to the database" });
    return;
  }

  // Handle other errors
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
};

module.exports = errorHandler;
