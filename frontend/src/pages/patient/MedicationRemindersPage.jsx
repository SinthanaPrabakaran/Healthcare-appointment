import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { Pill, CheckCircle2, Clock, Mail, Bell, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

const MedicationRemindersPage = () => {
  const [medications, setMedications] = useState([]);
  const [takenState, setTakenState] = useState({});
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

      const meds = apps
        .filter(a => a.prescription && Array.isArray(a.prescription) && a.prescription.length > 0)
        .flatMap(a =>
          a.prescription.map((p, idx) => ({
            ...p,
            id: `${a.id || a._id}-${idx}`,
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

  const toggleTaken = (id) => {
    setTakenState(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const takenCount = Object.values(takenState).filter(Boolean).length;
  const compliancePercentage = medications.length > 0 ? Math.round((takenCount / medications.length) * 100) : 0;

  if (loading) return <LoadingSpinner message="Retrieving active medication schedules & reminder logs..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bell className="w-3.5 h-3.5" />
            <span>Medication Compliance Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Daily Medication Reminders</h1>
          <p className="text-sm text-slate-400">Track doctor-prescribed medications and Nodemailer automated email alerts</p>
        </div>

        <div className="glass-card px-4 py-2 rounded-2xl border border-teal-500/30 flex items-center space-x-2 self-start sm:self-auto">
          <Mail className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-teal-300">Nodemailer SMTP Background Job Active</span>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Compliance Progress Bar */}
      {medications.length > 0 && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center space-x-1.5 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Daily Dosage Adherence Tracker</span>
            </span>
            <span className="text-teal-400 font-extrabold text-sm">{compliancePercentage}% Completed ({takenCount}/{medications.length})</span>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 transition-all duration-500 rounded-full shadow-lg teal-glow"
              style={{ width: `${compliancePercentage}%` }}
            />
          </div>
        </div>
      )}

      {medications.length === 0 ? (
        <div className="glass-card rounded-3xl border border-slate-800 p-12 text-center text-slate-400 space-y-3 shadow-xl">
          <Pill className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No active prescriptions</h3>
          <p className="text-sm text-slate-400">When your physician completes a consultation and submits a prescription, active medication reminders will populate here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map((med) => {
            const isTaken = !!takenState[med.id];

            return (
              <div key={med.id} className={`glass-card glass-card-hover rounded-3xl border p-6 flex flex-col justify-between space-y-6 transition-all duration-300 ${
                isTaken ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-800'
              }`}>
                
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold ${
                        isTaken ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                      }`}>
                        <Pill className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{med.medicine}</h3>
                        <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold text-xs rounded-md">
                          {med.dosage}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 pt-1">Prescribed by <strong className="text-slate-200">Dr. {med.doctorName}</strong> on {med.date}</p>

                  <div className="text-xs text-slate-300 space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Frequency:</span>
                      <span className="font-semibold text-slate-200">{med.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duration:</span>
                      <span className="font-semibold text-slate-200">{med.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Instructions:</span>
                      <span className="font-medium text-slate-300">{med.instructions || 'As directed'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Nodemailer Job</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleTaken(med.id)}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md ${
                      isTaken 
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isTaken ? 'Taken Today' : 'Mark as Taken'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicationRemindersPage;
