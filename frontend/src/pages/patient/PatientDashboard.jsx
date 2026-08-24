import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getPatientAppointments();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

  const upcomingAppt = appointments.find(a => a.status === 'BOOKED' || a.status === 'HELD');
  const completedAppts = appointments.filter(a => a.status === 'COMPLETED');
  const recentCompleted = completedAppts.length > 0 ? completedAppts[0] : null;

  // Extract all prescribed medications from completed appointments
  const allMedications = appointments
    .filter(a => a.prescription && Array.isArray(a.prescription))
    .flatMap(a => a.prescription);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user?.name}! 👋</h1>
          <p className="mt-2 text-indigo-100 max-w-xl">
            Track your upcoming healthcare consultations, AI symptom summaries, prescriptions, and medication schedules.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              to="/patient/doctors"
              className="px-5 py-2.5 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition shadow-xs text-sm"
            >
              Book New Appointment 🩺
            </Link>
            <Link
              to="/patient/appointments"
              className="px-5 py-2.5 bg-indigo-500/30 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-indigo-500/40 transition text-sm"
            >
              View My Appointments
            </Link>
          </div>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Appointments</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{appointments.length}</p>
          </div>
          <span className="text-3xl p-3 bg-indigo-50 text-indigo-600 rounded-xl">📅</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Consultations</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{completedAppts.length}</p>
          </div>
          <span className="text-3xl p-3 bg-emerald-50 text-emerald-600 rounded-xl">✅</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Medications</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{allMedications.length}</p>
          </div>
          <span className="text-3xl p-3 bg-amber-50 text-amber-600 rounded-xl">💊</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Upcoming Appointment */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>⏰</span> Next Upcoming Appointment
            </h2>
            <Link to="/patient/appointments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">View All →</Link>
          </div>

          {upcomingAppt ? (
            <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{upcomingAppt.doctor?.name || 'Doctor'}</h3>
                  <p className="text-xs font-medium text-indigo-600">{upcomingAppt.doctor?.specialization || 'General Practice'}</p>
                </div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 font-semibold text-xs rounded-full">
                  {upcomingAppt.status}
                </span>
              </div>
              <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-indigo-100">
                <p><strong>Date:</strong> {upcomingAppt.date}</p>
                <p><strong>Time:</strong> {upcomingAppt.startTime} - {upcomingAppt.endTime}</p>
                <p><strong>Symptoms:</strong> {upcomingAppt.symptoms}</p>
              </div>
              <div className="pt-2">
                <Link
                  to={`/patient/appointments/${upcomingAppt.id}`}
                  className="inline-block w-full text-center py-2 px-4 bg-indigo-600 text-white font-semibold text-xs rounded-lg hover:bg-indigo-700 transition"
                >
                  View Details & AI Summary
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-sm font-medium">No upcoming appointments scheduled.</p>
              <Link to="/patient/doctors" className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:underline">
                Find a doctor to book an appointment
              </Link>
            </div>
          )}
        </div>

        {/* Recent AI Post-Visit Summary */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>📋</span> Recent Post-Visit Summary
            </h2>
          </div>

          {recentCompleted && recentCompleted.postVisitSummary ? (
            <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Doctor Notes Summary</span>
                <span className="text-xs text-gray-500">{recentCompleted.date}</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-emerald-100">
                {recentCompleted.postVisitSummary}
              </p>
              <div className="pt-1">
                <Link
                  to={`/patient/appointments/${recentCompleted.id}`}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  View Full Consultation Details & Prescription →
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-sm font-medium">No recent post-visit summaries available.</p>
              <p className="text-xs text-gray-400 mt-1">Summaries are generated after a doctor completes your consultation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
