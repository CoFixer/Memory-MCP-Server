import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader2, ExternalLink, Plus, X, FileText, ArrowRight } from 'lucide-react';

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'admin';
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    git_remote: '',
    repository_url: '',
    summary: '',
    product_type: '',
    target_users: '',
    business_goals: '',
    preferred_stack: '',
    deployment_target: '',
    known_modules: '',
    known_integrations: '',
    constraints: '',
    additional_notes: '',
  });
  const [prdContent, setPrdContent] = useState('');
  const [prdFileName, setPrdFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    setError('');
    const promise = isAdmin ? api.getProjects() : api.getMyProjects();
    promise
      .then(setProjects)
      .catch((err) => setError(err.message || 'Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'text/markdown' && !file.name.endsWith('.md')) {
      setError('Please upload a markdown (.md) file');
      return;
    }
    try {
      const text = await file.text();
      setPrdContent(text);
      setPrdFileName(file.name);
      setError('');
    } catch {
      setError('Failed to read file');
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Name and slug are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload: any = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        git_remote: form.git_remote.trim() || undefined,
        repository_url: form.repository_url.trim() || undefined,
        summary: form.summary.trim() || undefined,
        product_type: form.product_type.trim() || undefined,
        target_users: form.target_users.trim() || undefined,
        business_goals: form.business_goals.trim() || undefined,
        preferred_stack: form.preferred_stack.trim() || undefined,
        deployment_target: form.deployment_target.trim() || undefined,
        known_modules: form.known_modules.trim() || undefined,
        known_integrations: form.known_integrations.trim() || undefined,
        constraints: form.constraints.trim() || undefined,
        additional_notes: form.additional_notes.trim() || undefined,
        ...(prdContent.trim() ? { prd_content: prdContent.trim() } : {}),
      };
      const promise = isAdmin
        ? api.createProject({ ...payload, user_id: user!.id })
        : api.createMyProject(payload);
      await promise;
      showToast('Project created successfully', 'success');
      setShowForm(false);
      setForm({
        name: '', slug: '', description: '', git_remote: '', repository_url: '',
        summary: '', product_type: '', target_users: '', business_goals: '',
        preferred_stack: '', deployment_target: '', known_modules: '',
        known_integrations: '', constraints: '', additional_notes: '',
      });
      setPrdContent('');
      setPrdFileName('');
      load();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Projects</h1>
          <p className="text-slate-400">{isAdmin ? 'All registered projects' : 'Your projects'}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Project name"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm({ ...form, name, slug: form.slug || generateSlug(name) });
              }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Git remote URL (optional)"
              value={form.git_remote}
              onChange={(e) => setForm({ ...form, git_remote: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Repository URL (optional)"
              value={form.repository_url}
              onChange={(e) => setForm({ ...form, repository_url: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 md:col-span-2"
            />
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Project Summary (for PRD generation)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea
                placeholder="Project summary *"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                rows={3}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 md:col-span-2"
              />
              <input
                type="text"
                placeholder="Product type (e.g. web-app, api-service)"
                value={form.product_type}
                onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Target users"
                value={form.target_users}
                onChange={(e) => setForm({ ...form, target_users: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Business goals"
                value={form.business_goals}
                onChange={(e) => setForm({ ...form, business_goals: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Preferred stack (e.g. NestJS, PostgreSQL, React)"
                value={form.preferred_stack}
                onChange={(e) => setForm({ ...form, preferred_stack: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Deployment target (e.g. Docker, Dokploy, AWS)"
                value={form.deployment_target}
                onChange={(e) => setForm({ ...form, deployment_target: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Known modules"
                value={form.known_modules}
                onChange={(e) => setForm({ ...form, known_modules: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Known integrations"
                value={form.known_integrations}
                onChange={(e) => setForm({ ...form, known_integrations: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Constraints"
                value={form.constraints}
                onChange={(e) => setForm({ ...form, constraints: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Additional notes"
                value={form.additional_notes}
                onChange={(e) => setForm({ ...form, additional_notes: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              PRD Document (Markdown)
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.markdown,text/markdown"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                {prdFileName || 'Upload PRD (.md)'}
              </button>
              {prdFileName && (
                <button
                  onClick={() => { setPrdContent(''); setPrdFileName(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {prdContent && (
              <div className="mt-2 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Preview (first 200 chars):</p>
                <p className="text-sm text-slate-300 font-mono truncate">{prdContent.slice(0, 200)}...</p>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Upload a PRD markdown file. It will be stored as a project-scoped memory so OpenCode can follow it with AREG.
            </p>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
            <button
              onClick={() => { setShowForm(false); setError(''); setForm({ name: '', slug: '', description: '', git_remote: '', repository_url: '', summary: '', product_type: '', target_users: '', business_goals: '', preferred_stack: '', deployment_target: '', known_modules: '', known_integrations: '', constraints: '', additional_notes: '' }); setPrdContent(''); setPrdFileName(''); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
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
              {isAdmin && <th className="px-6 py-3">Workspace</th>}
              {isAdmin && <th className="px-6 py-3">Owner</th>}
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 6} className="px-6 py-8 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-500" />
                </td>
              </tr>
            ) : projects.length ? (
              projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    <button
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="hover:text-primary-400 transition-colors text-left"
                    >
                      {p.name}
                    </button>
                  </td>
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
                  {isAdmin && <td className="px-6 py-4 text-slate-400">{p.workspace?.name || '-'}</td>}
                  {isAdmin && <td className="px-6 py-4 text-slate-400">{p.user?.email || '-'}</td>}
                  <td className="px-6 py-4 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      View <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 8 : 6} className="px-6 py-8 text-center text-slate-500">No projects found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
