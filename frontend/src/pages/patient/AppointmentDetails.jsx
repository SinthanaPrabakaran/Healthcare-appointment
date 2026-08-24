import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const AppointmentDetails = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [preVisitSummary, setPreVisitSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointmentById(id);
      setAppointment(data.appointment);
      if (data.appointment?.preVisitSummary) {
        setPreVisitSummary(data.appointment.preVisitSummary);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointment details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading appointment details..." />;
  if (!appointment) return <AlertMessage type="error" message="Appointment not found." />;

  const urgencyColors = {
    HIGH: 'bg-red-100 text-red-800 border-red-200',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
    LOW: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Link to="/patient/appointments" className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-500">
        ← Back to Appointments List
      </Link>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Appointment Overview Header */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Appointment #{appointment.id || appointment._id}</h1>
            <p className="text-xs text-gray-500 mt-1">Booked on {appointment.date} ({appointment.startTime} - {appointment.endTime})</p>
          </div>
          <span className="px-4 py-1.5 bg-indigo-100 text-indigo-800 font-bold text-xs rounded-full self-start sm:self-auto">
            {appointment.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700 pt-2">
          <div>
            <span className="font-semibold text-gray-500 block uppercase tracking-wider mb-1">Doctor</span>
            <p className="font-bold text-gray-900 text-sm">{appointment.doctor?.name || 'Dr. Specialist'}</p>
            <p className="text-gray-500">{appointment.doctor?.specialization}</p>
          </div>

          <div>
            <span className="font-semibold text-gray-500 block uppercase tracking-wider mb-1">Patient Symptoms</span>
            <p className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-800 font-medium">
              {appointment.symptoms}
            </p>
          </div>
        </div>
      </div>

      {/* AI Pre-Visit Summary Section */}
      {preVisitSummary && (
        <div className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>🤖</span> AI Pre-Visit Symptom Analysis
            </h2>
            {preVisitSummary.urgencyLevel && (
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${urgencyColors[preVisitSummary.urgencyLevel] || 'bg-gray-100'}`}>
                Urgency: {preVisitSummary.urgencyLevel}
              </span>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Chief Complaint</h4>
              <p className="text-xs text-gray-800 mt-1 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                {preVisitSummary.chiefComplaint}
              </p>
            </div>

            {preVisitSummary.suggestedQuestions && preVisitSummary.suggestedQuestions.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Suggested Consultation Questions</h4>
                <ul className="mt-1 list-disc list-inside text-xs text-gray-700 space-y-1 bg-gray-50 p-3 rounded-xl">
                  {preVisitSummary.suggestedQuestions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post-Visit Patient Summary & Prescription Section */}
      {appointment.status === 'COMPLETED' && (
        <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-emerald-800">
            <span>✅</span> Consultation Summary & Prescriptions
          </h2>

          {/* AI Patient Friendly Summary */}
          {appointment.postVisitSummary && (
            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 space-y-2">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">AI Patient-Friendly Summary</h3>
              <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                {appointment.postVisitSummary}
              </p>
            </div>
          )}

          {/* Prescription Table */}
          {appointment.prescription && appointment.prescription.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Prescribed Medications</h3>
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3 text-left">Medicine</th>
                      <th className="px-4 py-3 text-left">Dosage</th>
                      <th className="px-4 py-3 text-left">Frequency</th>
                      <th className="px-4 py-3 text-left">Duration</th>
                      <th className="px-4 py-3 text-left">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-gray-800 font-medium">
                    {appointment.prescription.map((med, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 font-bold text-indigo-900">{med.medicine}</td>
                        <td className="px-4 py-3">{med.dosage}</td>
                        <td className="px-4 py-3">{med.frequency}</td>
                        <td className="px-4 py-3">{med.duration}</td>
                        <td className="px-4 py-3 text-gray-600">{med.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Follow Up Instructions */}
          {appointment.followUpInstructions && (
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Doctor's Follow-up Instructions</h3>
              <p className="text-xs text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                {appointment.followUpInstructions}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentDetails;
