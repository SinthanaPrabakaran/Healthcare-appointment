import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await appointmentService.getPatientAppointments();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      setActionMsg('Cancelling appointment...');
      await appointmentService.cancelAppointment(id);
      setActionMsg('Appointment cancelled successfully.');
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  const filtered = appointments.filter(a => {
    if (activeTab === 'UPCOMING') return a.status === 'BOOKED' || a.status === 'HELD';
    if (activeTab === 'COMPLETED') return a.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return a.status === 'CANCELLED';
    return true;
  });

  const statusBadge = {
    BOOKED: 'bg-indigo-100 text-indigo-800',
    HELD: 'bg-amber-100 text-amber-800',
    COMPLETED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Appointments</h1>
          <p className="text-sm text-gray-600">View and manage your healthcare bookings</p>
        </div>
        <Link
          to="/patient/doctors"
          className="px-4 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition shadow-xs text-center"
        >
          Book New Appointment 🩺
        </Link>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />
      <AlertMessage type="info" message={actionMsg} onClose={() => setActionMsg('')} />

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your appointments..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
          <span className="text-4xl">📅</span>
          <h3 className="mt-3 text-lg font-bold text-gray-900">No appointments found</h3>
          <p className="text-sm text-gray-500 mt-1">There are no {activeTab.toLowerCase()} appointments listed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((app) => (
            <div key={app.id || app._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{app.doctor?.name || 'Doctor'}</h3>
                    <p className="text-xs font-semibold text-indigo-600">{app.doctor?.specialization || 'Specialist'}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusBadge[app.status] || 'bg-gray-100'}`}>
                    {app.status}
                  </span>
                </div>

                <div className="mt-4 text-xs text-gray-600 space-y-1 pt-3 border-t border-gray-100">
                  <p><strong>Date:</strong> {app.date}</p>
                  <p><strong>Time:</strong> {app.startTime} - {app.endTime}</p>
                  <p><strong>Symptoms:</strong> {app.symptoms}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Link
                  to={`/patient/appointments/${app.id || app._id}`}
                  className="flex-1 py-2 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl transition"
                >
                  View Details & AI Summary
                </Link>

                {(app.status === 'BOOKED' || app.status === 'HELD') && (
                  <button
                    onClick={() => handleCancel(app.id || app._id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
