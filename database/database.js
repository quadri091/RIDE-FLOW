const mongoose = require("mongoose");

const connect = async () => {
  try {
    const connection = await mongoose.connect(process.env.LINK);
    if (connection) {
      console.log("Database connected successfully");
    } else {
      console.log("Connection failed");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = connect;
