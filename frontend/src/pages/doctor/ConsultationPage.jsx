import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { 
  Stethoscope, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  Pill, 
  FileText, 
  HelpCircle,
  Calendar,
  Clock,
  UserCheck
} from 'lucide-react';

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
      setError(err.response?.data?.message || 'Failed to fetch appointment record.');
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
        console.error('Post-visit summary note:', sumErr);
      }

      setSuccessMsg('Consultation completed! Prescription saved & Gemini AI plain-language summary generated.');

      setTimeout(() => {
        navigate('/doctor/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete consultation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Opening PulseCare Interactive Consultation Suite..." />;
  if (!appointment) return <AlertMessage type="error" message="Appointment record not found." />;

  const preVisitSummary = appointment.preVisitSummary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <Link to="/doctor/dashboard" className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Doctor Console</span>
      </Link>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={successMsg} />

      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-extrabold text-xl">
            {appointment.patient?.name ? appointment.patient.name.charAt(0) : 'P'}
          </div>
          <div>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5">Active Clinical Workspace</div>
            <h1 className="text-2xl font-extrabold text-white">Patient: {appointment.patient?.name}</h1>
            <p className="text-xs text-slate-400">Date: {appointment.date} ({appointment.startTime} - {appointment.endTime})</p>
          </div>
        </div>

        <span className="px-4 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase rounded-full shadow-lg">
          In Consultation
        </span>
      </div>

      {/* Split View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Patient Profile & Gemini Pre-Visit Triage */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Patient Symptoms Card */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Reported Patient Symptoms</span>
            </h3>
            <p className="text-xs text-slate-200 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 leading-relaxed font-medium">
              {appointment.symptoms}
            </p>
          </div>

          {/* AI Pre-Visit Triage Card */}
          {preVisitSummary ? (
            <div className="glass-card p-6 rounded-3xl border border-teal-500/30 bg-teal-500/5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
                  <span>Gemini Pre-Visit Triage</span>
                </h3>
                <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-md border ${
                  preVisitSummary.urgencyLevel === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                  preVisitSummary.urgencyLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}>
                  {preVisitSummary.urgencyLevel} Urgency
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-teal-300 uppercase tracking-wider mb-1 text-[11px]">Chief Complaint</h4>
                  <p className="text-slate-200 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                    {preVisitSummary.chiefComplaint}
                  </p>
                </div>

                {preVisitSummary.suggestedQuestions && preVisitSummary.suggestedQuestions.length > 0 && (
                  <div>
                    <h4 className="font-bold text-teal-300 uppercase tracking-wider mb-1.5 text-[11px] flex items-center space-x-1">
                      <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                      <span>Suggested Diagnostic Questions</span>
                    </h4>
                    <ul className="space-y-2 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                      {preVisitSummary.suggestedQuestions.map((q, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-slate-300">
                          <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
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
          ) : (
            <div className="glass-card p-6 rounded-3xl border border-slate-800 text-slate-400 text-xs italic">
              No pre-visit triage summary generated for this patient booking.
            </div>
          )}

        </div>

        {/* Right Column: Live Clinical Workspace Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmitConsultation} className="space-y-6">
            
            {/* Clinical Diagnosis Notes */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>1. Clinical Examination & Diagnosis Notes <span className="text-red-400">*</span></span>
              </h2>
              <textarea
                rows="5"
                required
                value={postVisitNotes}
                onChange={(e) => setPostVisitNotes(e.target.value)}
                placeholder="Enter clinical examination findings, diagnosis, vitals, and physician notes..."
                className="w-full p-4 bg-slate-900/80 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
              ></textarea>
            </div>

            {/* Dynamic Prescription Builder */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Pill className="w-4 h-4 text-teal-400" />
                  <span>2. Digital Prescription Builder</span>
                </h2>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="flex items-center space-x-1 px-3.5 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold text-xs rounded-xl transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine Row</span>
                </button>
              </div>

              <div className="space-y-3">
                {prescription.map((med, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Medicine Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Amoxicillin"
                          value={med.medicine}
                          onChange={(e) => handlePrescriptionChange(idx, 'medicine', e.target.value)}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-teal-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dosage</label>
                        <input
                          type="text"
                          placeholder="e.g., 500mg"
                          value={med.dosage}
                          onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Frequency</label>
                        <input
                          type="text"
                          placeholder="e.g., Twice daily"
                          value={med.frequency}
                          onChange={(e) => handlePrescriptionChange(idx, 'frequency', e.target.value)}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-teal-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Duration</label>
                        <input
                          type="text"
                          placeholder="e.g., 7 days"
                          value={med.duration}
                          onChange={(e) => handlePrescriptionChange(idx, 'duration', e.target.value)}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-teal-400"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Instructions</label>
                          <input
                            type="text"
                            placeholder="After meals"
                            value={med.instructions}
                            onChange={(e) => handlePrescriptionChange(idx, 'instructions', e.target.value)}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-teal-400"
                          />
                        </div>
                        {prescription.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(idx)}
                            className="mt-4 p-2 text-red-400 hover:bg-red-950/40 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up Care */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>3. Follow-up Care Instructions</span>
              </h2>
              <textarea
                rows="3"
                value={followUpInstructions}
                onChange={(e) => setFollowUpInstructions(e.target.value)}
                placeholder="Enter follow-up appointment timeline and general recovery instructions..."
                className="w-full p-4 bg-slate-900/80 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl teal-glow transition duration-200 disabled:opacity-40 flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{submitting ? 'Submitting & Generating Gemini AI Summary...' : 'Complete Consultation & Issue Digital Prescription'}</span>
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default ConsultationPage;
