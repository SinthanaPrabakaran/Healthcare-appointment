import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { ShieldCheck, Stethoscope, Clock, Lock, ArrowRight, Sparkles, Users, Cpu } from 'lucide-react';

const AdminDashboard = () => {
  const [doctorCount, setDoctorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getDoctors({ page: 1, limit: 1 });
      setDoctorCount(data.pagination?.totalDoctors || data.doctors?.length || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Opening PulseCare Admin Overview..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Banner */}
      <div className="glass-card rounded-3xl p-8 border border-amber-500/30 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-xs font-bold text-amber-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrative Governance & System Auditing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Admin Portal — <span className="bg-gradient-to-r from-amber-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">PulseCare Core</span>
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Manage clinical physician credentials, configure working hours per weekday, adjust consultation slot intervals, and handle doctor leave dates with automated patient cancellation notifications.
          </p>
          <div className="pt-2">
            <Link
              to="/admin/doctors"
              className="inline-flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-teal-400 hover:from-amber-300 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg teal-glow transition"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor Directory & Schedule Manager</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Physicians</p>
            <p className="text-3xl font-extrabold text-white mt-1">{doctorCount}</p>
          </div>
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Stethoscope className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slot Duration Engine</p>
            <p className="text-3xl font-extrabold text-teal-400 mt-1">15 - 45 Mins</p>
          </div>
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl border border-teal-500/30">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">RBAC Authorization</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">JWT Active</p>
          </div>
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Lock className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
