import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientDoctors from './pages/patient/PatientDoctors';
import DoctorDetails from './pages/patient/DoctorDetails';
import MyAppointments from './pages/patient/MyAppointments';
import AppointmentDetails from './pages/patient/AppointmentDetails';
import MedicationRemindersPage from './pages/patient/MedicationRemindersPage';
import CalendarConnection from './pages/patient/CalendarConnection';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorAppointmentDetails from './pages/doctor/DoctorAppointmentDetails';
import ConsultationPage from './pages/doctor/ConsultationPage';
import DoctorCalendar from './pages/doctor/DoctorCalendar';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorManagement from './pages/admin/DoctorManagement';

import NotFound from './pages/NotFound';

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
  if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Root & Auth Routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Patient Protected Routes */}
              <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientDashboard /></ProtectedRoute>} />
              <Route path="/patient/doctors" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientDoctors /></ProtectedRoute>} />
              <Route path="/patient/doctors/:id" element={<ProtectedRoute allowedRoles={['PATIENT']}><DoctorDetails /></ProtectedRoute>} />
              <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['PATIENT']}><MyAppointments /></ProtectedRoute>} />
              <Route path="/patient/appointments/:id" element={<ProtectedRoute allowedRoles={['PATIENT']}><AppointmentDetails /></ProtectedRoute>} />
              <Route path="/patient/reminders" element={<ProtectedRoute allowedRoles={['PATIENT']}><MedicationRemindersPage /></ProtectedRoute>} />
              <Route path="/patient/calendar" element={<ProtectedRoute allowedRoles={['PATIENT']}><CalendarConnection /></ProtectedRoute>} />

              {/* Doctor Protected Routes */}
              <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />
              <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorAppointments /></ProtectedRoute>} />
              <Route path="/doctor/appointments/:id" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorAppointmentDetails /></ProtectedRoute>} />
              <Route path="/doctor/consultation/:id" element={<ProtectedRoute allowedRoles={['DOCTOR']}><ConsultationPage /></ProtectedRoute>} />
              <Route path="/doctor/calendar" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorCalendar /></ProtectedRoute>} />

              {/* Admin Protected Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['ADMIN']}><DoctorManagement /></ProtectedRoute>} />

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
