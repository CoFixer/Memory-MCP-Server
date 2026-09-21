import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader2, KeyRound, CheckCircle, XCircle, Plus, Trash2, Copy, X } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  permissions: string[];
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  revoked_at: string | null;
  user?: { email: string };
}

export default function ApiKeys() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'admin';
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', permissions: ['memory:read', 'memory:write'] });
  const [newKey, setNewKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    const promise = isAdmin ? api.getApiKeys() : api.getMyApiKeys();
    promise
      .then(setKeys)
      .catch((err) => setError(err.message || 'Failed to load API keys'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = { name: form.name.trim(), permissions: form.permissions };
      const promise = isAdmin
        ? api.createApiKey({ ...payload, user_id: user!.id })
        : api.createMyApiKey(payload);
      const result = await promise;
      setNewKey(result.key || null);
      setForm({ name: '', permissions: ['memory:read', 'memory:write'] });
      showToast('API key created successfully', 'success');
      load();
    } catch (err: any) {
      setError(err.message || 'Failed to create API key');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this API key? This action cannot be undone.')) return;
    setError('');
    try {
      const promise = isAdmin ? api.revokeApiKey(id) : api.revokeMyApiKey(id);
      await promise;
      showToast('API key revoked', 'success');
      load();
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke API key', 'error');
    }
  };

  const togglePermission = (perm: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">API Keys</h1>
          <p className="text-slate-400">{isAdmin ? 'All API keys across users' : 'Your API keys'}</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setNewKey(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Key
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {newKey && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-400 text-sm font-medium">API Key Created — Copy it now, it won't be shown again!</span>
            <button onClick={() => setNewKey(null)} className="text-emerald-400 hover:text-emerald-300"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-slate-950 rounded-lg text-emerald-300 font-mono text-sm break-all">{newKey}</code>
            <button
              onClick={() => navigator.clipboard.writeText(newKey)}
              className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
              title="Copy"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create API Key</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Key name (e.g. OpenCode Desktop)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-slate-300 mb-2">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {['memory:read', 'memory:write'].map((perm) => (
                <button
                  key={perm}
                  onClick={() => togglePermission(perm)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    form.permissions.includes(perm)
                      ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {form.permissions.includes(perm) && <CheckCircle className="w-3 h-3 inline mr-1" />}
                  {perm}
                </button>
              ))}
            </div>
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
              onClick={() => { setShowForm(false); setError(''); }}
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
              <th className="px-6 py-3">Prefix</th>
              {isAdmin && <th className="px-6 py-3">User</th>}
              <th className="px-6 py-3">Permissions</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Last Used</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="px-6 py-8 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-500" />
                </td>
              </tr>
            ) : keys.length ? (
              keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    {k.name}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">{k.prefix}...</td>
                  {isAdmin && <td className="px-6 py-4 text-slate-400">{k.user?.email || '-'}</td>}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {k.permissions.map((perm) => (
                        <span key={perm} className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300">{perm}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {k.revoked_at ? (
                      <span className="flex items-center gap-1 text-red-400 text-xs">
                        <XCircle className="w-4 h-4" /> Revoked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs">
                        <CheckCircle className="w-4 h-4" /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(k.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    {!k.revoked_at && (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        title="Revoke"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="px-6 py-8 text-center text-slate-500">No API keys found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
