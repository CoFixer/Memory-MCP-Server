// Read API base URL from runtime config (injected by entrypoint.sh) or fallback to build-time env
const API_BASE = (window as any).__RUNTIME_CONFIG__?.VITE_API_BASE_URL 
  || import.meta.env.VITE_API_BASE_URL 
  || 'http://localhost:3000/api/v1';

function getToken() {
  return localStorage.getItem('token');
}

function extractErrorMessage(err: any): string {
  if (typeof err?.message === 'string') return err.message;
  if (Array.isArray(err?.message)) return err.message.join('; ');
  if (typeof err?.message?.message === 'string') return err.message.message;
  if (Array.isArray(err?.message?.message)) return err.message.message.join('; ');
  if (typeof err?.error === 'string') return err.error;
  return 'Something went wrong';
}

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        throw new Error('Backend returned HTML instead of JSON. Is the backend running?');
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(extractErrorMessage(err) || `HTTP ${res.status}`);
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`Unexpected response from backend at ${url}. Is the API reachable?`);
    }
    return res.status === 204 ? null : res.json();
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        `Failed to connect to API at ${url}. ` +
        `This is usually a CORS or network issue. ` +
        `Make sure ALLOW_ORIGINS includes "${window.location.origin}" in your backend environment.`
      );
    }
    throw err;
  }
}

export const api = {
  login: (identifier: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  setupRequired: () =>
    request('/auth/setup-required'),
  setupAdmin: (data: { email: string; password: string; name?: string; username?: string }) =>
    request('/auth/setup', { method: 'POST', body: JSON.stringify(data) }),
  resetSetup: () =>
    request('/auth/reset-setup', { method: 'POST' }),

  getStats: () => request('/admin/stats'),
  getUsers: () => request('/admin/users'),
  createUser: (data: any) => request('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (id: string) => request(`/admin/users/${id}`, { method: 'DELETE' }),

  getMemories: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/admin/memories${qs}`);
  },
  getProjects: () => request('/admin/projects'),
  getProject: (id: string) => request(`/admin/projects/${id}`),
  createProject: (data: any) => request('/admin/projects', { method: 'POST', body: JSON.stringify(data) }),
  getApiKeys: () => request('/admin/api-keys'),
  createApiKey: (data: any) => request('/admin/api-keys', { method: 'POST', body: JSON.stringify(data) }),
  revokeApiKey: (id: string) => request(`/admin/api-keys/${id}`, { method: 'DELETE' }),
  getWorkspaces: () => request('/admin/workspaces'),

  // User-scoped endpoints (for normal users)
  getMyProjects: () => request('/projects'),
  getMyProject: (id: string) => request(`/projects/${id}`),
  createMyProject: (data: any) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  generatePrd: (data: any) => request('/projects/generate-prd', { method: 'POST', body: JSON.stringify(data) }),
  getMyApiKeys: () => request('/api-keys'),
  createMyApiKey: (data: any) => request('/api-keys', { method: 'POST', body: JSON.stringify(data) }),
  revokeMyApiKey: (id: string) => request(`/api-keys/${id}`, { method: 'DELETE' }),

  // Embedding Providers (admin only)
  getEmbeddingProviders: () => request('/admin/embedding-providers'),
  createEmbeddingProvider: (data: any) => request('/admin/embedding-providers', { method: 'POST', body: JSON.stringify(data) }),
  updateEmbeddingProvider: (id: string, data: any) => request(`/admin/embedding-providers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEmbeddingProvider: (id: string) => request(`/admin/embedding-providers/${id}`, { method: 'DELETE' }),
  setDefaultEmbeddingProvider: (id: string) => request(`/admin/embedding-providers/${id}/set-default`, { method: 'POST' }),
  testEmbeddingProvider: (id: string) => request(`/admin/embedding-providers/${id}/test`, { method: 'POST' }),
};
