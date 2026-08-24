import mongoose from 'mongoose';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { generateSlots } from '../services/slotService.js';

export const getDoctorSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    // 1. Validate doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID' });
    }

    // 2. Validate date is present
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // 3. Validate strict YYYY-MM-DD format (no JS date strings)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // 4. Validate real calendar date (reject 2026-02-30)
    // Extract year, month, day as integers
    const [year, month, day] = date.split('-').map(Number);
    
    // Construct a Date object in UTC to avoid server timezone shifts
    const exactDate = new Date(Date.UTC(year, month - 1, day));
    
    // Check if the constructed date perfectly matches the input 
    // (e.g. Feb 30 wraps to Mar 2 in JS, which breaks this check, proving it invalid)
    if (
      exactDate.getUTCFullYear() !== year || 
      exactDate.getUTCMonth() !== month - 1 || 
      exactDate.getUTCDate() !== day
    ) {
      return res.status(400).json({ message: 'Invalid calendar date' });
    }

    // Lookup Doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if requested date is exactly a leave date
    if (doctor.leaveDates && doctor.leaveDates.includes(date)) {
      return res.status(200).json({
        doctorId,
        date,
        isLeave: true,
        isWorkingDay: false,
        slots: []
      });
    }

    // Determine day of the week based purely on the supplied calendar date (ignoring timezone)
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = daysOfWeek[exactDate.getUTCDay()];

    const workingHours = doctor.workingHours[dayName];

    // If day is entirely disabled or missing
    if (!workingHours || !workingHours.enabled) {
      return res.status(200).json({
        doctorId,
        date,
        isLeave: false,
        isWorkingDay: false,
        slots: []
      });
    }

    // Generate slots
    try {
      const generatedSlots = generateSlots(workingHours, doctor.slotDuration);
      
      // Phase 7: Reflect BOOKED and active HELD appointments
      const activeAppointments = await Appointment.find({
        doctor: doctorId,
        date: date,
        status: { $in: ['BOOKED', 'HELD'] }
      });

      const now = new Date();

      const slots = generatedSlots.map(slot => {
        // Find if this slot is taken
        const conflict = activeAppointments.find(app => app.startTime === slot.startTime);
        
        let available = true;
        if (conflict) {
          if (conflict.status === 'BOOKED') {
            available = false;
          } else if (conflict.status === 'HELD') {
            if (conflict.holdExpiresAt && conflict.holdExpiresAt > now) {
              available = false;
            } else {
              // Expired hold: available = true
              available = true;
            }
          }
        }

        return {
          ...slot,
          available
        };
      });

      return res.status(200).json({
        doctorId,
        date,
        isLeave: false,
        isWorkingDay: true,
        slots
      });
    } catch (err) {
      return res.status(400).json({ message: err.message }); // Handles invalid slotDuration or workingHours from service
    }

  } catch (error) {
    console.error('Get doctor slots error:', error);
    res.status(500).json({ message: 'Server error retrieving slots' });
  }
};
