import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const DoctorAppointmentDetails = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [preVisitSummary, setPreVisitSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointmentById(id);
      setAppointment(data.appointment);
      if (data.appointment?.preVisitSummary) {
        setPreVisitSummary(data.appointment.preVisitSummary);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointment.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAISummary = async () => {
    try {
      setSummaryLoading(true);
      setError('');
      const data = await appointmentService.generatePreVisitSummary(id);
      setPreVisitSummary(data.preVisitSummary);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate AI pre-visit summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading patient file..." />;
  if (!appointment) return <AlertMessage type="error" message="Appointment record not found." />;

  const urgencyColors = {
    HIGH: 'bg-red-100 text-red-800 border-red-200',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
    LOW: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Link to="/doctor/appointments" className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-500">
        ← Back to Patient List
      </Link>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Patient Card Header */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Patient: {appointment.patient?.name || 'Patient'}</h1>
            <p className="text-xs text-gray-500 mt-1">Email: {appointment.patient?.email}</p>
          </div>
          {appointment.status === 'BOOKED' && (
            <Link
              to={`/doctor/consultation/${appointment.id || appointment._id}`}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Start Consultation 🩺
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700 pt-2">
          <div>
            <span className="font-semibold text-gray-500 block uppercase tracking-wider mb-1">Appointment Timing</span>
            <p className="font-bold text-gray-900">{appointment.date}</p>
            <p className="text-gray-600">{appointment.startTime} - {appointment.endTime}</p>
          </div>

          <div>
            <span className="font-semibold text-gray-500 block uppercase tracking-wider mb-1">Stated Symptoms</span>
            <p className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-800 font-medium">
              {appointment.symptoms}
            </p>
          </div>
        </div>
      </div>

      {/* AI Pre-Visit Summary Card */}
      <div className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>🤖</span> AI Pre-Visit Clinical Summary
          </h2>

          {!preVisitSummary && (
            <button
              onClick={handleGenerateAISummary}
              disabled={summaryLoading}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs rounded-xl transition"
            >
              {summaryLoading ? 'Generating...' : 'Generate AI Summary ⚡'}
            </button>
          )}
        </div>

        {summaryLoading ? (
          <LoadingSpinner message="Gemini AI is analyzing patient symptoms..." />
        ) : preVisitSummary ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Triage Urgency Level:</span>
              <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${urgencyColors[preVisitSummary.urgencyLevel] || 'bg-gray-100'}`}>
                {preVisitSummary.urgencyLevel}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Chief Complaint Breakdown</h4>
              <p className="text-xs text-gray-800 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed font-medium">
                {preVisitSummary.chiefComplaint}
              </p>
            </div>

            {preVisitSummary.suggestedQuestions && preVisitSummary.suggestedQuestions.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Suggested Diagnostic Questions</h4>
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {preVisitSummary.suggestedQuestions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic bg-gray-50 p-4 rounded-xl">
            No pre-visit summary generated yet. Click 'Generate AI Summary' above to run AI symptom triage.
          </p>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointmentDetails;
