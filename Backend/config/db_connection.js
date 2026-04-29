import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

const db_connection = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_API);
    console.log('Database connected');
  } catch (error) {
    console.log(error);
  }
};

export default db_connection;
