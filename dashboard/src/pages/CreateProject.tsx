import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TagInput from '../components/TagInput';
import { Loader2, FileText, X, ArrowLeft, Sparkles, Wand2 } from 'lucide-react';

export default function CreateProject() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'admin';
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    git_remote: '',
    repository_url: '',
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

  const [prdContent, setPrdContent] = useState('');
  const [prdFileName, setPrdFileName] = useState('');
  const [generatingPrd, setGeneratingPrd] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

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

  const handleGeneratePrd = async () => {
    if (!form.name.trim() && !form.summary.trim()) {
      setError('Please enter at least a Project Name or Summary before generating a PRD');
      return;
    }
    setGeneratingPrd(true);
    setError('');
    try {
      const result = await api.generatePrd({
        name: form.name,
        description: form.description,
        summary: form.summary,
        product_type: form.product_type,
        target_users: form.target_users,
        business_goals: form.business_goals,
        preferred_stack: form.preferred_stack,
        deployment_target: form.deployment_target,
        known_modules: form.known_modules,
        known_integrations: form.known_integrations,
        constraints: form.constraints,
        additional_notes: form.additional_notes,
      });

      const suggestions = result.suggestions || {};

      setForm((prev) => ({
        ...prev,
        name: suggestions.name || prev.name,
        slug: suggestions.slug || prev.slug || generateSlug(suggestions.name || prev.name),
        description: suggestions.description || prev.description,
        git_remote: suggestions.git_remote || prev.git_remote,
        repository_url: suggestions.repository_url || prev.repository_url,
        summary: suggestions.summary || prev.summary,
        product_type: suggestions.product_type?.length ? suggestions.product_type : prev.product_type,
        target_users: suggestions.target_users?.length ? suggestions.target_users : prev.target_users,
        business_goals: suggestions.business_goals?.length ? suggestions.business_goals : prev.business_goals,
        preferred_stack: suggestions.preferred_stack?.length ? suggestions.preferred_stack : prev.preferred_stack,
        deployment_target: suggestions.deployment_target?.length ? suggestions.deployment_target : prev.deployment_target,
        known_modules: suggestions.known_modules?.length ? suggestions.known_modules : prev.known_modules,
        known_integrations: suggestions.known_integrations?.length ? suggestions.known_integrations : prev.known_integrations,
        constraints: suggestions.constraints?.length ? suggestions.constraints : prev.constraints,
        additional_notes: suggestions.additional_notes || prev.additional_notes,
      }));

      if (result.prd_content) {
        setPrdContent(result.prd_content);
        setPrdFileName('generated-prd.md');
      }

      showToast('PRD generated and fields autofilled', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to generate PRD');
    } finally {
      setGeneratingPrd(false);
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
        product_type: form.product_type.join(', ') || undefined,
        target_users: form.target_users.join(', ') || undefined,
        business_goals: form.business_goals.join(', ') || undefined,
        preferred_stack: form.preferred_stack.join(', ') || undefined,
        deployment_target: form.deployment_target.join(', ') || undefined,
        known_modules: form.known_modules.join(', ') || undefined,
        known_integrations: form.known_integrations.join(', ') || undefined,
        constraints: form.constraints.join(', ') || undefined,
        additional_notes: form.additional_notes.trim() || undefined,
        ...(prdContent.trim() ? { prd_content: prdContent.trim() } : {}),
      };
      const promise = isAdmin
        ? api.createProject({ ...payload, user_id: user!.id })
        : api.createMyProject(payload);
      await promise;
      showToast('Project created successfully', 'success');
      navigate('/projects');
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-500/10 rounded-lg">
          <Sparkles className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Create Project</h1>
          <p className="text-slate-400 text-sm">Set up a new project and optionally generate a PRD</p>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {/* Basic Info */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Project Name *</label>
              <input
                type="text"
                placeholder="e.g. My Awesome App"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name,
                    slug: prev.slug || generateSlug(name),
                  }));
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Slug *</label>
              <input
                type="text"
                placeholder="my-awesome-app"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Git Remote URL</label>
              <input
                type="text"
                placeholder="https://github.com/user/repo.git"
                value={form.git_remote}
                onChange={(e) => updateField('git_remote', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Repository URL</label>
              <input
                type="text"
                placeholder="https://github.com/user/repo"
                value={form.repository_url}
                onChange={(e) => updateField('repository_url', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-slate-400">Description</label>
              <input
                type="text"
                placeholder="Short description of the project"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </section>

        {/* PRD Generation */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">PRD Generation</h2>
            </div>
            <button
              onClick={handleGeneratePrd}
              disabled={generatingPrd}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {generatingPrd && <Loader2 className="w-4 h-4 animate-spin" />}
              {!generatingPrd && <Wand2 className="w-4 h-4" />}
              {generatingPrd ? 'Generating…' : 'Generate PRD'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Project Summary *</label>
              <textarea
                placeholder="Describe what the project does, its purpose, and key features..."
                value={form.summary}
                onChange={(e) => updateField('summary', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Product Type</label>
                <TagInput
                  tags={form.product_type}
                  onChange={(tags) => updateField('product_type', tags)}
                  placeholder="e.g. web-app, api-service, mobile-app"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Target Users</label>
                <TagInput
                  tags={form.target_users}
                  onChange={(tags) => updateField('target_users', tags)}
                  placeholder="e.g. developers, small-business, enterprise"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Business Goals</label>
                <TagInput
                  tags={form.business_goals}
                  onChange={(tags) => updateField('business_goals', tags)}
                  placeholder="e.g. automate-invoicing, reduce-support-tickets"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Preferred Stack</label>
                <TagInput
                  tags={form.preferred_stack}
                  onChange={(tags) => updateField('preferred_stack', tags)}
                  placeholder="e.g. NestJS, PostgreSQL, React, Docker"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Deployment Target</label>
                <TagInput
                  tags={form.deployment_target}
                  onChange={(tags) => updateField('deployment_target', tags)}
                  placeholder="e.g. Docker, Dokploy, AWS, Vercel"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Known Modules</label>
                <TagInput
                  tags={form.known_modules}
                  onChange={(tags) => updateField('known_modules', tags)}
                  placeholder="e.g. auth, billing, notifications"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Known Integrations</label>
                <TagInput
                  tags={form.known_integrations}
                  onChange={(tags) => updateField('known_integrations', tags)}
                  placeholder="e.g. Stripe, SendGrid, Slack"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Constraints</label>
                <TagInput
                  tags={form.constraints}
                  onChange={(tags) => updateField('constraints', tags)}
                  placeholder="e.g. gdpr, hipaa, budget-limit"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Additional Notes</label>
              <textarea
                placeholder="Any other details that might help with PRD generation..."
                value={form.additional_notes}
                onChange={(e) => updateField('additional_notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </section>

        {/* PRD Upload */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">PRD Document</h2>
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
            <div className="mt-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Preview (first 200 chars):</p>
              <p className="text-sm text-slate-300 font-mono truncate">{prdContent.slice(0, 200)}...</p>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-2">
            Upload an existing PRD markdown file. It will be stored as a project-scoped memory so OpenCode can follow it with AREG.
          </p>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Project
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
