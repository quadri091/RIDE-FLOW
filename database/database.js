const mongoose = require("mongoose");

const connect = async () => {
  if (!process.env.LINK) {
    console.warn("Missing MongoDB connection string in process.env.LINK");
    return;
  }

  try {
    await mongoose.connect(process.env.LINK, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

module.exports = connect;
