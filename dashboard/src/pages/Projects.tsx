import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Loader2, ExternalLink } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  git_remote: string | null;
  repository_url: string | null;
  created_at: string;
  user?: { email: string };
  workspace?: { name: string };
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    api.getProjects()
      .then(setProjects)
      .catch((err) => setError(err.message || 'Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Projects</h1>
        <p className="text-slate-400">All registered projects</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Repository</th>
              <th className="px-6 py-3">Workspace</th>
              <th className="px-6 py-3">Owner</th>
              <th className="px-6 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-500" />
                </td>
              </tr>
            ) : projects.length ? (
              projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                  <td className="px-6 py-4 text-slate-400">{p.slug}</td>
                  <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{p.description || '-'}</td>
                  <td className="px-6 py-4">
                    {p.repository_url ? (
                      <a href={p.repository_url} target="_blank" rel="noreferrer" className="text-primary-400 hover:text-primary-300 flex items-center gap-1">
                        Link <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{p.workspace?.name || '-'}</td>
                  <td className="px-6 py-4 text-slate-400">{p.user?.email || '-'}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No projects found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
