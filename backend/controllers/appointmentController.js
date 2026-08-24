import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import { generateSlots } from '../services/slotService.js';

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private/Patient
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, symptoms } = req.body;
    const patientId = req.user.userId;

    // 1. Validate inputs
    if (!doctorId || !date || !startTime || !endTime || !symptoms) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    if (typeof symptoms !== 'string' || symptoms.trim().length < 5 || symptoms.trim().length > 1000) {
      return res.status(400).json({ message: 'Symptoms must be a string between 5 and 1000 characters' });
    }

    // 2. Validate real calendar date & past dates
    const [year, month, day] = date.split('-').map(Number);
    const requestedDate = new Date(year, month - 1, day); 
    
    if (
      requestedDate.getFullYear() !== year ||
      requestedDate.getMonth() !== month - 1 ||
      requestedDate.getDate() !== day
    ) {
      return res.status(400).json({ message: 'Invalid calendar date' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return res.status(400).json({ message: 'Cannot book an appointment for a past date' });
    }

    // 3. Find Doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // 4. Slot Validation using existing service
    if (doctor.leaveDates && doctor.leaveDates.includes(date)) {
      return res.status(400).json({ message: 'Doctor is on leave on this date' });
    }

    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const exactDateUTC = new Date(Date.UTC(year, month - 1, day));
    const dayName = daysOfWeek[exactDateUTC.getUTCDay()];

    const workingHours = doctor.workingHours[dayName];
    if (!workingHours || !workingHours.enabled) {
      return res.status(400).json({ message: 'Doctor does not work on this date' });
    }

    let generatedSlots = [];
    try {
      generatedSlots = generateSlots(workingHours, doctor.slotDuration);
    } catch (err) {
      return res.status(500).json({ message: 'Error generating doctor slots' });
    }

    const isValidSlot = generatedSlots.find(
      slot => slot.startTime === startTime && slot.endTime === endTime
    );

    if (!isValidSlot) {
      return res.status(400).json({ message: 'Invalid appointment slot' });
    }

    // 5. Duplicate Booking Check (Phase 6 simple check)
    // CANCELLED slots do not block re-booking
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date,
      startTime,
      status: 'BOOKED'
    });

    if (existingAppointment) {
      return res.status(409).json({ message: 'This appointment slot is already booked' });
    }

    // 6. Create Appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date,
      startTime,
      endTime,
      symptoms: symptoms.trim(),
      status: 'BOOKED'
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
    console.error('Book appointment error:', error);
    res.status(500).json({ message: 'Server error booking appointment' });
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
// @access  Private/Patient
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(id)
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

    if (appointment.patient.toString() !== patientId) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }

    const formattedAppointment = {
      id: appointment._id,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      symptoms: appointment.symptoms,
      status: appointment.status,
      doctor: {
        id: appointment.doctor._id,
        specialization: appointment.doctor.specialization,
        name: appointment.doctor.userId ? appointment.doctor.userId.name : 'Unknown'
      }
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
