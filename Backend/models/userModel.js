// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: String,

    phone: {
      type: String,
      unique: true,
      required: true,
    },

    email: String,

    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin', 'agent'],
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);
export default User;
