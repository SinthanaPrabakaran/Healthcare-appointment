import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const MedicationRemindersPage = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getPatientAppointments();
      const apps = data.appointments || [];

      // Extract prescriptions with doctor info
      const meds = apps
        .filter(a => a.prescription && Array.isArray(a.prescription) && a.prescription.length > 0)
        .flatMap(a =>
          a.prescription.map(p => ({
            ...p,
            appointmentId: a.id || a._id,
            date: a.date,
            doctorName: a.doctor?.name || 'Doctor'
          }))
        );

      setMedications(meds);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load medication reminders.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your active medications..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Medication Reminders & Schedule 💊</h1>
          <p className="text-sm text-gray-600">Prescribed medications & background reminder schedule</p>
        </div>
        <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold rounded-xl self-start sm:self-auto">
          🔒 Schedule set by doctor
        </span>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {medications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 shadow-xs">
          <span className="text-4xl">💊</span>
          <h3 className="mt-3 text-lg font-bold text-gray-900">No active prescriptions</h3>
          <p className="text-sm text-gray-500 mt-1">When your doctor completes a consultation and prescribes medicine, it will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map((med, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-indigo-900">{med.medicine}</h3>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">
                    {med.dosage}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Prescribed by Dr. {med.doctorName} on {med.date}</p>

                <div className="mt-4 space-y-2 text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p><strong>Frequency:</strong> {med.frequency}</p>
                  <p><strong>Duration:</strong> {med.duration}</p>
                  <p><strong>Instructions:</strong> {med.instructions || 'As advised'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>⏰ Automated Email Reminders Active</span>
                <span className="text-emerald-600 font-bold">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicationRemindersPage;
