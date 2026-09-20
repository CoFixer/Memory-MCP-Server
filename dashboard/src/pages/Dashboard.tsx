import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Users, Brain, FolderKanban, KeyRound, Layers, ArrowUpRight, TrendingUp } from 'lucide-react';

interface Stats {
  counts: {
    users: number;
    memories: number;
    projects: number;
    apiKeys: number;
    workspaces: number;
  };
  recentMemories: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    api.getStats()
      .then(setStats)
      .catch((err) => setError(err.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Users', value: stats?.counts.users ?? 0, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Memories', value: stats?.counts.memories ?? 0, icon: Brain, color: 'text-primary-400', bg: 'bg-primary-400/10' },
    { label: 'Projects', value: stats?.counts.projects ?? 0, icon: FolderKanban, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'API Keys', value: stats?.counts.apiKeys ?? 0, icon: KeyRound, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { label: 'Workspaces', value: stats?.counts.workspaces ?? 0, icon: Layers, color: 'text-violet-400', bg: 'bg-violet-400/10' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-slate-400">Overview of your Memory MCP Server</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-2xl font-bold text-white">{loading ? '-' : card.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Memories</h2>
          <a href="#/memories" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
            View all <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
        <div className="divide-y divide-slate-800">
          {loading ? (
            <div className="px-6 py-8 text-center text-slate-500">Loading...</div>
          ) : stats?.recentMemories?.length ? (
            stats.recentMemories.map((m) => (
              <div key={m.id} className="px-6 py-4 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-medium text-slate-300 capitalize">{m.type}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-medium text-slate-400 capitalize">{m.scope}</span>
                      {m.session_id && (
                        <span className="px-2 py-0.5 rounded-full bg-primary-900/30 text-xs font-medium text-primary-400">{m.session_id}</span>
                      )}
                    </div>
                    <p className="text-white font-medium truncate">{m.title || 'Untitled'}</p>
                    <p className="text-slate-500 text-sm truncate">{m.content}</p>
                  </div>
                  <span className="text-xs text-slate-600 whitespace-nowrap">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-slate-500">No memories yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
