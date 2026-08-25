import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AlertMessage from '../../components/AlertMessage';
import { Activity, Mail, Lock, LogIn, Sparkles, User, Stethoscope, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      const userRole = data.user?.role;

      if (userRole === 'PATIENT') navigate('/patient/dashboard');
      else if (userRole === 'DOCTOR') navigate('/doctor/dashboard');
      else if (userRole === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full glass-card p-8 rounded-3xl relative z-10 space-y-8 shadow-2xl border border-slate-700/60">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 via-teal-400 to-cyan-300 text-slate-950 shadow-lg teal-glow mb-1">
            <Activity className="w-8 h-8 font-extrabold" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Sign in to <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">PulseCare</span>
          </h2>
          <p className="text-sm text-slate-400">
            Access AI-powered clinical triage, appointment slots & prescriptions
          </p>
        </div>

        {sessionExpired && (
          <AlertMessage type="warning" message="Session expired. Please log in again." />
        )}

        <AlertMessage type="error" message={error} onClose={() => setError('')} />

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 text-sm transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl shadow-lg text-sm font-semibold text-slate-950 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 hover:from-teal-300 hover:to-cyan-300 teal-glow transition duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
          </button>
        </form>

        {/* Demo Quick Fill Shortcuts */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-semibold text-slate-300 uppercase tracking-wider">Demo Credentials Fill:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('patient@example.com', 'Patient123!')}
              className="py-1.5 px-2 bg-slate-800/80 hover:bg-teal-500/20 border border-slate-700 hover:border-teal-500/40 rounded-lg text-xs font-medium text-teal-300 flex items-center justify-center space-x-1 transition"
            >
              <User className="w-3 h-3" />
              <span>Patient</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('doctor@clinic.com', 'Doctor123!')}
              className="py-1.5 px-2 bg-slate-800/80 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/40 rounded-lg text-xs font-medium text-cyan-300 flex items-center justify-center space-x-1 transition"
            >
              <Stethoscope className="w-3 h-3" />
              <span>Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin@clinic.com', 'AdminPassword123!')}
              className="py-1.5 px-2 bg-slate-800/80 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/40 rounded-lg text-xs font-medium text-amber-300 flex items-center justify-center space-x-1 transition"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-teal-400 hover:text-teal-300 underline underline-offset-4">
              Register new account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
