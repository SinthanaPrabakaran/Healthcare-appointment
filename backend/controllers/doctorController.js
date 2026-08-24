import Doctor from '../models/Doctor.js';

// @desc    Create a new doctor
// @route   POST /api/doctors
// @access  Private/Admin
export const createDoctor = async (req, res) => {
  try {
    const { name, specialization, slotDuration, workingHours, leaveDates } = req.body;

    // Validation
    if (!name || !specialization || !slotDuration) {
      return res.status(400).json({ message: 'Name, specialization, and slot duration are required.' });
    }

    if (typeof name !== 'string' || typeof specialization !== 'string') {
      return res.status(400).json({ message: 'Invalid input types.' });
    }

    const doctor = await Doctor.create({
      name,
      specialization,
      slotDuration,
      workingHours: workingHours || [],
      leaveDates: leaveDates || []
    });

    res.status(201).json({
      message: 'Doctor created successfully',
      doctor
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ message: 'Server error during doctor creation.' });
  }
};

// @desc    Update a doctor
// @route   PUT /api/doctors/:id
// @access  Private/Admin
export const updateDoctor = async (req, res) => {
  try {
    const { name, specialization, slotDuration, workingHours, leaveDates } = req.body;

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    // Update fields if provided
    if (name) doctor.name = name;
    if (specialization) doctor.specialization = specialization;
    if (slotDuration) doctor.slotDuration = slotDuration;
    if (workingHours) doctor.workingHours = workingHours;
    if (leaveDates) doctor.leaveDates = leaveDates;

    const updatedDoctor = await doctor.save();

    res.status(200).json({
      message: 'Doctor updated successfully',
      doctor: updatedDoctor
    });
  } catch (error) {
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

    await doctor.deleteOne();

    res.status(200).json({ message: 'Doctor deleted successfully.' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ message: 'Server error during doctor deletion.' });
  }
};

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private (Authenticated users)
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).json(doctors);
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
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error('Get doctor by ID error:', error);
    res.status(500).json({ message: 'Server error fetching doctor.' });
  }
};
