import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    age: Number,
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },

    allergies: String,
    conditions: String,

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastCallAt: Date,
  },
  { timestamps: true },
);

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
