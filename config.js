// config.js
const developmentConfig = {
  // Development environment configuration
};

const productionConfig = {
  // Production environment configuration
};

module.exports =
  process.env.NODE_ENV === "development" ? developmentConfig : productionConfig;
