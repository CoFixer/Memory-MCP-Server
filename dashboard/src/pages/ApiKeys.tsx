import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Loader2, KeyRound, CheckCircle, XCircle } from 'lucide-react';

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
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getApiKeys().then(setKeys).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">API Keys</h1>
        <p className="text-slate-400">All API keys across users</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Prefix</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Permissions</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Last Used</th>
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
            ) : keys.length ? (
              keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    {k.name}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">{k.prefix}...</td>
                  <td className="px-6 py-4 text-slate-400">{k.user?.email || '-'}</td>
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No API keys found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
