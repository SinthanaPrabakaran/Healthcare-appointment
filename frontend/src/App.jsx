import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Example page imports (to be implemented)
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            {/* <Route path="/" element={<Home />} /> */}
            {/* <Route path="/login" element={<Login />} /> */}

            {/* Protected Routes */}
            {/* <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            /> */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
