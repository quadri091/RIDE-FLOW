const cloudinary = require("./claudinary.js");

const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file);
    if (result) {
      return result.secure_url;
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return "failed";
  }
};

module.exports = { uploadImage };
