import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TagInput from '../components/TagInput';
import CheckboxGroup from '../components/CheckboxGroup';
import Modal from '../components/Modal';
import { Loader2, FileText, X, ArrowLeft, Sparkles, Wand2, Plus, Pencil } from 'lucide-react';

const TECH_STACK_OPTIONS = [
  'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt',
  'Node.js', 'NestJS', 'Express',
  'Python', 'Django', 'FastAPI',
  'Go', 'Rust', 'Java', 'Spring', '.NET',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Prisma',
  'Docker', 'Kubernetes', 'AWS', 'Vercel', 'Netlify',
  'React Native', 'Flutter',
  'OpenAI', 'LangChain', 'TensorFlow',
];

const PROJECT_TYPE_OPTIONS = [
  'Web Application',
  'Mobile App',
  'API Service',
  'CLI Tool',
  'Library / Package',
  'AI / ML Application',
  'DevOps / Infrastructure',
  'Internal Tool',
];

const DEPLOYMENT_OPTIONS = [
  'Docker',
  'Kubernetes',
  'AWS',
  'GCP',
  'Azure',
  'Vercel',
  'Netlify',
  'Self-hosted',
  'Serverless',
];

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
    summary: '',
    product_type: [] as string[],
    target_users: [] as string[],
    business_goals: [] as string[],
    preferred_stack: [] as string[],
    deployment_target: [] as string[],
    constraints: [] as string[],
    additional_notes: '',
  });

  const [summaryMode, setSummaryMode] = useState<'write' | 'upload'>('write');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [generatingPrd, setGeneratingPrd] = useState(false);

  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [modalTemp, setModalTemp] = useState<string[]>([]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const openModal = (key: keyof typeof form, initial: string[]) => {
    setModalTemp([...initial]);
    setModalOpen(key);
  };

  const saveModal = (key: keyof typeof form) => {
    updateField(key, modalTemp);
    setModalOpen(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['text/markdown', 'application/pdf', 'text/plain'];
    const validExts = ['.md', '.pdf', '.txt'];
    const isValidType = validTypes.includes(file.type);
    const isValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!isValidType && !isValidExt) {
      setError('Please upload a .md, .pdf, or .txt file');
      return;
    }
    try {
      const text = await file.text();
      updateField('summary', text);
      setUploadedFileName(file.name);
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
        summary: form.summary,
        product_type: form.product_type,
        target_users: form.target_users,
        business_goals: form.business_goals,
        preferred_stack: form.preferred_stack,
        deployment_target: form.deployment_target,
        constraints: form.constraints,
        additional_notes: form.additional_notes,
      });

      const suggestions = result.suggestions || {};

      setForm((prev) => ({
        ...prev,
        name: suggestions.name || prev.name,
        slug: suggestions.slug || prev.slug || generateSlug(suggestions.name || prev.name),
        summary: suggestions.summary || prev.summary,
        product_type: suggestions.product_type?.length ? suggestions.product_type : prev.product_type,
        target_users: suggestions.target_users?.length ? suggestions.target_users : prev.target_users,
        business_goals: suggestions.business_goals?.length ? suggestions.business_goals : prev.business_goals,
        preferred_stack: suggestions.preferred_stack?.length ? suggestions.preferred_stack : prev.preferred_stack,
        deployment_target: suggestions.deployment_target?.length ? suggestions.deployment_target : prev.deployment_target,
        constraints: suggestions.constraints?.length ? suggestions.constraints : prev.constraints,
        additional_notes: suggestions.additional_notes || prev.additional_notes,
      }));

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
        summary: form.summary.trim() || undefined,
        product_type: form.product_type.join(', ') || undefined,
        target_users: form.target_users.join(', ') || undefined,
        business_goals: form.business_goals.join(', ') || undefined,
        preferred_stack: form.preferred_stack.join(', ') || undefined,
        deployment_target: form.deployment_target.join(', ') || undefined,
        constraints: form.constraints.join(', ') || undefined,
        additional_notes: form.additional_notes.trim() || undefined,
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

  const renderChipRow = (label: string, key: keyof typeof form, _options: string[]) => {
    const values = form[key] as string[];
    const hasValues = values.length > 0;

    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400">{label}</label>
        {hasValues ? (
          <div className="flex flex-wrap items-center gap-2">
            {values.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-md"
              >
                {v}
              </span>
            ))}
            <button
              type="button"
              onClick={() => openModal(key, values)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openModal(key, values)}
            className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/50 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add {label}
          </button>
        )}
      </div>
    );
  };

  const modalConfig = [
    { key: 'product_type', title: 'Project Type', options: PROJECT_TYPE_OPTIONS },
    { key: 'preferred_stack', title: 'Tech Stack', options: TECH_STACK_OPTIONS },
    { key: 'deployment_target', title: 'Deployment Target', options: DEPLOYMENT_OPTIONS },
  ] as const;

  const activeModal = modalConfig.find((m) => m.key === modalOpen);

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
          <p className="text-slate-400 text-sm">Define a memory space for your OpenCode project</p>
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
                placeholder="e.g. E-commerce API"
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
                placeholder="e-commerce-api"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </section>

        {/* Project Context */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Project Context</h2>
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

          <div className="space-y-5">
            {/* Summary Mode Toggle */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-400">Project Summary *</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      summaryMode === 'write'
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  >
                    {summaryMode === 'write' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <input
                    type="radio"
                    name="summaryMode"
                    value="write"
                    checked={summaryMode === 'write'}
                    onChange={() => setSummaryMode('write')}
                    className="sr-only"
                  />
                  <span className="text-sm text-slate-300">Write Summary</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      summaryMode === 'upload'
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  >
                    {summaryMode === 'upload' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <input
                    type="radio"
                    name="summaryMode"
                    value="upload"
                    checked={summaryMode === 'upload'}
                    onChange={() => setSummaryMode('upload')}
                    className="sr-only"
                  />
                  <span className="text-sm text-slate-300">Upload Summary</span>
                </label>
              </div>

              {summaryMode === 'write' ? (
                <textarea
                  placeholder="Describe what the project does, its purpose, and key features..."
                  value={form.summary}
                  onChange={(e) => updateField('summary', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".md,.pdf,.txt,text/markdown,application/pdf,text/plain"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 w-full py-4 border border-dashed border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/50 transition-colors text-sm"
                  >
                    <FileText className="w-5 h-5" />
                    {uploadedFileName || 'Click to upload .md, .pdf, or .txt file'}
                  </button>
                  {uploadedFileName && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="truncate">{uploadedFileName}</span>
                      <button
                        onClick={() => {
                          updateField('summary', '');
                          setUploadedFileName('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {form.summary && uploadedFileName && (
                    <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Preview (first 200 chars):</p>
                      <p className="text-sm text-slate-300 font-mono truncate">{form.summary.slice(0, 200)}...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {renderChipRow('Project Type', 'product_type', PROJECT_TYPE_OPTIONS)}
            {renderChipRow('Tech Stack', 'preferred_stack', TECH_STACK_OPTIONS)}
            {renderChipRow('Deployment Target', 'deployment_target', DEPLOYMENT_OPTIONS)}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Target Users</label>
                <TagInput
                  tags={form.target_users}
                  onChange={(tags) => updateField('target_users', tags)}
                  placeholder="e.g. developers, small-business"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Business Goals</label>
                <TagInput
                  tags={form.business_goals}
                  onChange={(tags) => updateField('business_goals', tags)}
                  placeholder="e.g. automate-invoicing"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Constraints</label>
              <TagInput
                tags={form.constraints}
                onChange={(tags) => updateField('constraints', tags)}
                placeholder="e.g. gdpr, budget-limit"
              />
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

      {/* Checkbox Modals */}
      {activeModal && (
        <Modal
          open={!!activeModal}
          onClose={() => setModalOpen(null)}
          title={activeModal.title}
          footer={
            <>
              <button
                onClick={() => setModalOpen(null)}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => saveModal(activeModal.key as keyof typeof form)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Save
              </button>
            </>
          }
        >
          <CheckboxGroup
            options={activeModal.options}
            selected={modalTemp}
            onChange={setModalTemp}
          />
        </Modal>
      )}
    </div>
  );
}
