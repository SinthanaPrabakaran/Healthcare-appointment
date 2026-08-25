import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Pill, 
  FileText, 
  Stethoscope, 
  Calendar, 
  Clock, 
  HelpCircle,
  CalendarCheck
} from 'lucide-react';

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

  if (loading) return <LoadingSpinner message="Retrieving consultation record & AI clinical summaries..." />;
  if (!appointment) return <AlertMessage type="error" message="Appointment record not found." />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <Link to="/patient/appointments" className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Consultations</span>
      </Link>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Appointment Overview Header */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
              Visit Record #{appointment.id || appointment._id}
            </div>
            <h1 className="text-2xl font-extrabold text-white">Consultation Details</h1>
          </div>
          <span className={`px-4 py-1.5 text-xs font-black uppercase rounded-full border self-start sm:self-auto ${
            appointment.status === 'BOOKED' ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' :
            appointment.status === 'HELD' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
            appointment.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
            'bg-red-500/20 text-red-300 border-red-500/40'
          }`}>
            {appointment.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2">
            <span className="font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Stethoscope className="w-4 h-4 text-teal-400" />
              <span>Assigned Physician</span>
            </span>
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
              <p className="font-bold text-white text-base">{appointment.doctor?.name || 'Dr. Specialist'}</p>
              <p className="text-teal-400 font-semibold">{appointment.doctor?.specialization}</p>
              <p className="text-slate-400 mt-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{appointment.date} ({appointment.startTime} - {appointment.endTime})</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Logged Symptoms</span>
            </span>
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-slate-300 leading-relaxed font-medium">
              {appointment.symptoms}
            </div>
          </div>
        </div>
      </div>

      {/* Gemini AI Pre-Visit Triage Box */}
      {preVisitSummary && (
        <div className="glass-card rounded-3xl p-8 border border-teal-500/30 bg-teal-500/5 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
              <span>Gemini AI Pre-Visit Triage Analysis</span>
            </h2>
            {preVisitSummary.urgencyLevel && (
              <span className={`px-3 py-1 text-xs font-extrabold uppercase rounded-full border ${
                preVisitSummary.urgencyLevel === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                preVisitSummary.urgencyLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}>
                {preVisitSummary.urgencyLevel} Urgency
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-teal-300 uppercase tracking-wider mb-1">Chief Complaint Summary</h4>
              <p className="text-slate-200 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 leading-relaxed font-medium">
                {preVisitSummary.chiefComplaint}
              </p>
            </div>

            {preVisitSummary.suggestedQuestions && preVisitSummary.suggestedQuestions.length > 0 && (
              <div>
                <h4 className="font-bold text-teal-300 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <HelpCircle className="w-4 h-4 text-teal-400" />
                  <span>Suggested Diagnostic Questions for Doctor</span>
                </h4>
                <ul className="space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  {preVisitSummary.suggestedQuestions.map((q, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post-Visit Doctor Consultation & Digital Prescription Section */}
      {appointment.status === 'COMPLETED' && (
        <div className="glass-card rounded-3xl p-8 border border-emerald-500/30 bg-emerald-500/5 space-y-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span>Completed Consultation & Prescription Suite</span>
          </h2>

          {/* AI Plain-Language Summary */}
          {appointment.postVisitSummary && (
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-emerald-500/30 space-y-2">
              <h3 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-4 h-4" />
                <span>Plain-Language Patient Summary</span>
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                {appointment.postVisitSummary}
              </p>
            </div>
          )}

          {/* Digital Prescription Table */}
          {appointment.prescription && appointment.prescription.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                <Pill className="w-4 h-4 text-cyan-400" />
                <span>Digital Prescription Table</span>
              </h3>
              <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/80">
                <table className="min-w-full divide-y divide-slate-800 text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3 text-left">Medicine</th>
                      <th className="px-4 py-3 text-left">Dosage</th>
                      <th className="px-4 py-3 text-left">Frequency</th>
                      <th className="px-4 py-3 text-left">Duration</th>
                      <th className="px-4 py-3 text-left">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
                    {appointment.prescription.map((med, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50 transition">
                        <td className="px-4 py-3 font-bold text-teal-300 flex items-center space-x-1.5">
                          <Pill className="w-3.5 h-3.5 text-teal-400" />
                          <span>{med.medicine}</span>
                        </td>
                        <td className="px-4 py-3">{med.dosage}</td>
                        <td className="px-4 py-3">{med.frequency}</td>
                        <td className="px-4 py-3">{med.duration}</td>
                        <td className="px-4 py-3 text-slate-400">{med.instructions || 'Standard compliance'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Follow-up Instructions */}
          {appointment.followUpInstructions && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Physician Follow-up Care Instructions</h3>
              <p className="text-xs text-slate-300 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 leading-relaxed font-medium">
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
