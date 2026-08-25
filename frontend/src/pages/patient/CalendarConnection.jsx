import React, { useState, useEffect } from 'react';
import { calendarService } from '../../services/calendarService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { CalendarCheck, CheckCircle2, ShieldCheck, AlertTriangle, ExternalLink, Unlink, Sparkles } from 'lucide-react';

const CalendarConnection = () => {
  const [status, setStatus] = useState({ connected: false, googleEmail: null });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await calendarService.getStatus();
      setStatus(data);
    } catch (err) {
      setError('Failed to fetch Google Calendar OAuth connection status.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setActionLoading(true);
      setError('');
      const data = await calendarService.getConnectUrl();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate Google OAuth 2.0 flow.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Google Calendar? Future appointments will no longer auto-sync.')) return;
    try {
      setActionLoading(true);
      await calendarService.disconnect();
      setMsg('Google Calendar connection unlinked successfully.');
      fetchStatus();
    } catch (err) {
      setError('Failed to disconnect Google Calendar.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Checking Google OAuth token & Calendar API status..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>OAuth 2.0 Integration Hub</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Google Calendar Integration</h1>
        <p className="text-sm text-slate-400">Sync consultation appointments directly with your personal Google Calendar</p>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={msg} onClose={() => setMsg('')} />

      {/* Main Connection Card */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-inner">
              <CalendarCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg flex items-center space-x-2">
                <span>Google Calendar Sync Engine</span>
                <Sparkles className="w-4 h-4 text-teal-400" />
              </h3>
              <p className="text-xs text-slate-400">2-Way event synchronization for doctor consultations</p>
            </div>
          </div>

          <span className={`px-3.5 py-1.5 font-extrabold text-xs uppercase rounded-full border ${
            status.connected 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            {status.connected ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        {status.connected ? (
          <div className="space-y-5 pt-4 border-t border-slate-800">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Synced Google Account:</span>
              <strong className="text-teal-300 font-bold">{status.googleEmail || 'Linked Account'}</strong>
            </div>

            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>OAuth 2.0 Refresh Tokens safely encrypted in MongoDB. Appointments will automatically trigger calendar event creation.</span>
            </div>

            <button
              onClick={handleDisconnect}
              disabled={actionLoading}
              className="flex items-center space-x-2 px-5 py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 font-bold text-xs rounded-xl transition"
            >
              <Unlink className="w-4 h-4" />
              <span>{actionLoading ? 'Unlinking...' : 'Disconnect Calendar'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              Connecting Google Calendar grants OAuth 2.0 permission for PulseCare to add consultation events, times, and doctor details directly into your calendar app with real-time updates.
            </p>

            <button
              onClick={handleConnect}
              disabled={actionLoading}
              className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black text-xs rounded-xl shadow-lg teal-glow transition transform hover:-translate-y-0.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{actionLoading ? 'Redirecting to Google...' : 'Authorize Google Calendar OAuth 2.0'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarConnection;
