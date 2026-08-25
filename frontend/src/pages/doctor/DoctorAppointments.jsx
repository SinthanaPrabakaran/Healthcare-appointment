import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { Stethoscope, Calendar, Clock, Sparkles, User, ArrowRight } from 'lucide-react';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
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
      setError(err.response?.data?.message || 'Failed to fetch doctor patient queue.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = appointments.filter(a => {
    if (activeTab === 'BOOKED') return a.status === 'BOOKED' || a.status === 'HELD';
    if (activeTab === 'COMPLETED') return a.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return a.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div>
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Patient Management Queue</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Doctor's Patient Queue</h1>
        <p className="text-sm text-slate-400">Review patient chief complaints, pre-visit AI triages, and issue digital prescriptions</p>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-1">
        {['ALL', 'BOOKED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-xs font-extrabold transition border-b-2 tracking-wider ${
              activeTab === tab
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving active clinical queue..." />
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-3xl border border-slate-800 p-12 text-center text-slate-400 space-y-3">
          <User className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No patients in this queue category</h3>
          <p className="text-sm text-slate-400">There are no {activeTab.toLowerCase()} appointments assigned.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((app) => (
            <div key={app.id || app._id} className="glass-card glass-card-hover rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold">
                      {app.patient?.name ? app.patient.name.charAt(0) : 'P'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{app.patient?.name || 'Patient'}</h3>
                      <p className="text-xs text-slate-400">{app.patient?.email}</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${
                    app.status === 'BOOKED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    app.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}>
                    {app.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-2 pt-3 border-t border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Date & Slot:</span>
                    </span>
                    <span className="font-semibold text-slate-200">{app.date} ({app.startTime} - {app.endTime})</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Symptoms:</span>
                    <span className="font-medium text-slate-300 truncate max-w-[220px]">{app.symptoms}</span>
                  </div>
                </div>

                {app.preVisitSummary && (
                  <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-teal-400 font-bold">
                      <span className="flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Urgency Triage</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${
                        app.preVisitSummary.urgencyLevel === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        app.preVisitSummary.urgencyLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {app.preVisitSummary.urgencyLevel}
                      </span>
                    </div>
                    <p className="text-slate-300 italic">{app.preVisitSummary.chiefComplaint}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-3 border-t border-slate-800">
                <Link
                  to={`/doctor/appointments/${app.id || app._id}`}
                  className="flex-1 py-2.5 text-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
                >
                  Inspect Triage
                </Link>

                {app.status === 'BOOKED' && (
                  <Link
                    to={`/doctor/consultation/${app.id || app._id}`}
                    className="flex-1 py-2.5 text-center bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-md teal-glow transition flex items-center justify-center space-x-1"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Start Consultation</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
