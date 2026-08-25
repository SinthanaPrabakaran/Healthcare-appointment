import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  Sparkles, 
  Timer, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft,
  CalendarX,
  FileText,
  ShieldAlert
} from 'lucide-react';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [heldAppointment, setHeldAppointment] = useState(null);
  const [holdTimeLeft, setHoldTimeLeft] = useState(300); // 5 minutes (300s)

  const [symptoms, setSymptoms] = useState('');
  const [preVisitTriage, setPreVisitTriage] = useState(null);
  const [triageLoading, setTriageLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    if (doctor && selectedDate) {
      fetchSlots();
    }
  }, [doctor, selectedDate]);

  // Countdown timer effect for held appointment slot
  useEffect(() => {
    let timer;
    if (heldAppointment && holdTimeLeft > 0) {
      timer = setInterval(() => {
        setHoldTimeLeft((prev) => {
          if (prev <= 1) {
            setHeldAppointment(null);
            setError('Slot hold expired. Please re-select an available slot.');
            fetchSlots();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [heldAppointment, holdTimeLeft]);

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getDoctorById(id);
      setDoctor(data.doctor);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctor details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      setSlotsLoading(true);
      setSelectedSlot(null);
      setHeldAppointment(null);
      const data = await doctorService.getSlots(id, selectedDate);
      setSlots(data.slots || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSelectSlot = async (slot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
    setError('');

    // Trigger slot hold API call
    try {
      const holdRes = await appointmentService.holdSlot({
        doctorId: id,
        date: selectedDate,
        startTime: slot.startTime,
        endTime: slot.endTime
      });
      setHeldAppointment(holdRes.appointment);
      setHoldTimeLeft(300); // 5 minutes
    } catch (err) {
      if (err.response?.status === 409) {
        setError('This slot was just selected by another patient. Please pick another time.');
        fetchSlots();
      } else {
        console.warn('Hold warning:', err.response?.data?.message);
      }
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available consultation slot.');
      return;
    }

    if (!symptoms.trim()) {
      setError('Please describe your symptoms before confirming.');
      return;
    }

    try {
      setBookingLoading(true);
      setError('');

      let apptId = heldAppointment?.id || heldAppointment?._id;

      if (apptId) {
        // Confirm held appointment
        await appointmentService.confirmAppointment(apptId);
      } else {
        // Direct booking
        const res = await appointmentService.bookAppointment({
          doctorId: id,
          date: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          symptoms: symptoms.trim()
        });
        apptId = res.appointment.id || res.appointment._id;
      }

      setSuccessMsg('Consultation confirmed! Automated Google Calendar event synced & confirmation email queued.');

      setTimeout(() => {
        navigate(`/patient/appointments/${apptId}`);
      }, 1500);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('This slot was just booked by another patient. Please select another slot.');
        fetchSlots();
      } else {
        setError(err.response?.data?.message || 'Booking failed. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner message="Retrieving doctor profile & slot availability..." />;
  if (!doctor) return <AlertMessage type="error" message="Doctor profile not found." />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      <Link to="/patient/doctors" className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Specialist Directory</span>
      </Link>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={successMsg} />

      {/* Doctor Info Card */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-500/20 via-cyan-500/20 to-teal-400/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold shadow-lg">
            <Stethoscope className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-white">Dr. {doctor.name}</h1>
            <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold text-xs rounded-lg">
              {doctor.specialization}
            </span>
            <p className="text-xs text-slate-400 flex items-center space-x-1 pt-1">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>Consultation Slot: <strong className="text-slate-200">{doctor.slotDuration} mins</strong></span>
            </p>
          </div>
        </div>

        {/* Doctor Schedule Pill */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs space-y-1 text-slate-300">
          <p className="font-bold text-white uppercase tracking-wider text-[11px]">📅 Clinical Schedule</p>
          <p><strong className="text-slate-400">Days:</strong> {doctor.workingHours ? doctor.workingHours.map(w => w.day).join(', ') : 'Mon - Fri'}</p>
          <p><strong className="text-slate-400">Leave Dates:</strong> {doctor.leaveDates && doctor.leaveDates.length > 0 ? doctor.leaveDates.join(', ') : 'None'}</p>
        </div>
      </div>

      {/* 5-Minute Hold Countdown Banner */}
      {heldAppointment && (
        <div className="glass-card border-amber-500/40 bg-amber-500/10 p-5 rounded-2xl flex items-center justify-between shadow-xl pulsing-hold-banner">
          <div className="flex items-center space-x-3">
            <Timer className="w-6 h-6 text-amber-400 animate-spin" />
            <div>
              <div className="text-sm font-bold text-amber-300 flex items-center space-x-2">
                <span>Slot Reserved for You!</span>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-xs font-black rounded-md">
                  {formatCountdown(holdTimeLeft)}
                </span>
              </div>
              <p className="text-xs text-amber-200/80">
                Slot ({selectedSlot?.startTime} - {selectedSlot?.endTime}) is locked so no other patient can book it. Complete symptoms to finalize.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Slot Picker & Booking Form */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-teal-400" />
          <span>Select Consultation Date & Time Slot</span>
        </h2>

        {/* Date Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Select Appointment Date
          </label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-72 px-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-teal-400"
          />
        </div>

        {/* Slots Grid */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Available Consultation Slots
          </label>
          {slotsLoading ? (
            <LoadingSpinner message="Checking real-time slot availability..." />
          ) : slots.length === 0 ? (
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-400 text-xs flex items-center space-x-2">
              <CalendarX className="w-4 h-4 text-amber-400" />
              <span>No consultation slots available on this date. Doctor may be on leave or fully booked.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {slots.map((slot, idx) => {
                const isSelected = selectedSlot?.startTime === slot.startTime;
                const isAvailable = slot.available;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => handleSelectSlot(slot)}
                    className={`p-3.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                      !isAvailable
                        ? 'bg-slate-900/40 text-slate-600 border-slate-800 line-through cursor-not-allowed'
                        : isSelected
                        ? 'bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 border-teal-300 shadow-lg teal-glow font-black scale-105'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                  >
                    <span>{slot.startTime} - {slot.endTime}</span>
                    <span className="text-[10px] font-semibold opacity-80 uppercase">
                      {!isAvailable ? 'Booked' : isSelected ? 'Held' : 'Available'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Symptoms Form */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Describe Patient Symptoms <span className="text-red-400">*</span></span>
          </label>
          <textarea
            rows="4"
            required
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe symptoms in detail (e.g., persistent fever for 3 days, dry cough, severe headache)..."
            className="w-full p-4 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400"
          ></textarea>
        </div>

        {/* Live Gemini AI Pre-Visit Preview Card */}
        {symptoms.length > 10 && (
          <div className="glass-card p-5 rounded-2xl border border-teal-500/40 bg-teal-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300 flex items-center space-x-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
                <span>Live Gemini AI Pre-Visit Triage Preview</span>
              </span>
              <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 text-[10px] font-extrabold rounded-md border border-teal-500/30">
                v3.6-Flash
              </span>
            </div>
            <p className="text-xs text-slate-300 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              "Symptoms logged will generate an automated chief complaint summary and 3 diagnostic questions for Dr. {doctor.name} prior to your visit."
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleBooking}
          disabled={bookingLoading || !selectedSlot}
          className="w-full py-4 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black text-sm rounded-xl shadow-xl teal-glow transition duration-200 disabled:opacity-40 flex items-center justify-center space-x-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{bookingLoading ? 'Securing Appointment Slot...' : 'Confirm Appointment Booking'}</span>
        </button>

      </div>
    </div>
  );
};

export default DoctorDetails;
