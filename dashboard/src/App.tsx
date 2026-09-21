import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import SetupAdmin from './pages/SetupAdmin';
import Dashboard from './pages/Dashboard';
import Memories from './pages/Memories';
import Users from './pages/Users';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ApiKeys from './pages/ApiKeys';
import Settings from './pages/Settings';
import { api } from './api/client';

function PrivateRoute({ children, adminOnly }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/projects" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    api.setupRequired()
      .then((res) => {
        setSetupRequired(res.setup_required);
        setApiError(null);
      })
      .catch((err) => {
        setSetupRequired(false);
        setApiError(err.message || 'Backend unreachable');
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (apiError && !user) {
    const isHtmlError = apiError.includes('Unexpected token') || apiError.includes('<!');
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-white mb-2">Cannot connect to backend</h1>
          <p className="text-slate-400 text-sm mb-4">
            {isHtmlError
              ? 'Backend returned HTML instead of JSON. Is the backend running on localhost:3000?'
              : apiError}
          </p>
          <div className="bg-slate-800 rounded-lg p-4 text-left text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-slate-200">To start the backend:</p>
            <code className="block bg-slate-950 rounded px-3 py-2 text-primary-400 font-mono">
              cd backend && npm run start:dev
            </code>
            <p className="text-slate-500 mt-2">Then refresh this page.</p>
          </div>
        </div>
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

  // If setup is NOT required and user is not logged in, redirect away from setup page to login
  if (!setupRequired && !user && location.pathname === '/setup') {
    return <Navigate to="/login" replace />;
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
        <Route index element={
          <PrivateRoute adminOnly>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="memories" element={
          <PrivateRoute adminOnly>
            <Memories />
          </PrivateRoute>
        } />
        <Route path="users" element={<Users />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="api-keys" element={<ApiKeys />} />
        <Route path="settings" element={
          <PrivateRoute adminOnly>
            <Settings />
          </PrivateRoute>
        } />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.VITE_BASENAME || '/'}>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
