import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { Calendar, Clock, Stethoscope, XCircle, ArrowRight, Sparkles, Plus } from 'lucide-react';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await appointmentService.getPatientAppointments();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? Google Calendar events will be deleted.')) return;

    try {
      setActionMsg('Cancelling appointment & deleting calendar event...');
      await appointmentService.cancelAppointment(id);
      setActionMsg('Appointment cancelled successfully.');
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  const filtered = appointments.filter(a => {
    if (activeTab === 'UPCOMING') return a.status === 'BOOKED' || a.status === 'HELD';
    if (activeTab === 'COMPLETED') return a.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return a.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Consultation Log</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">My Consultations & Visits</h1>
          <p className="text-sm text-slate-400">View status, access pre-visit AI triages, and inspect post-visit prescriptions</p>
        </div>

        <Link
          to="/patient/doctors"
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg teal-glow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Visit</span>
        </Link>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />
      <AlertMessage type="info" message={actionMsg} onClose={() => setActionMsg('')} />

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-1">
        {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-xs font-extrabold transition border-b-2 tracking-wider ${
              activeTab === tab
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving your patient consultation records..." />
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-3xl border border-slate-800 p-12 text-center text-slate-400 space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No {activeTab.toLowerCase()} visits found</h3>
          <p className="text-sm text-slate-400">You currently have no consultations listed under this category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((app) => (
            <div key={app.id || app._id} className="glass-card glass-card-hover rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{app.doctor?.name || 'Doctor'}</h3>
                      <p className="text-xs font-semibold text-teal-400">{app.doctor?.specialization || 'Specialist'}</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${
                    app.status === 'BOOKED' ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' :
                    app.status === 'HELD' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    app.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}>
                    {app.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-2 pt-3 border-t border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      <span>Date:</span>
                    </span>
                    <span className="font-semibold text-slate-200">{app.date}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      <span>Time:</span>
                    </span>
                    <span className="font-semibold text-slate-200">{app.startTime} - {app.endTime}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Symptoms:</span>
                    <span className="font-medium text-slate-300 truncate max-w-[220px]">{app.symptoms}</span>
                  </div>
                </div>

                {app.preVisitSummary && (
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-300 flex items-center space-x-1 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      <span>Urgency Triage:</span>
                    </span>
                    <span className={`font-extrabold uppercase px-2 py-0.5 rounded text-[10px] ${
                      app.preVisitSummary.urgencyLevel === 'High' ? 'bg-red-500/20 text-red-400' :
                      app.preVisitSummary.urgencyLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {app.preVisitSummary.urgencyLevel} Urgency
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-3 border-t border-slate-800">
                <Link
                  to={`/patient/appointments/${app.id || app._id}`}
                  className="flex-1 py-2.5 text-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center space-x-1.5"
                >
                  <span>View Details & Prescription</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {(app.status === 'BOOKED' || app.status === 'HELD') && (
                  <button
                    onClick={() => handleCancel(app.id || app._id)}
                    className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 font-semibold text-xs rounded-xl transition flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
