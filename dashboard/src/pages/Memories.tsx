import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Search, Filter, Loader2 } from 'lucide-react';

interface Memory {
  id: string;
  title: string | null;
  content: string;
  type: string;
  scope: string;
  session_id: string | null;
  project_id: string | null;
  user_id: string;
  created_at: string;
  user?: { email: string };
  project?: { name: string };
}

interface MemoryResponse {
  items: Memory[];
  total: number;
  limit: number;
  offset: number;
}

export default function Memories() {
  const [data, setData] = useState<MemoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    session_id: '',
    project_id: '',
    user_id: '',
    scope: '',
    type: '',
  });

  const load = (offset = 0) => {
    setLoading(true);
    setError('');
    const params: Record<string, string> = {};
    if (filters.session_id) params.session_id = filters.session_id;
    if (filters.project_id) params.project_id = filters.project_id;
    if (filters.user_id) params.user_id = filters.user_id;
    if (filters.scope) params.scope = filters.scope;
    if (filters.type) params.type = filters.type;
    params.offset = String(offset);
    params.limit = '20';
    api.getMemories(params)
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load memories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = () => load();

  const handlePrev = () => {
    if (!data) return;
    load(Math.max(0, data.offset - data.limit));
  };

  const handleNext = () => {
    if (!data) return;
    load(data.offset + data.limit);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Memories</h1>
        <p className="text-slate-400">Browse and filter memories by session, project, and more</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
            <Filter className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Session ID"
              value={filters.session_id}
              onChange={(e) => setFilters({ ...filters, session_id: e.target.value })}
              className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-32"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
            <input
              type="text"
              placeholder="Project ID"
              value={filters.project_id}
              onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}
              className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-32"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
            <input
              type="text"
              placeholder="User ID"
              value={filters.user_id}
              onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
              className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-32"
            />
          </div>
          <select
            value={filters.scope}
            onChange={(e) => setFilters({ ...filters, scope: e.target.value })}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="">All Scopes</option>
            <option value="global">Global</option>
            <option value="workspace">Workspace</option>
            <option value="project">Project</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="fact">Fact</option>
            <option value="rule">Rule</option>
            <option value="decision">Decision</option>
            <option value="preference">Preference</option>
            <option value="architecture">Architecture</option>
            <option value="convention">Convention</option>
            <option value="dependency">Dependency</option>
            <option value="configuration">Configuration</option>
            <option value="workflow">Workflow</option>
            <option value="issue">Issue</option>
            <option value="solution">Solution</option>
            <option value="note">Note</option>
          </select>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Scope</th>
                <th className="px-6 py-3">Session</th>
                <th className="px-6 py-3">Project</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data?.items.length ? (
                data.items.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white max-w-xs truncate">{m.title || 'Untitled'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300 capitalize">{m.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400 capitalize">{m.scope}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{m.session_id || '-'}</td>
                    <td className="px-6 py-4 text-slate-400">{m.project?.name || '-'}</td>
                    <td className="px-6 py-4 text-slate-400">{m.user?.email || m.user_id}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(m.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No memories found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data && (
          <div className="px-6 py-3 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {data.items.length} of {data.total}</span>
            <div className="flex gap-2">
              <button
                disabled={data.offset === 0}
                onClick={handlePrev}
                className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs disabled:opacity-30"
              >
                Previous
              </button>
              <button
                disabled={data.offset + data.limit >= data.total}
                onClick={handleNext}
                className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
