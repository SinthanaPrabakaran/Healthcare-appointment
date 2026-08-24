import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const AdminDashboard = () => {
  const [doctorCount, setDoctorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getDoctors({ page: 1, limit: 1 });
      setDoctorCount(data.pagination?.totalDoctors || data.doctors?.length || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Admin Dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Banner */}
      <div className="bg-linear-to-r from-purple-700 to-indigo-900 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Portal — System Management ⚙️</h1>
        <p className="mt-2 text-purple-100 max-w-xl">
          Manage clinical doctors, configure working schedules, set consultation slot durations, and schedule leave dates.
        </p>
        <div className="mt-6">
          <Link
            to="/admin/doctors"
            className="px-5 py-2.5 bg-white text-purple-800 font-bold rounded-xl hover:bg-purple-50 transition shadow-xs text-sm"
          >
            Manage Doctors & Schedules 👨‍⚕️
          </Link>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Admin Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered Doctors</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{doctorCount}</p>
          </div>
          <span className="text-3xl p-3 bg-purple-50 text-purple-600 rounded-xl">👨‍⚕️</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Default Slot Duration</p>
            <p className="text-3xl font-extrabold text-indigo-600 mt-1">30 Mins</p>
          </div>
          <span className="text-3xl p-3 bg-indigo-50 text-indigo-600 rounded-xl">⏱️</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System Security</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">RBAC Active</p>
          </div>
          <span className="text-3xl p-3 bg-emerald-50 text-emerald-600 rounded-xl">🔒</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
