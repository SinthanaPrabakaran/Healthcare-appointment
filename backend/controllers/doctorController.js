import mongoose from 'mongoose';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

// @desc    Create a new doctor
// @route   POST /api/doctors
// @access  Private/Admin
export const createDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, slotDuration, workingHours, leaveDates } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password || !specialization || !slotDuration) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // 2. Check whether email already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Manual Rollback / Transaction logic
    // We avoid native MongoDB transactions here because they require a Replica Set.
    // In local dev environments, MongoDB often runs standalone, which causes transactions to crash.
    let createdUser;
    try {
      // 3. Create a User (password hashed by User model pre-save middleware)
      createdUser = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: 'DOCTOR' // Strictly enforce DOCTOR role
      });
    } catch (err) {
      return res.status(500).json({ message: 'Error creating user account.', error: err.message });
    }

    try {
      // 5. Create Doctor profile using the newly created user's _id
      const doctorProfile = await Doctor.create({
        userId: createdUser._id,
        specialization,
        slotDuration,
        workingHours: workingHours || {},
        leaveDates: leaveDates || []
      });

      // 8. Return the created doctor and safe user information (excluding password)
      res.status(201).json({
        message: 'Doctor created successfully',
        doctor: doctorProfile,
        user: {
          id: createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role
        }
      });
    } catch (err) {
      // If doctor profile creation fails, delete the orphaned user account
      await User.findByIdAndDelete(createdUser._id);
      return res.status(500).json({ message: 'Error creating doctor profile. Rolled back.', error: err.message });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists.' });
    }
    console.error('Create doctor error:', error);
    res.status(500).json({ message: 'Server error during doctor creation.' });
  }
};

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private (Authenticated users)
export const getDoctors = async (req, res) => {
  try {
    let { specialization, name, page = 1, limit = 10 } = req.query;

    let pageNum = parseInt(page, 10);
    let limitNum = parseInt(limit, 10);

    // Prevent unreasonable limits
    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (isNaN(limitNum) || limitNum < 1) limitNum = 10;
    if (limitNum > 50) limitNum = 50;

    const skip = (pageNum - 1) * limitNum;
    const query = {};

    // Specialization search (case-insensitive, partial match)
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    // Name search requires querying User collection first
    if (name) {
      const matchingUsers = await User.find({
        role: 'DOCTOR',
        name: { $regex: name, $options: 'i' }
      }).select('_id');
      
      const userIds = matchingUsers.map(user => user._id);
      query.userId = { $in: userIds };
    }

    // Fetch doctors with pagination and populate safe user fields
    const doctors = await Doctor.find(query)
      .populate('userId', 'name email role')
      .skip(skip)
      .limit(limitNum);
      
    // Get total count for pagination metadata
    const totalDoctors = await Doctor.countDocuments(query);
    const totalPages = totalDoctors > 0 ? Math.ceil(totalDoctors / limitNum) : 0;

    // Format response to flat structure
    const formattedDoctors = doctors.map(doc => ({
      id: doc._id,
      name: doc.userId ? doc.userId.name : 'Unknown',
      specialization: doc.specialization,
      workingHours: doc.workingHours,
      slotDuration: doc.slotDuration,
      leaveDates: doc.leaveDates
    }));

    res.status(200).json({
      doctors: formattedDoctors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalDoctors,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error fetching doctors.' });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Private (Authenticated users)
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId to prevent MongoDB CastError
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid doctor ID format.' });
    }

    const doctor = await Doctor.findById(id).populate('userId', 'name email role');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    // Format response to flat structure
    const formattedDoctor = {
      id: doctor._id,
      name: doctor.userId ? doctor.userId.name : 'Unknown',
      specialization: doctor.specialization,
      workingHours: doctor.workingHours,
      slotDuration: doctor.slotDuration,
      leaveDates: doctor.leaveDates
    };

    res.status(200).json({ doctor: formattedDoctor });
  } catch (error) {
    console.error('Get doctor by ID error:', error);
    res.status(500).json({ message: 'Server error fetching doctor.' });
  }
};

// @desc    Update a doctor
// @route   PUT /api/doctors/:id
// @access  Private/Admin
export const updateDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, slotDuration, workingHours, leaveDates } = req.body;

    const doctor = await Doctor.findById(req.params.id).populate('userId');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    const user = doctor.userId;

    // Update User fields if provided
    if (name) user.name = name;
    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (emailExists) return res.status(400).json({ message: 'Email is already in use.' });
      user.email = email.toLowerCase();
    }
    if (password) user.password = password; // Will be safely hashed by User model pre-save hook

    await user.save();

    // Update Doctor fields if provided
    if (specialization) doctor.specialization = specialization;
    if (slotDuration) doctor.slotDuration = slotDuration;
    if (workingHours) doctor.workingHours = workingHours;
    if (leaveDates) doctor.leaveDates = leaveDates;

    const updatedDoctor = await doctor.save();
    
    // Fetch again to populate and strip the password before returning
    const finalDoctor = await Doctor.findById(updatedDoctor._id).populate('userId', '-password');

    res.status(200).json({
      message: 'Doctor updated successfully',
      doctor: finalDoctor
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists.' });
    }
    console.error('Update doctor error:', error);
    res.status(500).json({ message: 'Server error during doctor update.' });
  }
};

// @desc    Delete a doctor
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    // Since our schema does not have an 'isActive' or 'status' field yet, 
    // we cannot perform a safe "soft delete" (deactivation). 
    // Therefore, we must hard-delete both the User and Doctor records.
    await User.findByIdAndDelete(doctor.userId);
    await doctor.deleteOne();

    res.status(200).json({ message: 'Doctor and associated user account deleted successfully.' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ message: 'Server error during doctor deletion.' });
  }
};
