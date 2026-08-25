import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { ArrowLeft, Sparkles, Stethoscope, FileText, HelpCircle, Calendar, Clock, User } from 'lucide-react';

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
      setError(err.response?.data?.message || 'Failed to fetch appointment record.');
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

  if (loading) return <LoadingSpinner message="Opening patient clinical file..." />;
  if (!appointment) return <AlertMessage type="error" message="Appointment record not found." />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <Link to="/doctor/appointments" className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Patient Queue</span>
      </Link>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Patient Header Card */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-extrabold text-xl">
              {appointment.patient?.name ? appointment.patient.name.charAt(0) : 'P'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Patient: {appointment.patient?.name || 'Patient'}</h1>
              <p className="text-xs text-slate-400">Email: {appointment.patient?.email}</p>
            </div>
          </div>

          {appointment.status === 'BOOKED' && (
            <Link
              to={`/doctor/consultation/${appointment.id || appointment._id}`}
              className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg teal-glow transition"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Enter Consultation Room</span>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2">
            <span className="font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Appointment Schedule</span>
            </span>
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-slate-200">
              <p className="font-bold text-white text-base">{appointment.date}</p>
              <p className="text-cyan-400 font-semibold">{appointment.startTime} - {appointment.endTime}</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Reported Symptoms</span>
            </span>
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-slate-300 leading-relaxed font-medium">
              {appointment.symptoms}
            </div>
          </div>
        </div>
      </div>

      {/* Gemini AI Pre-Visit Summary Card */}
      <div className="glass-card rounded-3xl p-8 border border-cyan-500/30 bg-cyan-500/5 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span>Gemini AI Pre-Visit Clinical Analysis</span>
          </h2>

          {!preVisitSummary && (
            <button
              onClick={handleGenerateAISummary}
              disabled={summaryLoading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs rounded-xl transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{summaryLoading ? 'Running Gemini AI...' : 'Generate Pre-Visit Triage'}</span>
            </button>
          )}
        </div>

        {summaryLoading ? (
          <LoadingSpinner message="Gemini v3.6-Flash is parsing chief complaints..." />
        ) : preVisitSummary ? (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <span className="font-bold text-slate-300 uppercase tracking-wider">Triage Urgency Level:</span>
              <span className={`px-3 py-1 text-xs font-extrabold uppercase rounded-full border ${
                preVisitSummary.urgencyLevel === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                preVisitSummary.urgencyLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}>
                {preVisitSummary.urgencyLevel} Urgency
              </span>
            </div>

            <div>
              <h4 className="font-bold text-cyan-300 uppercase tracking-wider mb-1">Chief Complaint Summary</h4>
              <p className="text-slate-200 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 leading-relaxed font-medium">
                {preVisitSummary.chiefComplaint}
              </p>
            </div>

            {preVisitSummary.suggestedQuestions && preVisitSummary.suggestedQuestions.length > 0 && (
              <div>
                <h4 className="font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>Suggested Diagnostic Questions for Doctor</span>
                </h4>
                <ul className="space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  {preVisitSummary.suggestedQuestions.map((q, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            No pre-visit triage summary generated yet. Click 'Generate Pre-Visit Triage' above to analyze patient symptoms.
          </p>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointmentDetails;
