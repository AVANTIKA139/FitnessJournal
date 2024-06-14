const mongoose = require("mongoose");
const signupSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    dob: {
      type: String,
      required: true,
      trim: true,
    },
    phonenumber: {
      type: Number,
      required: true,
    },
    isUnder18: {
      type: Boolean,
      default: false,
    },
    weight: {
      type: String,
      required: true,
      trim: true,
    },
    height: {
      type: String,
      required: true,
      trim: true,
    },

    medicalissues: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);
const signupModel = mongoose.model("signupData", signupSchema);
module.exports = signupModel;
