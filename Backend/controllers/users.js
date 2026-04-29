import User from '../models/User.js';

export const createUser = async (req, res) => {
  try {
    const { phone, role } = req.body;

    if (!phone || !role) {
      return res.status(400).json({ message: 'Phone and role are required' });
    }

    let user = await User.findOne({ phone });

    if (user) {
      return res.status(200).json({
        message: 'User already exists',
        user,
      });
    }

    user = await User.create({ name, phone, role });

    return res.status(201).json({
      message: 'User created',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
