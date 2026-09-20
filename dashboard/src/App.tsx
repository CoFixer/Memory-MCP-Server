import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import SetupAdmin from './pages/SetupAdmin';
import Dashboard from './pages/Dashboard';
import Memories from './pages/Memories';
import Users from './pages/Users';
import Projects from './pages/Projects';
import ApiKeys from './pages/ApiKeys';
import Settings from './pages/Settings';
import { api } from './api/client';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.setupRequired()
      .then((res) => setSetupRequired(res.setup_required))
      .catch(() => setSetupRequired(false))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If setup is required and no user is logged in, only allow the setup page
  if (setupRequired && !user) {
    if (location.pathname === '/setup') {
      return <SetupAdmin />;
    }
    return <Navigate to="/setup" replace />;
  }

  // Authenticated users should not see login/setup pages
  if (user && (location.pathname === '/login' || location.pathname === '/setup')) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<SetupAdmin />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="memories" element={<Memories />} />
        <Route path="users" element={<Users />} />
        <Route path="projects" element={<Projects />} />
        <Route path="api-keys" element={<ApiKeys />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.VITE_BASENAME || '/'}>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
