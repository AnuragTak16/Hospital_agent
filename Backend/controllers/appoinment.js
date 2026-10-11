import mongoose from 'mongoose';
import Appointment from '../models/appoinment.js';
import Availability from '../models/availability.js';
import Doctor from '../models/docter.js';
import Patient from '../models/patient.js';
import User from '../models/userModel.js';

export const autoBookAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('REQ BODY:', req.body);

    const { phone, specialization, date } = req.body;
    let { name } = req.body;

    if (!phone || !specialization) {
      throw new Error('Phone and specialization are required');
    }

    //  Normalize date
    const inputDate = new Date(date);
    const start = new Date(inputDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(inputDate);
    end.setHours(23, 59, 59, 999);

    //  1. Find or create user
    let user = await User.findOne({ phone }).session(session);

    const normalize = (str) => str?.trim().toLowerCase();
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

    //  2. Get or create patient
    const patient = await Patient.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id },
      { upsert: true, returnDocument: 'after', session },
    );

    //  3. Find all doctors for specialization
    const doctors = await Doctor.find({ specialization }).session(session);

    if (!doctors.length) {
      throw new Error('No doctors found for this specialization');
    }

    //  4. Find earliest available slot across all doctors
    const doctorIds = doctors.map((doc) => doc._id);

    let slot = await Availability.findOne({
      doctorId: { $in: doctorIds },
      isBooked: false,
      date: { $gte: start, $lte: end },
    })
      .sort({ date: 1 })
      .session(session);

    //  Fallback → next available slot (if date not found)
    if (!slot) {
      slot = await Availability.findOne({
        doctorId: { $in: doctorIds },
        isBooked: false,
      })
        .sort({ date: 1 })
        .session(session);
    }

    if (!slot) {
      throw new Error('No available slots for any doctor');
    }

    //  5. Get doctor of selected slot
    const selectedDoctor = doctors.find((d) => d._id.equals(slot.doctorId));

    if (!selectedDoctor) {
      throw new Error('Doctor mismatch for slot');
    }
    // 6. Create appointment
    const appointment = await Appointment.create(
      [
        {
          patientId: patient._id,
          doctorId: selectedDoctor._id,
          availabilityId: slot._id,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: 'booked',
        },
      ],
      { session },
    );

    // 7. Mark slot booked
    const updatedSlot = await Availability.findOneAndUpdate(
      { _id: slot._id, isBooked: false },
      { isBooked: true },
      { session, returnDocument: 'after' },
    );

    console.log('TYPE:', typeof updatedSlot.date);
    console.log('VALUE:', updatedSlot.date);

    if (!updatedSlot) {
      throw new Error('Slot already booked by another user');
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: 'Appointment booked successfully',
      doctor: selectedDoctor.docterName,
      date: slot.date,
      time: `${slot.startTime} - ${slot.endTime}`,
      appointment: appointment[0],
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    console.error('ERROR:', error);

    return res.status(400).json({
      message: error.message,
    });
  }
};
export const getAvailableSlots = async (req, res) => {
  try {
    const { specialization, date } = req.query;

    if (!specialization || !date) {
      return res
        .status(400)
        .json({ message: 'Specialization and date are required' });
    }

    const inputDate = new Date(date);
    const start = new Date(inputDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(inputDate);
    end.setHours(23, 59, 59, 999);

    const doctors = await Doctor.find({ specialization });
    if (!doctors.length) {
      return res
        .status(404)
        .json({ message: 'No doctors found for this specialization' });
    }

    const doctorIds = doctors.map((d) => d._id);

    const slots = await Availability.find({
      doctorId: { $in: doctorIds },
      isBooked: false,
      date: { $gte: start, $lte: end },
    }).sort({ startTime: 1 });

    return res.status(200).json({
      specialization,
      date,
      slots,
    });
  } catch (error) {
    console.error('ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};
