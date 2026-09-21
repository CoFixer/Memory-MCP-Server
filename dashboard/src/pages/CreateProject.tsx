import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import TagInput from '../components/TagInput';
import { Loader2, ArrowLeft, FileText, X, Sparkles, Plus } from 'lucide-react';

export default function CreateProject() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [prdFile, setPrdFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    git_remote: '',
    repository_url: '',
    workspace_id: '',
  });

  const [prd, setPrd] = useState({
    summary: '',
    product_type: [] as string[],
    target_users: [] as string[],
    business_goals: [] as string[],
    preferred_stack: [] as string[],
    deployment_target: [] as string[],
    known_modules: [] as string[],
    known_integrations: [] as string[],
    constraints: [] as string[],
    additional_notes: '',
  });

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      showToast('Name and slug are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        git_remote: form.git_remote.trim() || undefined,
        repository_url: form.repository_url.trim() || undefined,
        workspace_id: form.workspace_id.trim() || undefined,
        metadata: {
          prd: {
            summary: prd.summary.trim() || undefined,
            product_type: prd.product_type.length ? prd.product_type : undefined,
            target_users: prd.target_users.length ? prd.target_users : undefined,
            business_goals: prd.business_goals.length ? prd.business_goals : undefined,
            preferred_stack: prd.preferred_stack.length ? prd.preferred_stack : undefined,
            deployment_target: prd.deployment_target.length ? prd.deployment_target : undefined,
            known_modules: prd.known_modules.length ? prd.known_modules : undefined,
            known_integrations: prd.known_integrations.length ? prd.known_integrations : undefined,
            constraints: prd.constraints.length ? prd.constraints : undefined,
            additional_notes: prd.additional_notes.trim() || undefined,
          },
        },
      };

      // Remove empty metadata.prd fields
      const prdEntries = Object.entries(payload.metadata.prd).filter(([, v]) => v !== undefined);
      if (prdEntries.length === 0) {
        delete payload.metadata;
      } else {
        payload.metadata.prd = Object.fromEntries(prdEntries);
      }

      await api.createProject(payload);
      showToast('Project created successfully', 'success');
      navigate('/projects');
    } catch (err: any) {
      showToast(err.message || 'Failed to create project', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create Project</h1>
          <p className="text-slate-400">Set up a new project and optionally generate a PRD</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary-400" />
            </div>
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Project Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name,
                    slug: prev.slug || generateSlug(name),
                  }));
                }}
                placeholder="My Awesome Project"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Slug <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateForm('slug', e.target.value)}
                placeholder="my-awesome-project"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-slate-300">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder="Brief description of the project..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Git Remote URL</label>
              <input
                type="text"
                value={form.git_remote}
                onChange={(e) => updateForm('git_remote', e.target.value)}
                placeholder="https://github.com/user/repo.git"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Repository URL</label>
              <input
                type="text"
                value={form.repository_url}
                onChange={(e) => updateForm('repository_url', e.target.value)}
                placeholder="https://github.com/user/repo"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </section>

        {/* PRD Generation Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            PRD Generation
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Fill in the details below to help generate a comprehensive PRD for your project.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Project Summary</label>
              <textarea
                value={prd.summary}
                onChange={(e) => setPrd((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Describe what your project does, its main features, and goals..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TagInput
                tags={prd.product_type}
                onChange={(tags) => setPrd((prev) => ({ ...prev, product_type: tags }))}
                placeholder="e.g. web-app, api-service, mobile-app"
                label="Product Type"
              />
              <TagInput
                tags={prd.target_users}
                onChange={(tags) => setPrd((prev) => ({ ...prev, target_users: tags }))}
                placeholder="e.g. developers, enterprise, consumers"
                label="Target Users"
              />
              <TagInput
                tags={prd.business_goals}
                onChange={(tags) => setPrd((prev) => ({ ...prev, business_goals: tags }))}
                placeholder="e.g. automation, revenue-growth, efficiency"
                label="Business Goals"
              />
              <TagInput
                tags={prd.preferred_stack}
                onChange={(tags) => setPrd((prev) => ({ ...prev, preferred_stack: tags }))}
                placeholder="e.g. NestJS, React, PostgreSQL, Docker"
                label="Preferred Stack"
              />
              <TagInput
                tags={prd.deployment_target}
                onChange={(tags) => setPrd((prev) => ({ ...prev, deployment_target: tags }))}
                placeholder="e.g. AWS, Vercel, Docker, Kubernetes"
                label="Deployment Target"
              />
              <TagInput
                tags={prd.known_modules}
                onChange={(tags) => setPrd((prev) => ({ ...prev, known_modules: tags }))}
                placeholder="e.g. auth, billing, notifications"
                label="Known Modules"
              />
              <TagInput
                tags={prd.known_integrations}
                onChange={(tags) => setPrd((prev) => ({ ...prev, known_integrations: tags }))}
                placeholder="e.g. Stripe, SendGrid, Slack"
                label="Known Integrations"
              />
              <TagInput
                tags={prd.constraints}
                onChange={(tags) => setPrd((prev) => ({ ...prev, constraints: tags }))}
                placeholder="e.g. gdpr, budget-limit, timeline"
                label="Constraints"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Additional Notes</label>
              <textarea
                value={prd.additional_notes}
                onChange={(e) => setPrd((prev) => ({ ...prev, additional_notes: e.target.value }))}
                placeholder="Any other important details..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>
        </section>

        {/* PRD File Upload */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            PRD Document Upload
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Already have a PRD? Upload it here instead of generating one.
          </p>

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,text/markdown"
              onChange={(e) => setPrdFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              {prdFile ? prdFile.name : 'Upload PRD (.md)'}
            </button>
            {prdFile && (
              <button
                onClick={() => {
                  setPrdFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
