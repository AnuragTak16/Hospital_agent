import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },

    date: {
      type: String,
      required: true,
      index: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    isBooked: {
      type: Boolean,
      default: false,
    },

    lockedUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

availabilitySchema.index(
  { doctorId: 1, date: 1, startTime: 1, endTime: 1 },
  { unique: true },
);

const Availability = mongoose.model('Availability', availabilitySchema);
export default Availability;
