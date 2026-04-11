import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Toaster } from 'react-hot-toast';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { isFirebaseConfigured } from './firebase';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  if (!isFirebaseConfigured) {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', textAlign: 'center', padding: '2rem' }}>
        <h1 className="text-primary" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--red)' }}>Missing Configuration</h1>
        <p className="text-secondary" style={{ maxWidth: '600px' }}>
          The application has failed to initialize Firebase because environment variables are missing. <br /><br />
          <b>If you are on Vercel:</b> Please go to your Vercel Project Settings &gt; Environment Variables and add all `VITE_FIREBASE_*` variables from your local `.env` file, then redeploy.
        </p>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/owner"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="bottom-right" />
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
