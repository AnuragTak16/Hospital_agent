import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
dotenv.config();

// Create a one-time script and run it.
const DATABASE_URL = process.env.DATABASE_API;

const run = async () => {
  await mongoose.connect(DATABASE_URL);

  const phone = process.env.ADMIN_NUMBER;

  const admin = await User.create({
    name: 'Admin',
    phone,
    role: 'admin',
    isVerified: true,
  });

  console.log('Admin created:', admin);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
