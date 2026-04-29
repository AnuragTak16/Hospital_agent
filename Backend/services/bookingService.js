import mongoose from 'mongoose';
import Appointment from '../models/appoinment.js';
import Availability from '../models/availability.js';
import Doctor from '../models/docter.js';
import Patient from '../models/patient.js';
import User from '../models/userModel.js';

// 🧠 Time filter helper
const getTimeFilter = (timePreference) => {
  if (!timePreference) return {};

  if (timePreference === 'morning') {
    return { startTime: { $lt: '12:00' } };
  }

  if (timePreference === 'afternoon') {
    return { startTime: { $gte: '12:00', $lt: '17:00' } };
  }

  if (timePreference === 'evening') {
    return { startTime: { $gte: '17:00' } };
  }

  return {};
};

export const autoBookLogic = async ({
  phone,
  name,
  specialization,
  date,
  timePreference,
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 🗓️ Normalize date safely
    const inputDate = new Date(date);

    const start = new Date(inputDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(inputDate);
    end.setHours(23, 59, 59, 999);

    const normalize = (str) => str?.trim().toLowerCase();

    // 👤 User handling
    let user = await User.findOne({ phone }).session(session);

    if (user && name && normalize(user.name) !== normalize(name)) {
      console.log(`Name mismatch. Using existing name: ${user.name}`);
      name = user.name; // override incoming name
    } 
    if (!user) {
      const created = await User.create([{ phone, name, role: 'patient' }], {
        session,
      });
      user = created[0];
    }

    // 🧑 Patient
    const patient = await Patient.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id },
      { upsert: true, returnDocument: 'after', session },
    );

    // 🩺 Doctors (case-insensitive)
    const doctors = await Doctor.find({
      specialization: { $regex: `^${specialization}$`, $options: 'i' },
    }).session(session);

    if (!doctors.length) {
      throw new Error('No doctors found');
    }

    const doctorIds = doctors.map((d) => d._id);

    // 🧠 Apply time filter
    const timeFilter = getTimeFilter(timePreference);

    // 🔎 Find slot with preference
    let slot = await Availability.findOne({
      doctorId: { $in: doctorIds },
      isBooked: false,
      date: { $gte: start, $lte: end },
      ...timeFilter,
    })
      .sort({ date: 1 })
      .session(session);

    // 🔁 Fallback: ignore time preference
    if (!slot) {
      slot = await Availability.findOne({
        doctorId: { $in: doctorIds },
        isBooked: false,
        date: { $gte: start, $lte: end },
      })
        .sort({ date: 1 })
        .session(session);
    }

    // 🔁 Final fallback: any date
    if (!slot) {
      slot = await Availability.findOne({
        doctorId: { $in: doctorIds },
        isBooked: false,
      })
        .sort({ date: 1 })
        .session(session);
    }

    if (!slot) {
      throw new Error('No available slots');
    }

    // 🔒 Lock slot atomically
    const updatedSlot = await Availability.findOneAndUpdate(
      { _id: slot._id, isBooked: false },
      { isBooked: true },
      { session, returnDocument: 'after' },
    );

    if (!updatedSlot) {
      throw new Error('Slot already booked');
    }

    // 🩺 Find selected doctor
    const doctor = doctors.find((d) => d._id.equals(updatedSlot.doctorId));

    if (!doctor) {
      throw new Error('Doctor mismatch for slot');
    }

    // 📅 Create appointment
    const appointment = await Appointment.create(
      [
        {
          patientId: patient._id,
          doctorId: doctor._id,
          availabilityId: updatedSlot._id,
          date: updatedSlot.date,
          startTime: updatedSlot.startTime,
          endTime: updatedSlot.endTime,
          status: 'booked',
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    // 🧠 Safe date formatting
    const formattedDate = updatedSlot.date
      ? new Date(updatedSlot.date).toISOString().split('T')[0]
      : null;

    return {
      message: 'Appointment booked successfully',
      doctor: doctor.docterName,
      date: formattedDate,
      time: `${updatedSlot.startTime} - ${updatedSlot.endTime}`,
      appointment: appointment[0],
    };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    throw error;
  }
};
