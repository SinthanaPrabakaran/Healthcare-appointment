import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const DoctorDashboard = () => {
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
      const data = await appointmentService.getDoctorAppointments();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctor dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Doctor Portal..." />;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAppts = appointments.filter(a => a.date === todayStr);
  const pendingConsultations = appointments.filter(a => a.status === 'BOOKED');
  const completedAppts = appointments.filter(a => a.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Doctor Header */}
      <div className="bg-linear-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-extrabold tracking-tight">Doctor Portal — Welcome Dr. {user?.name}! 🩺</h1>
        <p className="mt-2 text-blue-100 max-w-xl">
          Review patient symptom histories, inspect AI pre-visit summaries, conduct consultations, and prescribe structured medications.
        </p>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Appointments</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{todaysAppts.length}</p>
          </div>
          <span className="text-3xl p-3 bg-blue-50 text-blue-600 rounded-xl">⏰</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Consultations</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-1">{pendingConsultations.length}</p>
          </div>
          <span className="text-3xl p-3 bg-amber-50 text-amber-600 rounded-xl">📋</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Patients</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{completedAppts.length}</p>
          </div>
          <span className="text-3xl p-3 bg-emerald-50 text-emerald-600 rounded-xl">✅</span>
        </div>
      </div>

      {/* Patient Appointments Table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Upcoming Patient Queue</h2>
          <Link to="/doctor/appointments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">View All Patients →</Link>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm font-medium">No patient appointments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left">Patient Name</th>
                  <th className="px-4 py-3 text-left">Date & Time</th>
                  <th className="px-4 py-3 text-left">Symptoms</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 text-gray-800 font-medium">
                {appointments.slice(0, 5).map((app) => (
                  <tr key={app.id || app._id}>
                    <td className="px-4 py-3 font-bold text-gray-900">{app.patient?.name || 'Patient'}</td>
                    <td className="px-4 py-3">{app.date} ({app.startTime} - {app.endTime})</td>
                    <td className="px-4 py-3 max-w-xs truncate">{app.symptoms}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        app.status === 'BOOKED' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link
                        to={`/doctor/appointments/${app.id || app._id}`}
                        className="inline-block px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg"
                      >
                        Inspect AI Summary
                      </Link>
                      {app.status === 'BOOKED' && (
                        <Link
                          to={`/doctor/consultation/${app.id || app._id}`}
                          className="inline-block px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                        >
                          Start Consultation 🩺
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
