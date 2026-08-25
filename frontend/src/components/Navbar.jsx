import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  LayoutDashboard, 
  Stethoscope, 
  Calendar, 
  Pill, 
  CalendarCheck, 
  Users, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu, 
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const activeLinkClass = "bg-teal-500/10 text-teal-400 border-b-2 border-teal-400 font-semibold";
  const inactiveLinkClass = "text-slate-300 hover:text-teal-300 hover:bg-slate-800/50 transition-all duration-200";

  return (
    <nav className="glass-nav sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg teal-glow group-hover:scale-105 transition-transform duration-200">
                <Activity className="w-6 h-6 text-slate-950 font-bold" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-300 bg-clip-text text-transparent">
                  PulseCare
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400 -mt-1">Clinical AI</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {user && (
              <div className="hidden md:flex items-center space-x-1">
                {user.role === 'PATIENT' && (
                  <>
                    <Link to="/patient/dashboard" className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium ${isActive('/patient/dashboard') ? activeLinkClass : inactiveLinkClass}`}>
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/patient/doctors" className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium ${isActive('/patient/doctors') ? activeLinkClass : inactiveLinkClass}`}>
                      <Stethoscope className="w-4 h-4" />
                      <span>Find Doctors</span>
                    </Link>
                    <Link to="/patient/appointments" className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium ${isActive('/patient/appointments') ? activeLinkClass : inactiveLinkClass}`}>
                      <Calendar className="w-4 h-4" />
                      <span>My Visits</span>
                    </Link>
                    <Link to="/patient/reminders" className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium ${isActive('/patient/reminders') ? activeLinkClass : inactiveLinkClass}`}>
                      <Pill className="w-4 h-4" />
                      <span>Medications</span>
                    </Link>
                    <Link to="/patient/calendar" className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium ${isActive('/patient/calendar') ? activeLinkClass : inactiveLinkClass}`}>
                      <CalendarCheck className="w-4 h-4" />
                      <span>Calendar Sync</span>
                    </Link>
                  </>
                )}

                {user.role === 'DOCTOR' && (
                  <>
                    <Link to="/doctor/dashboard" className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium ${isActive('/doctor/dashboard') ? activeLinkClass : inactiveLinkClass}`}>
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Doctor Console</span>
                    </Link>
                    <Link to="/doctor/appointments" className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium ${isActive('/doctor/appointments') ? activeLinkClass : inactiveLinkClass}`}>
                      <Users className="w-4 h-4" />
                      <span>Patient Queue</span>
                    </Link>
                    <Link to="/doctor/calendar" className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium ${isActive('/doctor/calendar') ? activeLinkClass : inactiveLinkClass}`}>
                      <CalendarCheck className="w-4 h-4" />
                      <span>Schedule Settings</span>
                    </Link>
                  </>
                )}

                {user.role === 'ADMIN' && (
                  <>
                    <Link to="/admin/dashboard" className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium ${isActive('/admin/dashboard') ? activeLinkClass : inactiveLinkClass}`}>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Admin Overview</span>
                    </Link>
                    <Link to="/admin/doctors" className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium ${isActive('/admin/doctors') ? activeLinkClass : inactiveLinkClass}`}>
                      <Stethoscope className="w-4 h-4" />
                      <span>Doctor Directory</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-slate-800">
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-100 flex items-center space-x-1 justify-end">
                    <span>{user.name}</span>
                    <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold tracking-wider rounded-md uppercase ${
                    user.role === 'PATIENT' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                    user.role === 'DOCTOR' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 rounded-lg transition duration-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 hover:from-teal-300 hover:to-cyan-300 rounded-xl shadow-lg teal-glow transition transform hover:-translate-y-0.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          {user ? (
            <>
              {user.role === 'PATIENT' && (
                <>
                  <Link to="/patient/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800">
                    <LayoutDashboard className="w-4 h-4 text-teal-400" />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/patient/doctors" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800">
                    <Stethoscope className="w-4 h-4 text-teal-400" />
                    <span>Find Doctors</span>
                  </Link>
                  <Link to="/patient/appointments" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800">
                    <Calendar className="w-4 h-4 text-teal-400" />
                    <span>My Visits</span>
                  </Link>
                  <Link to="/patient/reminders" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800">
                    <Pill className="w-4 h-4 text-teal-400" />
                    <span>Medications</span>
                  </Link>
                  <Link to="/patient/calendar" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800">
                    <CalendarCheck className="w-4 h-4 text-teal-400" />
                    <span>Google Calendar</span>
                  </Link>
                </>
              )}

              {user.role === 'DOCTOR' && (
                <>
                  <Link to="/doctor/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800">
                    <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/doctor/appointments" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Patient Queue</span>
                  </Link>
                  <Link to="/doctor/calendar" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800">
                    <CalendarCheck className="w-4 h-4 text-cyan-400" />
                    <span>Schedule Settings</span>
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Admin Overview</span>
                  </Link>
                  <Link to="/admin/doctors" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800">
                    <Stethoscope className="w-4 h-4 text-amber-400" />
                    <span>Doctor Management</span>
                  </Link>
                </>
              )}

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-100">{user.name}</div>
                  <div className="text-xs text-teal-400">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs text-red-400 bg-red-950/40 rounded-lg border border-red-800/40"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-slate-800/60 hover:bg-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
