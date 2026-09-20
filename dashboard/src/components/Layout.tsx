import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Brain,
  Users,
  FolderKanban,
  KeyRound,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const nav = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
  { path: '/memories', label: 'Memories', icon: Brain, adminOnly: true },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/api-keys', label: 'API Keys', icon: KeyRound },
  { path: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const visibleNav = nav.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Memory MCP</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {visibleNav.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-600/10 text-primary-400'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || user?.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
