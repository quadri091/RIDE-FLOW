const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudname,
  api_key: process.env.cloudApiKey,
  api_secret: process.env.cloudApiSecret,
});

module.exports = cloudinary;
