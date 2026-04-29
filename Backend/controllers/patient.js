import Patient from '../models/patient.js';
import User from '../models/userModel.js';


export const createOrGetPatient = async (req, res) => {
  try {
    let { name, phone, age, gender } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone is required' });
    }

    phone = phone.trim();

    // 1. Find user by phone
    let user = await User.findOne({ phone });

    // 2. If user exists → verify name
    if (user) {
      if (user.name && name) {
        const normalize = (str) => str.trim().toLowerCase();

        if (normalize(user.name) !== normalize(name)) {
          return res.status(200).json({
            message: 'Name mismatch',
            expectedName: user.name,
            action: 'CONFIRM_OR_CREATE_NEW',
          });
        }
      }
    }

    // 3. Create or update user
    user = await User.findOneAndUpdate(
      { phone },
      {
        $set: {
          ...(name && { name }),
          role: 'patient',
        },
      },
      { upsert: true, returnDocument: 'after' },
    );

    // 4. Create or update patient
    const patient = await Patient.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          ...(age !== undefined && { age }),
          ...(gender && { gender }),
        },
        $setOnInsert: {
          userId: user._id,
        },
      },
      { upsert: true, returnDocument: 'after' },
    );

    return res.status(200).json({
      message: 'Patient verified',
      user,
      patient,
    });
  } catch (error) {
    console.error('❌ ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const getPatientByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patient = await Patient.findOne({ userId: user._id });

    return res.status(200).json({ user, patient });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
