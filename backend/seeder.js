import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import User from './models/User.js';
import Doctor from './models/Doctor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const defaultWorkDay = { enabled: true, start: '09:00', end: '17:00' };
const defaultOffDay = { enabled: false, start: '09:00', end: '17:00' };

const workingHours = {
  monday: defaultWorkDay,
  tuesday: defaultWorkDay,
  wednesday: defaultWorkDay,
  thursday: defaultWorkDay,
  friday: defaultWorkDay,
  saturday: defaultOffDay,
  sunday: defaultOffDay
};

const initialDoctors = [
  {
    name: 'Deepak Daniel',
    email: 'doctor@clinic.com',
    password: 'DoctorPassword123!',
    specialization: 'Dental',
    slotDuration: 45
  },
  {
    name: 'Sarah Morgan',
    email: 'doctor2@clinic.com',
    password: 'DoctorPassword123!',
    specialization: 'Cardiology',
    slotDuration: 30
  },
  {
    name: 'Alex Rivera',
    email: 'doctor3@clinic.com',
    password: 'DoctorPassword123!',
    specialization: 'Pediatrics',
    slotDuration: 30
  },
  {
    name: 'Priya Sharma',
    email: 'doctor4@clinic.com',
    password: 'DoctorPassword123!',
    specialization: 'Neurology',
    slotDuration: 30
  },
  {
    name: 'James Wilson',
    email: 'doctor5@clinic.com',
    password: 'DoctorPassword123!',
    specialization: 'Dermatology',
    slotDuration: 30
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting PulseCare Database Seeding...');

    // 1. Seed Admin User
    const adminExists = await User.findOne({ role: 'ADMIN' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@clinic.com',
        password: 'AdminPassword123!',
        role: 'ADMIN'
      });
      console.log('✅ Default ADMIN user created (admin@clinic.com)');
    } else {
      console.log('ℹ️ Admin user already exists.');
    }

    // 2. Seed Specialist Doctors
    for (const docData of initialDoctors) {
      let user = await User.findOne({ email: docData.email });
      if (!user) {
        user = await User.create({
          name: docData.name,
          email: docData.email,
          password: docData.password,
          role: 'DOCTOR'
        });
        console.log(`✅ Created doctor account: ${docData.name} (${docData.email})`);
      }

      let doctorProfile = await Doctor.findOne({ userId: user._id });
      if (!doctorProfile) {
        await Doctor.create({
          userId: user._id,
          specialization: docData.specialization,
          slotDuration: docData.slotDuration,
          workingHours,
          leaveDates: []
        });
        console.log(`✅ Created doctor profile for Dr. ${docData.name}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
