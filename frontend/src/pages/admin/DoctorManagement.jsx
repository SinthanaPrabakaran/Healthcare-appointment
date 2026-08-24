import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    slotDuration: 30,
    leaveDates: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getDoctors({ limit: 100 });
      setDoctors(data.doctors || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctors list.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (doctor = null) => {
    setError('');
    if (doctor) {
      setEditingDoctorId(doctor.id || doctor._id);
      setFormData({
        name: doctor.name || '',
        email: doctor.email || '',
        password: '',
        specialization: doctor.specialization || '',
        slotDuration: doctor.slotDuration || 30,
        leaveDates: doctor.leaveDates ? doctor.leaveDates.join(', ') : ''
      });
    } else {
      setEditingDoctorId(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        specialization: '',
        slotDuration: 30,
        leaveDates: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');

      const parsedLeaveDates = formData.leaveDates
        ? formData.leaveDates.split(',').map(d => d.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name,
        email: formData.email,
        specialization: formData.specialization,
        slotDuration: Number(formData.slotDuration),
        leaveDates: parsedLeaveDates
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingDoctorId) {
        await doctorService.updateDoctor(editingDoctorId, payload);
        setSuccessMsg('Doctor profile updated successfully.');
      } else {
        await doctorService.createDoctor(payload);
        setSuccessMsg('New doctor added successfully.');
      }

      setIsModalOpen(false);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save doctor details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await doctorService.deleteDoctor(id);
      setSuccessMsg('Doctor deleted successfully.');
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete doctor.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Doctor Management 👨‍⚕️</h1>
          <p className="text-sm text-gray-600">Add, edit, or configure doctor profiles, working hours, and leave schedules</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          + Add New Doctor
        </button>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {loading ? (
        <LoadingSpinner message="Loading doctors list..." />
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
          <p className="text-sm font-medium">No doctors registered yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4 text-left">Doctor Name</th>
                  <th className="px-6 py-4 text-left">Specialization</th>
                  <th className="px-6 py-4 text-left">Slot Duration</th>
                  <th className="px-6 py-4 text-left">Leave Dates</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 text-gray-800 font-medium">
                {doctors.map((doc) => (
                  <tr key={doc.id || doc._id}>
                    <td className="px-6 py-4 font-bold text-gray-900">{doc.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 font-semibold text-xs rounded-full">
                        {doc.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-4">{doc.slotDuration} mins</td>
                    <td className="px-6 py-4 text-gray-500">{doc.leaveDates && doc.leaveDates.length > 0 ? doc.leaveDates.join(', ') : 'None'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(doc)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc.id || doc._id)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-lg transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-gray-900">
                {editingDoctorId ? 'Edit Doctor Profile' : 'Add New Doctor'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveDoctor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. Rahul Kumar"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="doctor@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Password {editingDoctorId && '(Leave blank to keep unchanged)'}
                </label>
                <input
                  type="password"
                  required={!editingDoctorId}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Specialization</label>
                <input
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="Cardiology, Pediatrics, General"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Slot Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  min="10"
                  max="120"
                  value={formData.slotDuration}
                  onChange={(e) => setFormData({ ...formData, slotDuration: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Leave Dates (Comma-separated YYYY-MM-DD)</label>
                <input
                  type="text"
                  value={formData.leaveDates}
                  onChange={(e) => setFormData({ ...formData, leaveDates: e.target.value })}
                  placeholder="2026-08-30, 2026-09-01"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorManagement;
