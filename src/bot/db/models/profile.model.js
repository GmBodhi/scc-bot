const mongoose = require('mongoose');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_REGEX = /^\d{10,15}$/;

const profileSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    admno: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: [EMAIL_REGEX, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      match: [PHONE_REGEX, 'Please provide a valid phone number (10-15 digits)'],
    },
    reg_no: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    batch: {
      type: String,
      required: true,
      default: ""
    },

    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    coins: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Profile', profileSchema);
