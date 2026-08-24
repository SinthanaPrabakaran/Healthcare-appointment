import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import { generateSlots } from '../services/slotService.js';
import { generatePreVisitSummary as generateSummaryLLM } from '../services/llmService.js';

// Helper function to validate inputs and doctor availability
const validateSlotRequest = async (doctorId, date, startTime, endTime, symptoms) => {
  if (!doctorId || !date || !startTime || !endTime || !symptoms) {
    throw { status: 400, message: 'All fields are required' };
  }
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw { status: 400, message: 'Invalid doctor ID format' };
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw { status: 400, message: 'Invalid date format. Use YYYY-MM-DD' };
  }
  if (typeof symptoms !== 'string' || symptoms.trim().length < 5 || symptoms.trim().length > 1000) {
    throw { status: 400, message: 'Symptoms must be a string between 5 and 1000 characters' };
  }

  const [year, month, day] = date.split('-').map(Number);
  const requestedDate = new Date(year, month - 1, day); 
  
  if (
    requestedDate.getFullYear() !== year ||
    requestedDate.getMonth() !== month - 1 ||
    requestedDate.getDate() !== day
  ) {
    throw { status: 400, message: 'Invalid calendar date' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (requestedDate < today) {
    throw { status: 400, message: 'Cannot book an appointment for a past date' };
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw { status: 404, message: 'Doctor not found' };
  }

  if (doctor.leaveDates && doctor.leaveDates.includes(date)) {
    throw { status: 400, message: 'Doctor is on leave on this date' };
  }

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const exactDateUTC = new Date(Date.UTC(year, month - 1, day));
  const dayName = daysOfWeek[exactDateUTC.getUTCDay()];

  const workingHours = doctor.workingHours[dayName];
  if (!workingHours || !workingHours.enabled) {
    throw { status: 400, message: 'Doctor does not work on this date' };
  }

  let generatedSlots = [];
  try {
    generatedSlots = generateSlots(workingHours, doctor.slotDuration);
  } catch (err) {
    throw { status: 500, message: 'Error generating doctor slots' };
  }

  const isValidSlot = generatedSlots.find(
    slot => slot.startTime === startTime && slot.endTime === endTime
  );

  if (!isValidSlot) {
    throw { status: 400, message: 'Invalid appointment slot' };
  }
  
  return doctor;
};

// Helper function to safely create appointment using DB partial unique index
const safeCreateAppointment = async (appointmentData) => {
  try {
    return await Appointment.create(appointmentData);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      // Find the conflicting appointment
      const conflictingAppt = await Appointment.findOne({
        doctor: appointmentData.doctor,
        date: appointmentData.date,
        startTime: appointmentData.startTime,
        status: { $in: ['BOOKED', 'HELD'] }
      });

      if (conflictingAppt) {
        // If the blocking appointment is an expired hold, clear it and retry!
        if (conflictingAppt.status === 'HELD' && conflictingAppt.holdExpiresAt && conflictingAppt.holdExpiresAt <= new Date()) {
          conflictingAppt.status = 'CANCELLED';
          conflictingAppt.holdExpiresAt = null;
          await conflictingAppt.save();

          try {
            return await Appointment.create(appointmentData);
          } catch (retryError) {
             throw { status: 409, message: 'This appointment slot is currently unavailable' };
          }
        }
      }
      throw { status: 409, message: 'This appointment slot is currently unavailable' };
    }
    throw error; // Other generic DB errors
  }
};

// @desc    Hold an appointment slot
// @route   POST /api/appointments/hold
// @access  Private/Patient
export const holdAppointment = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, symptoms } = req.body;
    const patientId = req.user.userId;

    await validateSlotRequest(doctorId, date, startTime, endTime, symptoms);

    const holdMinutes = parseInt(process.env.APPOINTMENT_HOLD_MINUTES, 10) || 5;
    const holdExpiresAt = new Date(Date.now() + holdMinutes * 60000);

    const appointment = await safeCreateAppointment({
      patient: patientId,
      doctor: doctorId,
      date,
      startTime,
      endTime,
      symptoms: symptoms.trim(),
      status: 'HELD',
      holdExpiresAt
    });

    res.status(201).json({
      message: 'Appointment slot held successfully',
      appointment: {
        id: appointment._id,
        status: appointment.status,
        holdExpiresAt: appointment.holdExpiresAt
      }
    });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Server error holding appointment';
    if (status === 500) console.error('Hold appointment error:', error);
    res.status(status).json({ message });
  }
};

// @desc    Confirm a held appointment
// @route   POST /api/appointments/:id/confirm
// @access  Private/Patient
export const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patient.toString() !== patientId) {
      return res.status(403).json({ message: 'Not authorized to confirm this appointment' });
    }

    if (appointment.status !== 'HELD') {
      return res.status(409).json({ message: 'Only held appointments can be confirmed' });
    }

    if (appointment.holdExpiresAt && appointment.holdExpiresAt <= new Date()) {
      return res.status(409).json({ message: 'This appointment hold has expired' });
    }

    appointment.status = 'BOOKED';
    appointment.holdExpiresAt = null;
    await appointment.save();

    res.status(200).json({
      message: 'Appointment confirmed successfully',
      appointment: {
        status: appointment.status
      }
    });
  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).json({ message: 'Server error confirming appointment' });
  }
};

// @desc    Book an appointment directly
// @route   POST /api/appointments
// @access  Private/Patient
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, symptoms } = req.body;
    const patientId = req.user.userId;

    await validateSlotRequest(doctorId, date, startTime, endTime, symptoms);

    const appointment = await safeCreateAppointment({
      patient: patientId,
      doctor: doctorId,
      date,
      startTime,
      endTime,
      symptoms: symptoms.trim(),
      status: 'BOOKED',
      holdExpiresAt: null
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id,
        doctorId: appointment.doctor,
        patientId: appointment.patient,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        symptoms: appointment.symptoms,
        status: appointment.status
      }
    });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Server error booking appointment';
    if (status === 500) console.error('Book appointment error:', error);
    res.status(status).json({ message });
  }
};

// @desc    Get logged in patient's appointments
// @route   GET /api/appointments/my
// @access  Private/Patient
export const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.userId;

    const appointments = await Appointment.find({ patient: patientId })
      .populate({
        path: 'doctor',
        select: 'specialization userId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      });

    const formattedAppointments = appointments.map(app => ({
      id: app._id,
      date: app.date,
      startTime: app.startTime,
      endTime: app.endTime,
      symptoms: app.symptoms,
      status: app.status,
      doctor: {
        id: app.doctor._id,
        specialization: app.doctor.specialization,
        name: app.doctor.userId ? app.doctor.userId.name : 'Unknown'
      }
    }));

    res.status(200).json({ appointments: formattedAppointments });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private/Patient, Doctor, or Admin
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(id)
      .populate('patient', 'name')
      .populate({
        path: 'doctor',
        select: 'specialization userId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (role === 'PATIENT' && appointment.patient._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }
    
    if (role === 'DOCTOR' && appointment.doctor.userId._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }

    if (role !== 'PATIENT' && role !== 'DOCTOR' && role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }

    const formattedAppointment = {
      id: appointment._id,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      symptoms: appointment.symptoms,
      status: appointment.status,
      patient: {
        id: appointment.patient._id,
        name: appointment.patient.name
      },
      doctor: {
        id: appointment.doctor._id,
        specialization: appointment.doctor.specialization,
        name: appointment.doctor.userId ? appointment.doctor.userId.name : 'Unknown'
      },
      preVisitSummary: appointment.preVisitSummary,
      postVisitNotes: appointment.postVisitNotes,
      prescription: appointment.prescription,
      followUpInstructions: appointment.followUpInstructions,
      completedAt: appointment.completedAt
    };

    res.status(200).json({ appointment: formattedAppointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error fetching appointment' });
  }
};

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private/Patient
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patient.toString() !== patientId) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    if (appointment.status === 'CANCELLED') {
      return res.status(200).json({ message: 'Appointment is already cancelled' });
    }

    if (appointment.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Cannot cancel a completed appointment' });
    }

    appointment.status = 'CANCELLED';
    appointment.holdExpiresAt = null; // Clear hold if it was HELD
    await appointment.save();

    res.status(200).json({
      message: 'Appointment cancelled successfully',
      appointment: {
        id: appointment._id,
        doctorId: appointment.doctor,
        patientId: appointment.patient,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        symptoms: appointment.symptoms,
        status: appointment.status
      }
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Server error cancelling appointment' });
  }
};

// @desc    Generate pre-visit summary
// @route   POST /api/appointments/:id/previsit-summary
// @access  Private/Doctor or Admin
export const generatePreVisitSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user; // Authenticated user

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(id).populate('doctor');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Role Validation
    if (role === 'DOCTOR') {
      if (appointment.doctor.userId.toString() !== userId) {
        return res.status(403).json({ message: 'You are not authorized to access this appointment' });
      }
    } else if (role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    if (!appointment.symptoms || appointment.symptoms.trim() === '') {
      return res.status(400).json({ message: 'No symptoms available for this appointment' });
    }

    let summaryResult;
    try {
      summaryResult = await generateSummaryLLM(appointment.symptoms);
    } catch (llmError) {
      console.error('LLM Service Error:', llmError.message);
      return res.status(503).json({ message: 'Pre-visit summary is temporarily unavailable' });
    }

    // Save to DB
    appointment.preVisitSummary = {
      ...summaryResult,
      generatedAt: new Date()
    };

    await appointment.save();

    res.status(200).json({
      message: 'Pre-visit summary generated successfully',
      preVisitSummary: appointment.preVisitSummary
    });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({ message: 'Server error generating summary' });
  }
};

// @desc    Get pre-visit summary
// @route   GET /api/appointments/:id/previsit-summary
// @access  Private/Doctor or Admin
export const getPreVisitSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(id).populate('doctor');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (role === 'DOCTOR') {
      if (appointment.doctor.userId.toString() !== userId) {
        return res.status(403).json({ message: 'You are not authorized to access this appointment' });
      }
    } else if (role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    res.status(200).json({
      preVisitSummary: appointment.preVisitSummary || null
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error fetching summary' });
  }
};

// @desc    Get logged in doctor's appointments
// @route   GET /api/appointments/doctor
// @access  Private/Doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorUser = await Doctor.findOne({ userId: req.user.userId });
    if (!doctorUser) {
        return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctor: doctorUser._id })
      .populate('patient', 'name');

    const formattedAppointments = appointments.map(app => ({
      id: app._id,
      date: app.date,
      startTime: app.startTime,
      endTime: app.endTime,
      symptoms: app.symptoms,
      status: app.status,
      patient: {
        id: app.patient._id,
        name: app.patient.name
      },
      completedAt: app.completedAt
    }));

    res.status(200).json({ appointments: formattedAppointments });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
};

// @desc    Complete a consultation and add notes
// @route   PUT /api/appointments/:id/complete
// @access  Private/Doctor
export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { postVisitNotes, prescription, followUpInstructions } = req.body;
    const { userId, role } = req.user;

    if (role !== 'DOCTOR') {
        return res.status(403).json({ message: 'Only doctors can complete appointments' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(id).populate('doctor');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctor.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to complete this appointment' });
    }

    if (appointment.status === 'COMPLETED') {
        return res.status(409).json({ message: 'Appointment is already completed' });
    }

    if (appointment.status !== 'BOOKED') {
        return res.status(409).json({ message: 'Appointment cannot be completed in its current state' });
    }

    if (!postVisitNotes || typeof postVisitNotes !== 'string' || postVisitNotes.trim() === '') {
        return res.status(400).json({ message: 'Post-visit notes are required' });
    }

    if (prescription !== undefined) {
        if (!Array.isArray(prescription)) {
            return res.status(400).json({ message: 'Prescription must be an array' });
        }
        for (const med of prescription) {
            if (!med.medicine || typeof med.medicine !== 'string' || med.medicine.trim() === '' ||
                !med.dosage || typeof med.dosage !== 'string' || med.dosage.trim() === '' ||
                !med.frequency || typeof med.frequency !== 'string' || med.frequency.trim() === '' ||
                !med.duration || typeof med.duration !== 'string' || med.duration.trim() === '') {
                return res.status(400).json({ message: 'Malformed medication entry in prescription' });
            }
        }
    }

    appointment.postVisitNotes = postVisitNotes.trim();
    
    if (prescription) {
        appointment.prescription = prescription.map(med => ({
            medicine: med.medicine.trim(),
            dosage: med.dosage.trim(),
            frequency: med.frequency.trim(),
            duration: med.duration.trim(),
            instructions: med.instructions ? med.instructions.trim() : ""
        }));
    }

    if (followUpInstructions && typeof followUpInstructions === 'string') {
        appointment.followUpInstructions = followUpInstructions.trim();
    }

    appointment.status = 'COMPLETED';
    appointment.completedAt = new Date();

    await appointment.save();

    res.status(200).json({
      message: 'Appointment completed successfully',
      appointment: {
        id: appointment._id,
        status: appointment.status,
        completedAt: appointment.completedAt,
        postVisitNotes: appointment.postVisitNotes,
        prescription: appointment.prescription,
        followUpInstructions: appointment.followUpInstructions
      }
    });

  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({ message: 'Server error completing appointment' });
  }
};
