import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const ConsultationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [postVisitNotes, setPostVisitNotes] = useState('');
  const [followUpInstructions, setFollowUpInstructions] = useState('');

  const [prescription, setPrescription] = useState([
    { medicine: '', dosage: '', frequency: 'Twice daily', duration: '5 days', instructions: 'Take after meals' }
  ]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointmentById(id);
      setAppointment(data.appointment);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointment.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setPrescription([
      ...prescription,
      { medicine: '', dosage: '', frequency: 'Twice daily', duration: '5 days', instructions: 'Take after meals' }
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setPrescription(prescription.filter((_, idx) => idx !== index));
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...prescription];
    updated[index][field] = value;
    setPrescription(updated);
  };

  const handleSubmitConsultation = async (e) => {
    e.preventDefault();

    if (!postVisitNotes.trim()) {
      setError('Please provide clinical consultation notes.');
      return;
    }

    // Filter out empty medicines
    const validPrescription = prescription.filter(p => p.medicine.trim() !== '');

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        postVisitNotes: postVisitNotes.trim(),
        prescription: validPrescription,
        followUpInstructions: followUpInstructions.trim()
      };

      await appointmentService.completeConsultation(id, payload);

      // Trigger AI Post-Visit Summary Generation asynchronously
      try {
        await appointmentService.generatePostVisitSummary(id);
      } catch (sumErr) {
        console.error('Post-visit summary generation note:', sumErr);
      }

      setSuccessMsg('Consultation completed successfully! Prescription saved & AI patient-friendly summary generated.');

      setTimeout(() => {
        navigate('/doctor/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete consultation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Opening consultation workspace..." />;
  if (!appointment) return <AlertMessage type="error" message="Appointment record not found." />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <Link to="/doctor/dashboard" className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-500">
        ← Back to Doctor Dashboard
      </Link>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={successMsg} />

      {/* Patient Header Summary */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Active Patient Consultation</span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{appointment.patient?.name}</h1>
          <p className="text-xs text-gray-500">Date: {appointment.date} | Symptoms: {appointment.symptoms}</p>
        </div>
        <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
          In Consultation
        </span>
      </div>

      <form onSubmit={handleSubmitConsultation} className="space-y-8">
        {/* Clinical Post Visit Notes */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-gray-900">1. Clinical Consultation Notes <span className="text-red-500">*</span></h2>
          <textarea
            rows="5"
            required
            value={postVisitNotes}
            onChange={(e) => setPostVisitNotes(e.target.value)}
            placeholder="Enter clinical examination notes, diagnosis, and findings..."
            className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm outline-none transition"
          ></textarea>
        </div>

        {/* Dynamic Prescription Section */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">2. Medical Prescription 💊</h2>
            <button
              type="button"
              onClick={handleAddMedicine}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition"
            >
              + Add Medicine
            </button>
          </div>

          <div className="space-y-4">
            {prescription.map((med, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Medicine Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Paracetamol"
                    value={med.medicine}
                    onChange={(e) => handlePrescriptionChange(idx, 'medicine', e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-gray-200 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg"
                    value={med.dosage}
                    onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-gray-200 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g. Twice daily"
                    value={med.frequency}
                    onChange={(e) => handlePrescriptionChange(idx, 'frequency', e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-gray-200 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 days"
                    value={med.duration}
                    onChange={(e) => handlePrescriptionChange(idx, 'duration', e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-gray-200 text-xs outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Instructions</label>
                    <input
                      type="text"
                      placeholder="After food"
                      value={med.instructions}
                      onChange={(e) => handlePrescriptionChange(idx, 'instructions', e.target.value)}
                      className="w-full p-2 bg-white rounded-lg border border-gray-200 text-xs outline-none"
                    />
                  </div>
                  {prescription.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="mt-4 p-2 text-red-500 hover:text-red-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow Up Instructions */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-gray-900">3. Follow-up Instructions</h2>
          <textarea
            rows="3"
            value={followUpInstructions}
            onChange={(e) => setFollowUpInstructions(e.target.value)}
            placeholder="Enter follow-up instructions for the patient..."
            className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm outline-none transition"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg transition text-base disabled:opacity-50"
        >
          {submitting ? 'Completing Consultation & Running AI Summary...' : 'Complete Consultation & Issue Prescription 🚀'}
        </button>
      </form>
    </div>
  );
};

export default ConsultationPage;
