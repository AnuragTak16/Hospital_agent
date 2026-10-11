import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    docterName: {
      type: String,
      required: true,
    },

    specialization: {
      type: String,
      required: true,
    },

    // Availability structure
    availability: [
      {
        day: {
          type: String, // e.g., "Monday"
          required: true,
        },
        slots: [
          {
            start: String, // "10:00"
            end: String, // "10:30"
          },
        ],
      },
    ],

    phone: String,
  },
  { timestamps: true },
);

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
