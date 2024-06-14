const mongoose = require("mongoose");

module.exports.connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connection SUCCESS");
  } catch (error) {
    console.log(error);
  }
};