import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding...');

    const adminExists = await User.findOne({ role: 'ADMIN' });
    
    if (adminExists) {
      console.log('An ADMIN user already exists in the database.');
      process.exit(0);
    }

    await User.create({
      name: 'System Admin',
      email: 'admin@clinic.com',
      password: 'AdminPassword123!',
      role: 'ADMIN'
    });

    console.log('✅ Default ADMIN user created successfully!');
    console.log('Email: admin@clinic.com');
    console.log('Password: AdminPassword123!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedAdmin();
