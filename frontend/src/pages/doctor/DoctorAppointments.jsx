import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
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
      setError(err.response?.data?.message || 'Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = appointments.filter(a => {
    if (activeTab === 'BOOKED') return a.status === 'BOOKED' || a.status === 'HELD';
    if (activeTab === 'COMPLETED') return a.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return a.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Doctor's Patient Queue</h1>
        <p className="text-sm text-gray-600">Review patient symptoms, AI pre-visit insights, and conduct consultations</p>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {['ALL', 'BOOKED', 'COMPLETED', 'CANCELLED'].map((tab) => (
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
        <LoadingSpinner message="Loading patient list..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
          <p className="text-sm font-medium">No appointments found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((app) => (
            <div key={app.id || app._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{app.patient?.name || 'Patient'}</h3>
                    <p className="text-xs text-gray-500">{app.patient?.email}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    app.status === 'BOOKED' ? 'bg-amber-100 text-amber-800' :
                    app.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
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
                  to={`/doctor/appointments/${app.id || app._id}`}
                  className="flex-1 py-2 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl transition"
                >
                  Inspect AI Summary
                </Link>

                {app.status === 'BOOKED' && (
                  <Link
                    to={`/doctor/consultation/${app.id || app._id}`}
                    className="flex-1 py-2 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition shadow-xs"
                  >
                    Start Consultation 🩺
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
