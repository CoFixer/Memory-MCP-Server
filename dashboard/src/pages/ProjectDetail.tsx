import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader2, ArrowLeft, Calendar, User, Building2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  user?: { email: string; name: string | null };
  workspace?: { name: string };
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'admin';

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    const promise = isAdmin ? api.getProject(id) : api.getMyProject(id);
    promise
      .then(setProject)
      .catch((err) => {
        setError(err.message || 'Failed to load project');
        showToast(err.message || 'Failed to load project', 'error');
      })
      .finally(() => setLoading(false));
  }, [id, isAdmin, showToast]);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
        <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error || 'Project not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{project.name}</h1>
            <p className="text-slate-400 text-sm">{project.slug}</p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {project.description && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{project.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isAdmin && project.user && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                <User className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Owner</p>
                  <p className="text-sm text-slate-300">{project.user.name || project.user.email}</p>
                </div>
              </div>
            )}

            {isAdmin && project.workspace && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                <Building2 className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Workspace</p>
                  <p className="text-sm text-slate-300">{project.workspace.name}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Created</p>
                <p className="text-sm text-slate-300">{new Date(project.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Updated</p>
                <p className="text-sm text-slate-300">{new Date(project.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
