import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState('');

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
      const data = await doctorService.getSlots(id, selectedDate);
      setSlots(data.slots || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available time slot.');
      return;
    }

    if (!symptoms.trim()) {
      setError('Please provide your symptoms before booking.');
      return;
    }

    try {
      setBookingLoading(true);
      setError('');

      const bookingPayload = {
        doctorId: id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        symptoms: symptoms.trim()
      };

      const res = await appointmentService.bookAppointment(bookingPayload);

      setSuccessMsg('Appointment booked successfully! Confirmation email and calendar synchronization queued.');

      setTimeout(() => {
        navigate(`/patient/appointments/${res.appointment.id || res.appointment._id}`);
      }, 1500);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('This slot was just booked by another patient. Please select another slot.');
        fetchSlots(); // Refresh slots
      } else {
        setError(err.response?.data?.message || 'Booking failed. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading doctor profile..." />;
  if (!doctor) return <AlertMessage type="error" message="Doctor profile not found." />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <Link to="/patient/doctors" className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-500">
        ← Back to Doctors List
      </Link>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={successMsg} />

      {/* Doctor Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl">
            👨‍⚕️
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Dr. {doctor.name}</h1>
            <span className="inline-block mt-1 px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-full">
              {doctor.specialization}
            </span>
            <p className="text-xs text-gray-500 mt-2">Consultation Duration: {doctor.slotDuration} minutes</p>
          </div>
        </div>

        {/* Working Hours Pill */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-1">
          <p className="font-bold text-gray-900 mb-1">📅 Schedule Info</p>
          <p><strong>Days:</strong> {doctor.workingHours ? doctor.workingHours.map(w => w.day).join(', ') : 'Mon - Fri'}</p>
          <p><strong>Leave Dates:</strong> {doctor.leaveDates && doctor.leaveDates.length > 0 ? doctor.leaveDates.join(', ') : 'None'}</p>
        </div>
      </div>

      {/* Interactive Booking Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Book an Appointment</h2>

        {/* Date Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm font-medium outline-none"
          />
        </div>

        {/* Slots Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Select Time Slot</label>
          {slotsLoading ? (
            <LoadingSpinner message="Checking available slots..." />
          ) : slots.length === 0 ? (
            <p className="text-sm text-gray-500 bg-amber-50 p-4 rounded-xl border border-amber-100">
              No available slots on this date. Doctor may be off or fully booked. Please select another date.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {slots.map((slot, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 rounded-xl border text-xs font-semibold transition ${
                    !slot.available
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                      : selectedSlot?.startTime === slot.startTime
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-500'
                  }`}
                >
                  {slot.startTime} - {slot.endTime}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Symptoms Form */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Describe Your Symptoms <span className="text-red-500">*</span></label>
          <textarea
            rows="4"
            required
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe your symptoms (e.g. persistent headache for 3 days, mild fever)..."
            className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm outline-none transition"
          ></textarea>
        </div>

        <button
          type="button"
          onClick={handleBooking}
          disabled={bookingLoading || !selectedSlot}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition text-sm disabled:opacity-50"
        >
          {bookingLoading ? 'Confirming Appointment...' : 'Confirm Appointment Booking 🚀'}
        </button>
      </div>
    </div>
  );
};

export default DoctorDetails;
