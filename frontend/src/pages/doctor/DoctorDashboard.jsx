import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { Stethoscope, Calendar, CheckCircle2, Clock, Sparkles, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getDoctorAppointments();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctor dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Opening PulseCare Doctor Clinical Console..." />;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAppts = appointments.filter(a => a.date === todayStr);
  const pendingConsultations = appointments.filter(a => a.status === 'BOOKED');
  const completedAppts = appointments.filter(a => a.status === 'COMPLETED');
  const urgentAppts = appointments.filter(a => a.preVisitSummary?.urgencyLevel === 'High');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Doctor Header Banner */}
      <div className="glass-card rounded-3xl p-8 border border-cyan-500/30 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-xs font-bold text-cyan-300">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical Console & AI Diagnostic Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Doctor Portal — Welcome <span className="bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">Dr. {user?.name}</span> 🩺
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Inspect pre-visit Gemini AI symptom triages, conduct live video/in-person consultations, build structured digital prescriptions, and issue plain-language patient summaries.
          </p>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Visits</p>
            <p className="text-3xl font-extrabold text-white mt-1">{todaysAppts.length}</p>
          </div>
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Consultations</p>
            <p className="text-3xl font-extrabold text-amber-400 mt-1">{pendingConsultations.length}</p>
          </div>
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Patients</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">{completedAppts.length}</p>
          </div>
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">High Urgency Cases</p>
            <p className="text-3xl font-extrabold text-red-400 mt-1">{urgentAppts.length}</p>
          </div>
          <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl border border-red-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Patient Queue Table */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-cyan-400" />
            <span>Upcoming Patient Consultation Queue</span>
          </h2>
          <Link to="/doctor/appointments" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1">
            <span>View All Patients</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-900/60 rounded-2xl border border-dashed border-slate-800">
            <UserCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-400">No active patient bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
            <table className="min-w-full divide-y divide-slate-800 text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left">Patient Name</th>
                  <th className="px-4 py-3 text-left">Date & Time</th>
                  <th className="px-4 py-3 text-left">Reported Symptoms</th>
                  <th className="px-4 py-3 text-left">AI Triage Urgency</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
                {appointments.slice(0, 6).map((app) => (
                  <tr key={app.id || app._id} className="hover:bg-slate-900/50 transition">
                    <td className="px-4 py-3 font-bold text-white flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs">
                        {app.patient?.name ? app.patient.name.charAt(0) : 'P'}
                      </div>
                      <span>{app.patient?.name || 'Patient'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{app.date} ({app.startTime} - {app.endTime})</td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-400">{app.symptoms}</td>
                    <td className="px-4 py-3">
                      {app.preVisitSummary?.urgencyLevel ? (
                        <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-md ${
                          app.preVisitSummary.urgencyLevel === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                          app.preVisitSummary.urgencyLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {app.preVisitSummary.urgencyLevel}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                        app.status === 'BOOKED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        app.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link
                        to={`/doctor/appointments/${app.id || app._id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
                      >
                        <Sparkles className="w-3 h-3 text-teal-400" />
                        <span>AI Triage</span>
                      </Link>
                      {app.status === 'BOOKED' && (
                        <Link
                          to={`/doctor/consultation/${app.id || app._id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 text-xs font-bold rounded-lg shadow-md teal-glow transition"
                        >
                          <Stethoscope className="w-3 h-3" />
                          <span>Start Consultation</span>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
