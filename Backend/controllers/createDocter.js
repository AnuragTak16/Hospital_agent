import Doctor from '../models/docter.js';
import User from '../models/userModel.js';

export const createDoctor = async (req, res) => {
  try {
    const { name, phone, specialization } = req.body;

    if (!phone || !specialization) {
      return res
        .status(400)
        .json({ message: 'Phone and specialization required' });
    }

    // 1. Create or get USER (role: doctor)
    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        name,
        phone,
        role: 'doctor',
        isVerified: true,
      });
    }

    // 2. Create doctor profile
    let doctor = await Doctor.findOne({ userId: user._id });

    if (doctor) {
      return res.status(200).json({
        message: 'Doctor already exists',
        doctor,
      });
    }

    doctor = await Doctor.create({
      docterName: name,
      userId: user._id,
      specialization,
    });

    return res.status(201).json({
      message: 'Doctor created',
      user,
      doctor,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// controllers/doctorController.js

export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'name phone');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
