import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Settings as SettingsIcon,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  TestTube,
  Server,
  KeyRound,
  Hash,
  Link,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface EmbeddingProvider {
  id: string;
  name: string;
  provider: 'ollama' | 'openai' | 'openrouter';
  model: string;
  base_url: string | null;
  api_key_encrypted: string | null;
  dimensions: number;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const PROVIDER_OPTIONS = [
  { value: 'ollama', label: 'Ollama (Self-hosted)', needsKey: false },
  { value: 'openai', label: 'OpenAI API', needsKey: true },
  { value: 'openrouter', label: 'OpenRouter', needsKey: true },
];

const DEFAULT_MODELS: Record<string, string> = {
  ollama: 'nomic-embed-text',
  openai: 'text-embedding-3-small',
  openrouter: 'openai/text-embedding-3-small',
};

const DEFAULT_DIMENSIONS: Record<string, number> = {
  ollama: 768,
  openai: 1536,
  openrouter: 1536,
};

const DEFAULT_BASE_URLS: Record<string, string> = {
  ollama: 'http://localhost:11434',
  openai: '',
  openrouter: 'https://openrouter.ai/api/v1',
};

export default function Settings() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'admin';

  const [providers, setProviders] = useState<EmbeddingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [testingId, setTestingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    provider: 'ollama' as 'ollama' | 'openai' | 'openrouter',
    model: DEFAULT_MODELS.ollama,
    base_url: DEFAULT_BASE_URLS.ollama,
    api_key: '',
    dimensions: DEFAULT_DIMENSIONS.ollama,
    is_active: true,
    is_default: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  async function loadProviders() {
    setLoading(true);
    try {
      const data = await api.getEmbeddingProviders();
      setProviders(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load providers', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleProviderChange(provider: 'ollama' | 'openai' | 'openrouter') {
    setForm((f) => ({
      ...f,
      provider,
      model: DEFAULT_MODELS[provider],
      dimensions: DEFAULT_DIMENSIONS[provider],
      base_url: DEFAULT_BASE_URLS[provider],
      api_key: '',
    }));
    setFormErrors({});
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.model.trim()) errors.model = 'Model is required';
    if (form.dimensions < 1) errors.dimensions = 'Dimensions must be positive';
    const needsKey = PROVIDER_OPTIONS.find((p) => p.value === form.provider)?.needsKey;
    if (needsKey && !form.api_key.trim()) errors.api_key = 'API key is required for this provider';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        base_url: form.base_url || null,
        api_key: form.api_key || null,
      };
      await api.createEmbeddingProvider(payload);
      showToast('Provider created successfully', 'success');
      setShowForm(false);
      setForm({
        name: '',
        provider: 'ollama',
        model: DEFAULT_MODELS.ollama,
        base_url: DEFAULT_BASE_URLS.ollama,
        api_key: '',
        dimensions: DEFAULT_DIMENSIONS.ollama,
        is_active: true,
        is_default: false,
      });
      await loadProviders();
    } catch (err: any) {
      showToast(err.message || 'Failed to create provider', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    try {
      await api.deleteEmbeddingProvider(id);
      showToast('Provider deleted', 'success');
      await loadProviders();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete provider', 'error');
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await api.setDefaultEmbeddingProvider(id);
      showToast('Default provider updated', 'success');
      await loadProviders();
    } catch (err: any) {
      showToast(err.message || 'Failed to set default', 'error');
    }
  }

  async function handleTest(id: string) {
    setTestingId(id);
    setTestResults((prev) => ({ ...prev, [id]: { success: false, message: '' } }));
    try {
      const result = await api.testEmbeddingProvider(id);
      setTestResults((prev) => ({ ...prev, [id]: result }));
    } catch (err: any) {
      setTestResults((prev) => ({ ...prev, [id]: { success: false, message: err.message || 'Test failed' } }));
    } finally {
      setTestingId(null);
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-slate-400">Only administrators can manage embedding providers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-slate-400">Manage embedding providers and system configuration</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-white">Embedding Providers</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Provider
          </button>
        </div>

        {showForm && (
          <div className="p-6 border-b border-slate-800 bg-slate-800/30">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">New Provider</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-primary-500"
                    placeholder="e.g. Production OpenAI"
                  />
                  {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Provider</label>
                  <select
                    value={form.provider}
                    onChange={(e) => handleProviderChange(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-primary-500"
                  >
                    {PROVIDER_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Model</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                  {formErrors.model && <p className="text-red-400 text-xs mt-1">{formErrors.model}</p>}
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Dimensions</label>
                  <input
                    type="number"
                    value={form.dimensions}
                    onChange={(e) => setForm({ ...form, dimensions: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                  {formErrors.dimensions && <p className="text-red-400 text-xs mt-1">{formErrors.dimensions}</p>}
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Base URL</label>
                  <input
                    type="text"
                    value={form.base_url}
                    onChange={(e) => setForm({ ...form, base_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-primary-500"
                    placeholder="http://localhost:11434"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    API Key {PROVIDER_OPTIONS.find((p) => p.value === form.provider)?.needsKey ? '(Required)' : '(Optional)'}
                  </label>
                  <input
                    type="password"
                    value={form.api_key}
                    onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-primary-500"
                    placeholder="sk-..."
                  />
                  {formErrors.api_key && <p className="text-red-400 text-xs mt-1">{formErrors.api_key}</p>}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded border-slate-600 bg-slate-800 text-primary-600"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                    className="rounded border-slate-600 bg-slate-800 text-primary-600"
                  />
                  Set as default
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Provider'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="divide-y divide-slate-800">
          {loading ? (
            <div className="px-6 py-8 text-center text-slate-500">Loading...</div>
          ) : providers.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500">
              No embedding providers configured. Add one to get started.
            </div>
          ) : (
            providers.map((provider) => {
              const isExpanded = expandedId === provider.id;
              const testResult = testResults[provider.id];
              const isTesting = testingId === provider.id;

              return (
                <div key={provider.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
                        <Server className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{provider.name}</p>
                          {provider.is_default && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400 text-xs font-medium flex items-center gap-1">
                              <Star className="w-3 h-3" /> Default
                            </span>
                          )}
                          {!provider.is_active && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-sm truncate">
                          {provider.provider} / {provider.model} / {provider.dimensions}d
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!provider.is_default && provider.is_active && (
                        <button
                          onClick={() => handleSetDefault(provider.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                          title="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleTest(provider.id)}
                        disabled={isTesting}
                        className="p-2 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-400/10 transition-colors disabled:opacity-50"
                        title="Test connection"
                      >
                        {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : provider.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(provider.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {testResult?.message && (
                    <div
                      className={`mt-3 px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                        testResult.success
                          ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-900/30'
                          : 'bg-red-900/20 text-red-400 border border-red-900/30'
                      }`}
                    >
                      {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {testResult.message}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Hash className="w-4 h-4" />
                        <span>ID: <span className="text-slate-300 font-mono">{provider.id}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Server className="w-4 h-4" />
                        <span>Provider: <span className="text-slate-300 capitalize">{provider.provider}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <SettingsIcon className="w-4 h-4" />
                        <span>Model: <span className="text-slate-300">{provider.model}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Hash className="w-4 h-4" />
                        <span>Dimensions: <span className="text-slate-300">{provider.dimensions}</span></span>
                      </div>
                      {provider.base_url && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Link className="w-4 h-4" />
                          <span>Base URL: <span className="text-slate-300">{provider.base_url}</span></span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-400">
                        <KeyRound className="w-4 h-4" />
                        <span>
                          API Key:{" "}
                          <span className="text-slate-300">
                            {provider.api_key_encrypted ? 'Encrypted & stored' : 'Not set'}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Active: <span className="text-slate-300">{provider.is_active ? 'Yes' : 'No'}</span></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">About Embedding Providers</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Embedding providers convert text into numerical vectors for semantic search. The default provider is used for all
          memory operations. You can switch providers without restarting the server. API keys are encrypted at rest using
          AES-256-GCM.
        </p>
      </div>
    </div>
  );
}
