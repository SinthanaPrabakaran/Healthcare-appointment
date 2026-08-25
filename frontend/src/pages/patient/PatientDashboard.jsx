import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { calendarService } from '../../services/calendarService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { 
  Activity, 
  Calendar, 
  CheckCircle2, 
  Pill, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Stethoscope, 
  CalendarCheck, 
  AlertTriangle,
  Search
} from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [calendarStatus, setCalendarStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [apptData, calData] = await Promise.allSettled([
        appointmentService.getPatientAppointments(),
        calendarService.getStatus()
      ]);

      if (apptData.status === 'fulfilled') {
        setAppointments(apptData.value.appointments || []);
      }
      if (calData.status === 'fulfilled') {
        setCalendarStatus(calData.value);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch patient dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Accessing PulseCare Patient Portal..." />;

  const upcomingAppt = appointments.find(a => a.status === 'BOOKED' || a.status === 'HELD');
  const completedAppts = appointments.filter(a => a.status === 'COMPLETED');
  const recentCompleted = completedAppts.length > 0 ? completedAppts[0] : null;

  const allMedications = appointments
    .filter(a => a.prescription && Array.isArray(a.prescription))
    .flatMap(a => a.prescription);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Hero Banner */}
      <div className="glass-card rounded-3xl p-8 text-white relative overflow-hidden border border-teal-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full text-xs font-semibold text-teal-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Triage & Clinical Care Sync Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">{user?.name}</span> 👋
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Manage your doctor consultations, track AI pre-visit urgency triages, digital prescriptions, and automated medication schedules.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
            <Link
              to="/patient/doctors"
              className="flex items-center justify-center space-x-2 px-5 py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-bold text-sm rounded-xl hover:from-teal-300 hover:to-cyan-300 transition shadow-lg teal-glow"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
            <Link
              to="/patient/reminders"
              className="flex items-center justify-center space-x-2 px-5 py-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition"
            >
              <Pill className="w-4 h-4 text-teal-400" />
              <span>Medication Schedule</span>
            </Link>
          </div>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Google Calendar Integration Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${calendarStatus?.connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <span>Google Calendar Sync</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${calendarStatus?.connected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                {calendarStatus?.connected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {calendarStatus?.connected 
                ? `Syncing visits to ${calendarStatus.googleEmail}` 
                : 'Connect your Google account for automatic 2-way consultation calendar event syncing.'}
            </p>
          </div>
        </div>

        <Link
          to="/patient/calendar"
          className="px-4 py-2 text-xs font-bold rounded-xl border border-teal-500/40 text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 transition flex items-center space-x-1.5 whitespace-nowrap"
        >
          <span>Manage Sync</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Consultations</p>
            <p className="text-3xl font-extrabold text-white mt-1">{appointments.length}</p>
          </div>
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl border border-teal-500/30">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Visits</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">{completedAppts.length}</p>
          </div>
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prescribed Medicines</p>
            <p className="text-3xl font-extrabold text-cyan-400 mt-1">{allMedications.length}</p>
          </div>
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
            <Pill className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Visit & Recent AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Next Upcoming Appointment */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-teal-400" />
              <span>Upcoming Consultation</span>
            </h2>
            <Link to="/patient/appointments" className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingAppt ? (
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{upcomingAppt.doctor?.name || 'Doctor'}</h3>
                  <p className="text-xs font-semibold text-teal-400">{upcomingAppt.doctor?.specialization || 'General Practice'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  upcomingAppt.status === 'BOOKED' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {upcomingAppt.status}
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 pt-3 border-t border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Slot:</span>
                  <span className="font-semibold text-slate-200">{upcomingAppt.date} ({upcomingAppt.startTime} - {upcomingAppt.endTime})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Symptoms:</span>
                  <span className="font-medium text-slate-300 truncate max-w-[200px]">{upcomingAppt.symptoms}</span>
                </div>
              </div>

              {/* Pre-Visit Triage Preview if present */}
              {upcomingAppt.preVisitSummary && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-teal-400 font-bold">
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini Pre-Visit Triage</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${
                      upcomingAppt.preVisitSummary.urgencyLevel === 'High' ? 'bg-red-500/20 text-red-400' :
                      upcomingAppt.preVisitSummary.urgencyLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {upcomingAppt.preVisitSummary.urgencyLevel} Urgency
                    </span>
                  </div>
                  <p className="text-slate-300 italic">{upcomingAppt.preVisitSummary.chiefComplaint}</p>
                </div>
              )}

              <Link
                to={`/patient/appointments/${upcomingAppt.id}`}
                className="block text-center py-2.5 px-4 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-semibold text-xs rounded-xl transition"
              >
                View Full Details & AI Triage Box →
              </Link>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 bg-slate-900/60 rounded-2xl border border-dashed border-slate-800">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-400">No upcoming consultations scheduled.</p>
              <Link to="/patient/doctors" className="mt-2 inline-flex items-center space-x-1 text-xs font-semibold text-teal-400 hover:text-teal-300">
                <span>Browse available doctors</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Recent AI Post-Visit Summary */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Recent AI Clinical Summary</span>
            </h2>
          </div>

          {recentCompleted && recentCompleted.postVisitSummary ? (
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Doctor Consultation Summary</span>
                </span>
                <span className="text-xs text-slate-500">{recentCompleted.date}</span>
              </div>
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                {recentCompleted.postVisitSummary}
              </div>
              <Link
                to={`/patient/appointments/${recentCompleted.id}`}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 pt-1"
              >
                <span>View Complete Digital Prescription & Follow-up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 bg-slate-900/60 rounded-2xl border border-dashed border-slate-800">
              <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-400">No post-visit summaries generated yet.</p>
              <p className="text-xs text-slate-500 mt-1">Plain-language summaries are created by Gemini AI when your consultation is completed.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;
