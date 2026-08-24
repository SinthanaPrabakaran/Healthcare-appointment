import React, { useState, useEffect } from 'react';
import { calendarService } from '../../services/calendarService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

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
      setError('Failed to fetch calendar status.');
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
      setError(err.response?.data?.message || 'Failed to initiate Google OAuth.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Google Calendar?')) return;
    try {
      setActionLoading(true);
      await calendarService.disconnect();
      setMsg('Google Calendar disconnected.');
      fetchStatus();
    } catch (err) {
      setError('Failed to disconnect Google Calendar.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Checking Google Calendar connection..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Google Calendar Integration 📅</h1>
        <p className="text-sm text-gray-600">Sync your healthcare appointments directly to your phone's Google Calendar app</p>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={msg} onClose={() => setMsg('')} />

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-4xl p-3 bg-blue-50 text-blue-600 rounded-2xl">📅</span>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Google Calendar Sync</h3>
              <p className="text-xs text-gray-500">Auto-create and update events for every booking</p>
            </div>
          </div>
          <span className={`px-4 py-1.5 font-bold text-xs rounded-full ${
            status.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {status.connected ? 'Connected ✅' : 'Not Connected ⚠️'}
          </span>
        </div>

        {status.connected ? (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-700">
              Connected Account: <strong className="text-gray-900">{status.googleEmail || 'Linked Google Account'}</strong>
            </p>
            <button
              onClick={handleDisconnect}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl transition"
            >
              {actionLoading ? 'Disconnecting...' : 'Disconnect Calendar'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed">
              Connecting your Google Calendar enables real-time 2-way event syncing. Your appointments, dates, and times will automatically pop up in your phone's Google Calendar app.
            </p>
            <button
              onClick={handleConnect}
              disabled={actionLoading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              {actionLoading ? 'Connecting...' : 'Connect Google Calendar 🚀'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarConnection;
