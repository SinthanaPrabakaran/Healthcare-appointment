import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadgeColor = {
    PATIENT: 'bg-emerald-100 text-emerald-800',
    DOCTOR: 'bg-blue-100 text-blue-800',
    ADMIN: 'bg-purple-100 text-purple-800'
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🏥</span>
              <span className="font-bold text-xl text-gray-900 tracking-tight">CuraHealth</span>
            </Link>

            {/* Desktop Navigation Links */}
            {user && (
              <div className="hidden md:flex md:ml-8 md:space-x-4">
                {user.role === 'PATIENT' && (
                  <>
                    <Link to="/patient/dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Dashboard</Link>
                    <Link to="/patient/doctors" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Find Doctors</Link>
                    <Link to="/patient/appointments" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">My Appointments</Link>
                    <Link to="/patient/reminders" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Medications</Link>
                    <Link to="/patient/calendar" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Google Calendar</Link>
                  </>
                )}

                {user.role === 'DOCTOR' && (
                  <>
                    <Link to="/doctor/dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Dashboard</Link>
                    <Link to="/doctor/appointments" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Patient List</Link>
                    <Link to="/doctor/calendar" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Google Calendar</Link>
                  </>
                )}

                {user.role === 'ADMIN' && (
                  <>
                    <Link to="/admin/dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Dashboard</Link>
                    <Link to="/admin/doctors" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Doctor Management</Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Profile & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                  <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${roleBadgeColor[user.role] || 'bg-gray-100'}`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Sign In</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none p-2"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && user && (
        <div className="md:hidden border-t border-gray-100 px-4 pt-2 pb-4 space-y-2 bg-white">
          {user.role === 'PATIENT' && (
            <>
              <Link to="/patient/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700">Dashboard</Link>
              <Link to="/patient/doctors" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700">Find Doctors</Link>
              <Link to="/patient/appointments" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700">My Appointments</Link>
              <Link to="/patient/reminders" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700">Medications</Link>
              <Link to="/patient/calendar" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700">Google Calendar</Link>
            </>
          )}

          {user.role === 'DOCTOR' && (
            <>
              <Link to="/doctor/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700">Dashboard</Link>
              <Link to="/doctor/appointments" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700">Patient List</Link>
              <Link to="/doctor/calendar" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700">Google Calendar</Link>
            </>
          )}

          {user.role === 'ADMIN' && (
            <>
              <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700">Dashboard</Link>
              <Link to="/admin/doctors" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700">Doctor Management</Link>
            </>
          )}

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">{user.name} ({user.role})</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm text-red-600 font-medium bg-red-50 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
