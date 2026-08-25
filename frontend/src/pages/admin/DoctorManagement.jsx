import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { Plus, Stethoscope, Edit3, Trash2, X, CalendarX, Clock, AlertTriangle, UserPlus, Sparkles } from 'lucide-react';

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
        setSuccessMsg('Doctor profile & leave dates updated. Automated cancellation job queued for affected appointments.');
      } else {
        await doctorService.createDoctor(payload);
        setSuccessMsg('New physician profile created successfully.');
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
    if (!window.confirm('Are you sure you want to delete this physician profile?')) return;
    try {
      await doctorService.deleteDoctor(id);
      setSuccessMsg('Doctor profile removed successfully.');
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete doctor.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical Staff Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Doctor & Schedule Management</h1>
          <p className="text-sm text-slate-400">Configure physician accounts, slot durations, working hours, and leave schedules</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-teal-400 hover:from-amber-300 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg teal-glow transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {loading ? (
        <LoadingSpinner message="Retrieving physician staff records..." />
      ) : doctors.length === 0 ? (
        <div className="glass-card rounded-3xl border border-slate-800 p-12 text-center text-slate-400 space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No registered physicians</h3>
          <p className="text-sm text-slate-400">Click 'Add New Doctor' above to populate your medical directory.</p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4 text-left">Physician Name</th>
                  <th className="px-6 py-4 text-left">Specialization</th>
                  <th className="px-6 py-4 text-left">Slot Duration</th>
                  <th className="px-6 py-4 text-left">Leave Dates</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
                {doctors.map((doc) => (
                  <tr key={doc.id || doc._id} className="hover:bg-slate-900/50 transition">
                    <td className="px-6 py-4 font-bold text-white flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                        {doc.name ? doc.name.charAt(0) : 'D'}
                      </div>
                      <div>
                        <span>Dr. {doc.name}</span>
                        <span className="block text-[11px] text-slate-400 font-normal">{doc.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold text-xs rounded-lg">
                        {doc.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-300 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      <span>{doc.slotDuration} mins</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {doc.leaveDates && doc.leaveDates.length > 0 ? (
                        <span className="text-amber-400 font-medium">{doc.leaveDates.join(', ')}</span>
                      ) : (
                        <span className="text-slate-500">None scheduled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(doc)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc.id || doc._id)}
                        className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 font-semibold text-xs rounded-lg border border-red-800/40 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-card rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-800 space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-extrabold text-white">
                  {editingDoctorId ? 'Edit Doctor Profile' : 'Add New Physician'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Physician Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. Sarah Jenkins"
                  className="w-full p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="doctor@clinic.com"
                  className="w-full p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Password {editingDoctorId && '(Leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  required={!editingDoctorId}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Specialization</label>
                <input
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="Cardiology, General Practice, Dermatology"
                  className="w-full p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Slot Duration (Minutes)</label>
                <select
                  value={formData.slotDuration}
                  onChange={(e) => setFormData({ ...formData, slotDuration: Number(e.target.value) })}
                  className="w-full p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes (Default)</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <CalendarX className="w-3.5 h-3.5 text-amber-400" />
                  <span>Leave Dates (Comma-separated YYYY-MM-DD)</span>
                </label>
                <input
                  type="text"
                  value={formData.leaveDates}
                  onChange={(e) => setFormData({ ...formData, leaveDates: e.target.value })}
                  placeholder="2026-08-30, 2026-09-01"
                  className="w-full p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                />
                <p className="text-[11px] text-amber-400/90 mt-1 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Marking leave dates automatically cancels affected bookings & triggers Nodemailer email alerts.</span>
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-teal-400 hover:from-amber-300 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-lg teal-glow disabled:opacity-50"
                >
                  {submitting ? 'Saving Profile...' : 'Save Physician Profile'}
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
